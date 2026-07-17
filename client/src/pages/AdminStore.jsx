import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, TrendingUp, Package, Users, Plus, Search, Edit, Trash2, Shield, Calendar, DollarSign, Activity, AlertTriangle, Filter, Download, ArrowUpDown } from 'lucide-react';
import ProductEditModal from '../components/ProductEditModal';

export default function AdminStore() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);
  
  // Filters for products
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [sortProducts, setSortProducts] = useState('name');
  
  // Filters for sales
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortLeads, setSortLeads] = useState('date');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, leadRes] = await Promise.all([
        api.get('/products').catch(err => {
          console.error('Erro ao carregar produtos:', err);
          return { data: [] };
        }),
        api.get('/leads').catch(err => {
          console.error('Erro ao carregar leads:', err);
          return { data: [] };
        })
      ]);
      
      const productsData = Array.isArray(prodRes.data) ? prodRes.data : [];
      const leadsData = Array.isArray(leadRes.data) ? leadRes.data : [];
      
      setProducts(productsData);
      // Filter leads to keep only those related to products
      const filteredLeads = leadsData.filter(l => l.product || l.source === 'store');
      setLeads(filteredLeads);
      
      console.log('✅ [AdminStore] Dados carregados:', { 
        products: productsData.length, 
        leads: filteredLeads.length,
        isMobile: window.innerWidth <= 768
      });
      
      // Force re-render by updating a timestamp
      window.lastDataUpdate = Date.now();
    } catch (err) {
      console.error('❌ [AdminStore] Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados do painel.');
      setProducts([]);
      setLeads([]);
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
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()))
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .filter(p => {
      if (filterStock === 'all') return true;
      if (filterStock === 'low') return (p.stock || 0) > 0 && (p.stock || 0) < 5;
      if (filterStock === 'out') return (p.stock || 0) === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortProducts === 'name') return a.name.localeCompare(b.name);
      if (sortProducts === 'price-asc') return a.price - b.price;
      if (sortProducts === 'price-desc') return b.price - a.price;
      if (sortProducts === 'stock') return (a.stock || 0) - (b.stock || 0);
      return 0;
    });

  // Debug logs for filters
  console.log('🔍 [AdminStore] Filtros aplicados:', {
    totalProducts: products.length,
    filteredProducts: filteredProducts.length,
    searchProduct,
    filterCategory,
    filterStock,
    sortProducts
  });

  const filteredLeads = leads
    .filter(l => 
      l.name.toLowerCase().includes(searchLead.toLowerCase()) || 
      l.contact.includes(searchLead) ||
      (l.product?.name && l.product.name.toLowerCase().includes(searchLead.toLowerCase()))
    )
    .filter(l => filterStatus === 'all' || l.status === filterStatus)
    .filter(l => filterPayment === 'all' || l.paymentMethod === filterPayment || (filterPayment === 'whatsapp' && !l.paymentMethod))
    .sort((a, b) => {
      if (sortLeads === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortLeads === 'amount') return (b.product?.price || 0) - (a.product?.price || 0);
      return 0;
    });

  // Debug logs for leads
  console.log('🔍 [AdminStore] Filtros de vendas aplicados:', {
    totalLeads: leads.length,
    filteredLeads: filteredLeads.length,
    searchLead,
    filterStatus,
    filterPayment,
    sortLeads,
    sampleLead: leads[0] ? { name: leads[0].name, status: leads[0].status, paymentMethod: leads[0].paymentMethod } : null
  });

  // Export to CSV
  const exportProductsCSV = () => {
    const headers = ['Nome', 'Categoria', 'Preço', 'Stock', 'Descrição', 'Checkout URL'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.category,
      p.price,
      p.stock || 0,
      p.description || '',
      p.checkoutUrl || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'produtos_bolanazona.csv';
    link.click();
  };

  const exportSalesCSV = () => {
    const headers = ['Cliente', 'Contacto', 'Produto', 'Quantidade', 'Preço Total', 'Método Pagamento', 'Estado', 'Data'];
    const rows = filteredLeads.map(l => [
      l.name,
      l.contact,
      l.product?.name || 'N/A',
      l.quantity || 1,
      ((l.product?.price || 0) * (l.quantity || 1)).toLocaleString(),
      l.paymentMethod || 'WhatsApp',
      l.status,
      new Date(l.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vendas_bolanazona.csv';
    link.click();
  };

  return (
    <div className="page animate-fade-in" style={{ background: '#0a0f14', minHeight: '100vh', color: '#ffffff', padding: '40px 0' }}>
      <div className="container">
        {/* Title / Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>Painel da Loja Oficial</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Gerir produtos, encomendas, checkout e métricas de conversão</p>
          </div>
          <div className="hide-mobile" style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}>
              Atualizar Dados
            </button>
            {activeTab === 'products' && (
              <button onClick={exportProductsCSV} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={16} /> Exportar CSV
              </button>
            )}
            {activeTab === 'sales' && (
              <button onClick={exportSalesCSV} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={16} /> Exportar CSV
              </button>
            )}
            <button onClick={() => setShowEditModal({})} className="btn btn-primary btn-sm" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <Plus size={16} /> Novo Produto
            </button>
          </div>
        </div>
        
        {/* Mobile Action Buttons */}
        <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', flex: 1, minWidth: 120 }}>
              Atualizar Dados
            </button>
            {activeTab === 'products' && (
              <button onClick={exportProductsCSV} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 120 }}>
                <Download size={16} /> Exportar CSV
              </button>
            )}
            {activeTab === 'sales' && (
              <button onClick={exportSalesCSV} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 120 }}>
                <Download size={16} /> Exportar CSV
              </button>
            )}
          </div>
          <button onClick={() => setShowEditModal({})} className="btn btn-primary btn-sm" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, width: '100%' }}>
            <Plus size={16} /> Novo Produto
          </button>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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

                  {/* Top Produtos */}
                  <div className="card-glass" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 className="font-syne" style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Top Produtos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {(() => {
                        const productSales = {};
                        leads.forEach(l => {
                          if (l.product?.name) {
                            productSales[l.product.name] = (productSales[l.product.name] || 0) + (l.quantity || 1);
                          }
                        });
                        const topProducts = Object.entries(productSales)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5);
                        
                        if (topProducts.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                              <div style={{ fontSize: 32 }}>📊</div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Sem dados de vendas</div>
                            </div>
                          );
                        }
                        
                        return topProducts.map(([name, count], idx) => (
                          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10, gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                width: 24, height: 24, borderRadius: '50%', 
                                background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: '#000',
                                flexShrink: 0
                              }}>
                                {idx + 1}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>{count} vendas</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Alertas de Stock */}
                {(() => {
                  const lowStockProducts = products.filter(p => (p.stock || 0) < 5);
                  if (lowStockProducts.length === 0) return null;
                  
                  return (
                    <div className="card-glass" style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 16, padding: 24 }}>
                      <h3 className="font-syne" style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                        <AlertTriangle size={18} /> Alertas de Stock
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {lowStockProducts.map(p => (
                          <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,68,68,0.1)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {p.image && (
                                <img src={p.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                              )}
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.category}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: (p.stock || 0) === 0 ? 'var(--red)' : 'var(--yellow)' }}>
                                {p.stock || 0} unidades
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                {(p.stock || 0) === 0 ? 'Esgotado' : 'Stock Baixo'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Search & Filters Header */}
                <div className="card-glass" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
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
                  
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select 
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', flex: 1, minWidth: 140 }}
                    >
                      <option value="all" style={{ background: '#0a0f14', color: '#fff' }}>Todas Categorias</option>
                      <option value="camisolas" style={{ background: '#0a0f14', color: '#fff' }}>Camisolas</option>
                      <option value="personalizados" style={{ background: '#0a0f14', color: '#fff' }}>Personalizados</option>
                      <option value="chuteiras" style={{ background: '#0a0f14', color: '#fff' }}>Chuteiras</option>
                      <option value="meias" style={{ background: '#0a0f14', color: '#fff' }}>Meias</option>
                      <option value="trofeus" style={{ background: '#0a0f14', color: '#fff' }}>Troféus</option>
                      <option value="bolas" style={{ background: '#0a0f14', color: '#fff' }}>Bolas</option>
                      <option value="treino" style={{ background: '#0a0f14', color: '#fff' }}>Equip. Treino</option>
                    </select>
                    
                    <select 
                      value={filterStock}
                      onChange={e => setFilterStock(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', flex: 1, minWidth: 120 }}
                    >
                      <option value="all" style={{ background: '#0a0f14', color: '#fff' }}>Todo Stock</option>
                      <option value="low" style={{ background: '#0a0f14', color: '#fff' }}>Stock Baixo (&lt;5)</option>
                      <option value="out" style={{ background: '#0a0f14', color: '#fff' }}>Esgotado</option>
                    </select>
                    
                    <select 
                      value={sortProducts}
                      onChange={e => setSortProducts(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', flex: 1, minWidth: 140 }}
                    >
                      <option value="name" style={{ background: '#0a0f14', color: '#fff' }}>Nome</option>
                      <option value="price-asc" style={{ background: '#0a0f14', color: '#fff' }}>Preço: Baixo → Alto</option>
                      <option value="price-desc" style={{ background: '#0a0f14', color: '#fff' }}>Preço: Alto → Baixo</option>
                      <option value="stock" style={{ background: '#0a0f14', color: '#fff' }}>Stock</option>
                    </select>
                  </div>
                </div>

                {/* Products Table */}
                <div className="table-wrapper card-glass" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Desktop Table */}
                  <div className="hide-mobile">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Produto</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Categoria</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Preço</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stock</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Checkout</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(p => (
                          <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ 
                                  width: 40, height: 40, borderRadius: 8, 
                                  background: 'rgba(255,255,255,0.03)', overflow: 'hidden',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={16} color="var(--text-muted)" />}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ID: {p._id.slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                {p.category}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--green)', fontSize: 13 }}>
                              {p.price.toLocaleString()} MT
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ 
                                  fontSize: 11, 
                                  fontWeight: 700, 
                                  color: (p.stock || 0) === 0 ? 'var(--red)' : (p.stock || 0) < 5 ? 'var(--yellow)' : '#fff'
                                }}>
                                  {p.stock || 0}
                                </span>
                                {(p.stock || 0) === 0 && (
                                  <AlertTriangle size={10} color="var(--red)" title="Esgotado" />
                                )}
                                {(p.stock || 0) > 0 && (p.stock || 0) < 5 && (
                                  <AlertTriangle size={10} color="var(--yellow)" title="Stock Baixo" />
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-secondary)' }}>
                              {p.checkoutUrl ? (
                                <a href={p.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                  Configurado ↗
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>WhatsApp</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexDirection: 'column' }}>
                                <button 
                                  onClick={() => setShowEditModal(p)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 11 }}
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 8px', color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)', fontSize: 11 }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ padding: '40px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 32 }}>📦</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Nenhum produto cadastrado</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5, marginBottom: 8 }}>
                                  Ainda não adicionou nenhum artigo à loja oficial. Comece por criar um novo produto!
                                </div>
                                <button onClick={() => setShowEditModal({})} className="btn btn-primary btn-sm" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#000', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto', fontSize: 12 }}>
                                  <Plus size={14} /> Criar Primeiro Produto
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Cards */}
                  <div className="show-mobile" style={{ padding: 16 }}>
                    {filteredProducts.map(p => (
                      <div key={p._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{ 
                            width: 50, height: 50, borderRadius: 8, 
                            background: 'rgba(255,255,255,0.03)', overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={20} color="var(--text-muted)" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {p._id.slice(-6)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Categoria</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{p.category}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Preço</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)' }}>{p.price.toLocaleString()} MT</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Stock</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ 
                                fontSize: 12, 
                                fontWeight: 700, 
                                color: (p.stock || 0) === 0 ? 'var(--red)' : (p.stock || 0) < 5 ? 'var(--yellow)' : '#fff'
                              }}>
                                {p.stock || 0}
                              </span>
                              {(p.stock || 0) === 0 && (
                                <AlertTriangle size={12} color="var(--red)" title="Esgotado" />
                              )}
                              {(p.stock || 0) > 0 && (p.stock || 0) < 5 && (
                                <AlertTriangle size={12} color="var(--yellow)" title="Stock Baixo" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Checkout</div>
                            <div style={{ fontSize: 11 }}>
                              {p.checkoutUrl ? (
                                <a href={p.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  Configurado ↗
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>WhatsApp</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => setShowEditModal(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 12 }}
                          >
                            <Edit size={14} /> Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, padding: '8px 12px', color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)', fontSize: 12 }}
                          >
                            <Trash2 size={14} /> Apagar
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '40px 16px' }}>
                        <div style={{ fontSize: 32 }}>📦</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Nenhum produto cadastrado</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5, marginBottom: 8 }}>
                          Ainda não adicionou nenhum artigo à loja oficial. Comece por criar um novo produto!
                        </div>
                        <button onClick={() => setShowEditModal({})} className="btn btn-primary btn-sm" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#000', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto', fontSize: 12 }}>
                          <Plus size={14} /> Criar Primeiro Produto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Search & Filters Header */}
                <div className="card-glass" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
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
                  
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select 
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', flex: 1, minWidth: 130 }}
                    >
                      <option value="all" style={{ background: '#0a0f14', color: '#fff' }}>Todos Estados</option>
                      <option value="new" style={{ background: '#0a0f14', color: '#fff' }}>Pendente</option>
                      <option value="contacted" style={{ background: '#0a0f14', color: '#fff' }}>Contactado</option>
                      <option value="converted" style={{ background: '#0a0f14', color: '#fff' }}>Pago / Entregue</option>
                      <option value="lost" style={{ background: '#0a0f14', color: '#fff' }}>Cancelado</option>
                    </select>
                    
                    <select 
                      value={filterPayment}
                      onChange={e => setFilterPayment(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', flex: 1, minWidth: 130 }}
                    >
                      <option value="all" style={{ background: '#0a0f14', color: '#fff' }}>Todos Pagamentos</option>
                      <option value="mpesa" style={{ background: '#0a0f14', color: '#fff' }}>M-Pesa</option>
                      <option value="emola" style={{ background: '#0a0f14', color: '#fff' }}>e-Mola</option>
                      <option value="card" style={{ background: '#0a0f14', color: '#fff' }}>Cartão</option>
                      <option value="crypto" style={{ background: '#0a0f14', color: '#fff' }}>Criptomoeda</option>
                      <option value="whatsapp" style={{ background: '#0a0f14', color: '#fff' }}>WhatsApp</option>
                    </select>
                    
                    <select 
                      value={sortLeads}
                      onChange={e => setSortLeads(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none', flex: 1, minWidth: 150 }}
                    >
                      <option value="date" style={{ background: '#0a0f14', color: '#fff' }}>Data (Mais Recente)</option>
                      <option value="amount" style={{ background: '#0a0f14', color: '#fff' }}>Valor (Maior Primeiro)</option>
                    </select>
                  </div>
                </div>

                {/* Sales Table */}
                <div className="table-wrapper card-glass" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Desktop Table */}
                  <div className="hide-mobile">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cliente</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Produto</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Detalhes</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pagamento</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Estado</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Data</th>
                          <th style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map(l => (
                          <tr key={l._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 1 }}>{l.contact}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.province || 'Sem Província'}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.product?.name || 'Produto Não Encontrado'}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>
                                Qtd: <strong>{l.quantity || 1}x</strong> — {((l.product?.price || 0) * (l.quantity || 1)).toLocaleString()} MT
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 11 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {l.size && <span style={{ fontSize: 10 }}>Tamanho: <strong>{l.size}</strong></span>}
                                {l.color && <span style={{ fontSize: 10 }}>Cor: <strong>{l.color}</strong></span>}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontSize: 11 }}>
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
                            <td style={{ padding: '12px 16px' }}>
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
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 10, padding: '3px 6px' }}
                              >
                                <option value="new" style={{ background: '#0a0f14', color: '#fff' }}>Pendente</option>
                                <option value="contacted" style={{ background: '#0a0f14', color: '#fff' }}>Contactado</option>
                                <option value="converted" style={{ background: '#0a0f14', color: '#fff' }}>Pago</option>
                                <option value="lost" style={{ background: '#0a0f14', color: '#fff' }}>Cancelado</option>
                              </select>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={10} />
                                {new Date(l.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <a 
                                href={`https://wa.me/${(l.contact || '').replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn btn-primary btn-sm"
                                style={{ padding: '4px 8px', fontSize: 10, background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 700 }}
                              >
                                WhatsApp
                              </a>
                            </td>
                          </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ padding: '40px 16px' }}>
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
                  
                  {/* Mobile Cards */}
                  <div className="show-mobile" style={{ padding: 16 }}>
                    {console.log('📱 [AdminStore] Renderizando cards mobile, filteredLeads:', filteredLeads.length)}
                    {filteredLeads.map(l => (
                      <div key={l._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{l.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 2 }}>{l.contact}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.province || 'Sem Província'}</div>
                          </div>
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
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 11, padding: '4px 8px', flexShrink: 0 }}
                          >
                            <option value="new" style={{ background: '#0a0f14', color: '#fff' }}>Pendente</option>
                            <option value="contacted" style={{ background: '#0a0f14', color: '#fff' }}>Contactado</option>
                            <option value="converted" style={{ background: '#0a0f14', color: '#fff' }}>Pago</option>
                            <option value="lost" style={{ background: '#0a0f14', color: '#fff' }}>Cancelado</option>
                          </select>
                        </div>
                        
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Produto</div>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{l.product?.name || 'Produto Não Encontrado'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            Qtd: <strong>{l.quantity || 1}x</strong> — {((l.product?.price || 0) * (l.quantity || 1)).toLocaleString()} MT
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Detalhes</div>
                            <div style={{ fontSize: 11 }}>
                              {l.size && <div>Tamanho: <strong>{l.size}</strong></div>}
                              {l.color && <div>Cor: <strong>{l.color}</strong></div>}
                              {!l.size && !l.color && <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Pagamento</div>
                            <div>
                              <span style={{ 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                color: l.paymentMethod === 'mpesa' ? '#e51a24' : l.paymentMethod === 'emola' ? '#ff6600' : l.paymentMethod === 'whatsapp' ? '#25D366' : 'var(--blue)',
                                fontSize: 11
                              }}>
                                {l.paymentMethod || 'WhatsApp'}
                              </span>
                              {l.paymentPhone && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{l.paymentPhone}</div>}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            {new Date(l.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <a 
                          href={`https://wa.me/${(l.contact || '').replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', padding: '10px 12px', fontSize: 12, background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                          <span style={{ fontSize: 14 }}>💬</span> Contactar no WhatsApp
                        </a>
                      </div>
                    ))}
                    {filteredLeads.length === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '40px 16px' }}>
                        <div style={{ fontSize: 40 }}>🛒</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Nenhuma encomenda registada</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>
                          {searchLead ? 'Não encontrámos nenhuma encomenda que coincida com a sua pesquisa.' : 'As intenções de compra e pedidos de checkout feitos pelos utilizadores serão listados aqui.'}
                        </div>
                      </div>
                    )}
                  </div>
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
