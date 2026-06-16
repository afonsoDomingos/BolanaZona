import { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Search, Edit, Plus } from 'lucide-react';
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
  const isAdmin = user?.role === 'superadmin';

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

  const finalizePurchase = async (product, leadInfo) => {
    // 1. Enviar para a BD como Lead para não perder o contacto
    try {
      await api.post('/leads', {
        productId: product._id,
        name: leadInfo.name,
        contact: leadInfo.contact,
        size: leadInfo.size,
        color: leadInfo.color,
        province: leadInfo.province
      });
      console.log('✅ Lead capturada com sucesso');
    } catch (err) {
      console.error('❌ Falha ao capturar lead:', err);
    }

    // 2. Preparar e abrir WhatsApp
    let details = '';
    if (leadInfo.size) details += `\n- *Tamanho:* ${leadInfo.size}`;
    if (leadInfo.color) details += `\n- *Cor:* ${leadInfo.color}`;
    if (leadInfo.province) details += `\n- *Província:* ${leadInfo.province}`;

    const message = `Olá! Meu nome é *${leadInfo.name}*. Tenho interesse no produto "*${product.name}*" que vi na loja Bola na Zona.${details}\n\nPor favor, confirmem a disponibilidade.`;
    window.open(`https://wa.me/258847877405?text=${encodeURIComponent(message)}`, '_blank');
    setShowLeadModal(null);
  };

  return (
    <div className="page store-light-page animate-fade-in" style={{ background: '#ffffff', color: '#000000', minHeight: '100vh', padding: '60px 0 100px', transition: 'background-color 0.3s ease' }}>
      <style>{`
        .store-light-page {
          background: #ffffff !important;
          color: #000000 !important;
        }
        .store-light-page .form-input::placeholder {
          color: #88888b !important;
        }
        .store-light-page .form-input:focus {
          border-color: #000000 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
      <div className="container">
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f5f5f7', border: '1px solid #e2e8f0', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
            <Tag size={14} color="#000000" />
            <span style={{ fontSize: 13, color: '#000000', fontWeight: 600 }}>Loja Oficial Bola na Zona</span>
          </div>
          <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16, color: '#000000' }}>
            Equipa-te como <span style={{ background: 'linear-gradient(135deg, #000000, #333333)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>um Campeão</span>
          </h1>
          <p style={{ color: '#666668', maxWidth: 600, margin: '0 auto 32px' }}>
            Artigos de alta qualidade, personalização para equipas e equipamentos oficiais para o teu torneio.
          </p>

          {isAdmin && (
            <button className="btn" style={{ margin: '0 auto 32px', borderRadius: 100, background: '#000000', color: '#ffffff', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setShowEditModal({})}>
              <Plus size={18} /> Adicionar Novo Produto
            </button>
          )}

          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#88888b' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="O que procuras hoje? (Ex: Camisola, Chuteira...)" 
                style={{ paddingLeft: 48, height: 56, borderRadius: 100, fontSize: 16, background: '#ffffff', border: '1px solid #e2e8f0', color: '#000000', boxShadow: 'none' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', justifyContent: 'center' }}>
              {categories.map(c => (
                <button 
                  key={c.id} 
                  className={`tab ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                  style={{ 
                    whiteSpace: 'nowrap', 
                    borderRadius: 100, 
                    padding: '10px 24px', 
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: category === c.id ? '#000000' : '#ffffff',
                    color: category === c.id ? '#ffffff' : '#666668',
                    border: category === c.id ? '1px solid #000000' : '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subheader bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '1px solid #f0f0f2', paddingBottom: 24, flexWrap: 'wrap', gap: 16, marginTop: 40 }}>
          <div style={{ fontSize: 13, color: '#666668', fontWeight: 500 }}>
            {filtered.length} itens encontrados
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#000000' }}>
              ⚙️ Filtros <span style={{ background: '#000000', color: '#ffffff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginLeft: 4 }}>0</span>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#000000', display: 'flex', alignItems: 'center', gap: 8 }}>
              Novidades <span style={{ fontSize: 10 }}>▼</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛍️</div>
            <h3 style={{ color: '#000000' }}>Nenhum produto encontrado</h3>
            <p style={{ color: '#666668' }}>Tenta mudar a categoria ou a tua pesquisa.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
            {filtered.map((p, i) => (
              <div key={p._id} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Image wrapper with light grey background */}
                <div style={{ height: 260, overflow: 'hidden', position: 'relative', background: '#f5f5f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f0f0f2' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center', zIndex: 10 }}>
                    {isAdmin && (
                      <button onClick={() => setShowEditModal(p)} style={{ background: '#000000', color: '#fff', border: '1px solid #e2e8f0', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.background = '#222'} onMouseLeave={e => e.currentTarget.style.background = '#000'}>
                        <Edit size={12} />
                      </button>
                    )}
                    <div style={{ background: 'rgba(255,255,255,0.9)', color: '#000000', padding: '4px 12px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', border: '1px solid #e2e8f0', letterSpacing: 0.5 }}>
                      {p.category}
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#88888b', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', marginTop: '16px' }}>
                    Bola na Zona
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#000000', marginBottom: '8px', lineHeight: '1.3', minHeight: '40px' }}>
                    {p.name}
                  </h3>
                  
                  {/* Color swatches */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {['#000000', '#ffffff', '#2e5a44', '#7d2e2e'].map((color, idx) => (
                      <span key={idx} style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1px solid #dcdcdf', display: 'inline-block', cursor: 'pointer', transition: 'transform 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    ))}
                  </div>

                  {/* Price & Buy button container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#000000' }}>
                      {p.price.toLocaleString()} MT
                    </div>
                    <button onClick={() => handleBuy(p)} className="btn" style={{ width: '100%', background: '#1a1a1c', color: '#ffffff', border: 'none', borderRadius: '8px', justifyContent: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'background-color 0.2s ease', boxShadow: 'none', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#000000'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1a1c'}>
                      <ShoppingBag size={14} /> Adicionar ao Carrinho
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
