import { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Filter, Search, ShoppingCart, ArrowRight, Edit, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProductEditModal from '../components/ProductEditModal';
import LeadCaptureModal from '../components/LeadCaptureModal';

const categories = [
  { id: '', name: 'Todos', icon: '⚽' },
  { id: 'camisolas', name: 'Camisolas', icon: '👕' },
  { id: 'personalizados', name: 'Personalizados', icon: '🎨' },
  { id: 'chuteiras', name: 'Chuteiras', icon: '👟' },
  { id: 'meias', name: 'Meias', icon: '🧦' },
  { id: 'trofeus', name: 'Troféus', icon: '🏆' },
  { id: 'bolas', name: 'Bolas', icon: '⚽' },
  { id: 'treino', name: 'Equip. Treino', icon: '🏋️‍♂️' },
];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const loadProducts = () => {
    setLoading(true);
    api.get(`/products?category=${category}`)
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleBuy = (product) => {
    setShowLeadModal(product);
  };

  const finalizePurchase = (product, leadInfo) => {
    let details = '';
    if (leadInfo.size) details += `\n- *Tamanho:* ${leadInfo.size}`;
    if (leadInfo.color) details += `\n- *Cor:* ${leadInfo.color}`;
    if (leadInfo.province) details += `\n- *Província:* ${leadInfo.province}`;

    const message = `Olá! Meu nome é *${leadInfo.name}*. Tenho interesse no produto "*${product.name}*" que vi na loja Bola na Zona.${details}\n\nPor favor, confirmem a disponibilidade.`;
    window.open(`https://wa.me/258847877405?text=${encodeURIComponent(message)}`, '_blank');
    setShowLeadModal(null);
  };

  return (
    <div className="page animate-fade-in">
      <div className="container">
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
            <Tag size={14} color="var(--green)" />
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Loja Oficial Bola na Zona</span>
          </div>
          <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16 }}>
            Equipa-te como <span className="gradient-text">um Campeão</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px' }}>
            Artigos de alta qualidade, personalização para equipas e equipamentos oficiais para o teu torneio.
          </p>

          {isAdmin && (
            <button className="btn btn-primary" style={{ margin: '0 auto 32px', borderRadius: 100 }} onClick={() => setShowEditModal({})}>
              <Plus size={18} /> Adicionar Novo Produto
            </button>
          )}

          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="O que procuras hoje? (Ex: Camisola, Chuteira...)" 
                style={{ paddingLeft: 48, height: 56, borderRadius: 100, fontSize: 16 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {categories.map(c => (
                <button 
                  key={c.id} 
                  className={`tab ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                  style={{ whiteSpace: 'nowrap', borderRadius: 100, padding: '8px 20px' }}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛍️</div>
            <h3>Nenhum produto encontrado</h3>
            <p>Tenta mudar a categoria ou a tua pesquisa.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map((p, i) => (
              <div key={p._id} className="card animate-slide-up" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                    {isAdmin && (
                      <button onClick={() => setShowEditModal(p)} style={{ background: 'var(--blue)', color: '#fff', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        <Edit size={14} />
                      </button>
                    )}
                    <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                      {p.category.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, flex: 1 }}>{p.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>A partir de</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>{p.price.toLocaleString()} MT</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleBuy(p)}>
                      <ShoppingCart size={16} /> Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <ProductEditModal 
          product={showEditModal._id ? showEditModal : null} 
          onClose={() => setShowEditModal(null)} 
          onSaved={() => { setShowEditModal(null); loadProducts(); }} 
        />
      )}

      {showLeadModal && (
        <LeadCaptureModal 
          product={showLeadModal} 
          onClose={() => setShowLeadModal(null)} 
          onCaptured={(leadInfo) => finalizePurchase(showLeadModal, leadInfo)} 
        />
      )}
    </div>
  );
}
