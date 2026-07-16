import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, TrendingUp, Package, Users, Plus, Search, Edit, Trash2, Shield, Calendar, DollarSign, Activity } from 'lucide-react';
import ProductEditModal from '../components/ProductEditModal';

export default function AdminStore() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, leadRes] = await Promise.all([
        api.get('/products'),
        api.get('/leads')
      ]);
      setProducts(prodRes.data || []);
      // Filter leads to keep only those related to products
      const filteredLeads = (leadRes.data || []).filter(l => l.product || l.source === 'store');
      setLeads(filteredLeads);
    } catch (err) {
      toast.error('Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Actions
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar este produto da loja?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto removido com sucesso!');
      fetchData();
    } catch {
      toast.error('Erro ao remover produto.');
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status: newStatus });
      toast.success('Estado da encomenda atualizado!');
      fetchData();
    } catch {
      toast.error('Erro ao atualizar estado.');
    }
  };

  // Metrics Calculations
  const salesLeads = leads;
  const successfulSales = salesLeads.filter(l => l.status === 'converted');
  const pendingSales = salesLeads.filter(l => l.status === 'new' || l.status === 'contacted');

  const totalRevenue = successfulSales.reduce((sum, l) => sum + ((l.product?.price || 0) * (l.quantity || 1)), 0);
  const pendingRevenue = pendingSales.reduce((sum, l) => sum + ((l.product?.price || 0) * (l.quantity || 1)), 0);
  const conversionRate = salesLeads.length > 0 ? ((successfulSales.length / salesLeads.length) * 100).toFixed(1) : '0.0';

  // Payment method stats
  const mpesaSales = successfulSales.filter(l => l.paymentMethod === 'mpesa');
  const emolaSales = successfulSales.filter(l => l.paymentMethod === 'emola');
  const cardSales = successfulSales.filter(l => l.paymentMethod === 'card');
  const cryptoSales = successfulSales.filter(l => l.paymentMethod === 'crypto');
  const whatsappSales = successfulSales.filter(l => l.paymentMethod === 'whatsapp' || !l.paymentMethod);

  // Filters
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()));
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchLead.toLowerCase()) || 
    l.contact.includes(searchLead) ||
    (l.product?.name && l.product.name.toLowerCase().includes(searchLead.toLowerCase()))
  );

  return (
    <div className="page animate-fade-in" style={{ background: '#0a0f14', minHeight: '100vh', color: '#ffffff', padding: '40px 0' }}>
      <div className="container">
        {/* Title / Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>Painel da Loja Oficial</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Gerir produtos, encomendas, checkout e métricas de conversão</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}>
              Atualizar Dados
            </button>
            <button onClick={() => setShowEditModal({})} className="btn btn-primary btn-sm" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <Plus size={16} /> Novo Produto
            </button>
          </div>
        </div>

        {/* Tab Buttons (inspired by Lojou style) */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Início', icon: <TrendingUp size={16} /> },
            { id: 'products', label: 'Produtos', icon: <Package size={16} /> },
            { id: 'sales', label: 'Vendas & Encomendas', icon: <ShoppingBag size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: '10px',
                border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === tab.id ? 'var(--green)' : 'rgba(255,255,255,0.02)',
                color: activeTab === tab.id ? '#000000' : '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--green)' }} />
          </div>
        ) : (
          <>
            {/* Overview / Início tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* Metric Cards (Lojou Style) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vendas Confirmadas</span>
                      <ShoppingBag size={18} color="var(--green)" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{successfulSales.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Encomendas pagas e entregues</div>
                  </div>

                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Faturado</span>
                      <DollarSign size={18} color="#00C853" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#00C853' }}>{totalRevenue.toLocaleString()} MT</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Volume total de vendas pagas</div>
                  </div>

                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vendas em Análise</span>
                      <Activity size={18} color="var(--blue)" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--blue)' }}>{pendingRevenue.toLocaleString()} MT</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pendingSales.length} encomendas pendentes</div>
                  </div>

                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Taxa de Conversão</span>
                      <TrendingUp size={18} color="var(--yellow)" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--yellow)' }}>{conversionRate}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>De leads de interesse convertidos</div>
                  </div>
                </div>

                {/* Sub-grid: Methods Performance & Recent Activities */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start', flexWrap: 'wrap' }}>
                  {/* Performance por Métodos */}
                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 className="font-syne" style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Métodos de Pagamento</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { label: 'M-Pesa (📲)', count: mpesaSales.length, color: '#e51a24' },
                        { label: 'e-Mola (🧡)', count: emolaSales.length, color: '#ff6600' },
                        { label: 'Cartão de Crédito (💳)', count: cardSales.length, color: '#0056b3' },
                        { label: 'Criptomoeda (🪙)', count: cryptoSales.length, color: '#f7931a' },
                        { label: 'WhatsApp (💬)', count: whatsappSales.length, color: '#25D366' }
                      ].map(method => (
                        <div key={method.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 140, fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>{method.label}</div>
                          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${successfulSales.length > 0 ? (method.count / successfulSales.length) * 100 : 0}%`, 
                              height: '100%', 
                              background: method.color 
                            }} />
                          </div>
                          <div style={{ width: 40, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{method.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vendas Recentes */}
                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 className="font-syne" style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Últimas Transações</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {leads.slice(0, 5).map(l => (
                        <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{l.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.product?.name || 'Produto Desconhecido'} ({l.quantity || 1}x)</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)' }}>{((l.product?.price || 0) * (l.quantity || 1)).toLocaleString()} MT</div>
                            <span className={`badge ${l.status === 'converted' ? 'badge-green' : l.status === 'lost' ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: 9, padding: '2px 6px', marginTop: 4, display: 'inline-block' }}>
                              {l.status === 'converted' ? 'Pago' : l.status === 'lost' ? 'Cancelado' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {leads.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 32 }}>💸</div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Sem transações recentes</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 260, margin: '0 auto', lineHeight: 1.4 }}>
                            As vendas confirmadas e pendentes da loja oficial aparecerão listadas aqui.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Search Header */}
                <div className="card-glass" style={{ padding: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <div className="input-wrapper" style={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: 13 }}
                      placeholder="Pesquisar produtos da loja..." 
                      value={searchProduct}
                      onChange={e => setSearchProduct(e.target.value)}
                    />
                  </div>
                </div>

                {/* Products Table */}
                <div className="table-wrapper card-glass" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Produto</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Categoria</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Preço</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Checkout link</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ 
                                width: 44, height: 44, borderRadius: 8, 
                                background: 'rgba(255,255,255,0.03)', overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={18} color="var(--text-muted)" />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {p._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                              {p.category}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--green)', fontSize: 14 }}>
                            {p.price.toLocaleString()} MT
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {p.checkoutUrl ? (
                              <a href={p.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                Configurado ↗
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>WhatsApp Padrão</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => setShowEditModal(p)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: '#fff' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p._id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '6px 10px', color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '60px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                              <div style={{ fontSize: 40 }}>📦</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Nenhum produto cadastrado</div>
                              <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.5, marginBottom: 8 }}>
                                Ainda não adicionou nenhum artigo à loja oficial. Comece por criar um novo produto!
                              </div>
                              <button onClick={() => setShowEditModal({})} className="btn btn-primary btn-sm" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#000', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto' }}>
                                <Plus size={16} /> Criar Primeiro Produto
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Search Header */}
                <div className="card-glass" style={{ padding: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <div className="input-wrapper" style={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: 13 }}
                      placeholder="Pesquisar por nome de cliente, contacto ou produto..." 
                      value={searchLead}
                      onChange={e => setSearchLead(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sales Table */}
                <div className="table-wrapper card-glass" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cliente</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Produto Encomendado</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Detalhes</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pagamento</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Estado</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Data</th>
                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(l => (
                        <tr key={l._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>{l.contact}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.province || 'Sem Província'}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{l.product?.name || 'Produto Não Encontrado'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                              Qtd: <strong>{l.quantity || 1}x</strong> — {((l.product?.price || 0) * (l.quantity || 1)).toLocaleString()} MT
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 12 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {l.size && <span>Tamanho: <strong>{l.size}</strong></span>}
                              {l.color && <span>Cor: <strong>{l.color}</strong></span>}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12 }}>
                              <span style={{ 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                color: l.paymentMethod === 'mpesa' ? '#e51a24' : l.paymentMethod === 'emola' ? '#ff6600' : l.paymentMethod === 'whatsapp' ? '#25D366' : 'var(--blue)' 
                              }}>
                                {l.paymentMethod || 'WhatsApp'}
                              </span>
                              {l.paymentPhone && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{l.paymentPhone}</div>}
                              {l.paymentDetails && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{l.paymentDetails}</div>}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <select
                              value={l.status || 'new'}
                              onChange={(e) => handleUpdateLeadStatus(l._id, e.target.value)}
                              className={`badge ${
                                l.status === 'converted' 
                                  ? 'badge-green' 
                                  : l.status === 'lost' 
                                    ? 'badge-red' 
                                    : l.status === 'contacted'
                                      ? 'badge-blue'
                                      : 'badge-yellow'
                              }`}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 11, padding: '4px 8px' }}
                            >
                              <option value="new" style={{ background: '#0a0f14', color: '#fff' }}>Pendente</option>
                              <option value="contacted" style={{ background: '#0a0f14', color: '#fff' }}>Contactado</option>
                              <option value="converted" style={{ background: '#0a0f14', color: '#fff' }}>Pago / Entregue</option>
                              <option value="lost" style={{ background: '#0a0f14', color: '#fff' }}>Cancelado</option>
                            </select>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              {new Date(l.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <a 
                              href={`https://wa.me/${(l.contact || '').replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-primary btn-sm"
                              style={{ padding: '6px 12px', fontSize: 12, background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 700 }}
                            >
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ padding: '60px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                              <div style={{ fontSize: 40 }}>🛒</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Nenhuma encomenda registada</div>
                              <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.5 }}>
                                {searchLead ? 'Não encontrámos nenhuma encomenda que coincida com a sua pesquisa.' : 'As intenções de compra e pedidos de checkout feitos pelos utilizadores serão listados aqui.'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showEditModal && (
        <ProductEditModal 
          product={showEditModal._id ? showEditModal : null} 
          onClose={() => setShowEditModal(null)} 
          onSaved={() => { setShowEditModal(null); fetchData(); }} 
        />
      )}
    </div>
  );
}
