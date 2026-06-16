import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, ShoppingBag } from 'lucide-react';

export default function LeadCaptureModal({ product, onClose, onCaptured }) {
  const [form, setForm] = useState({ name: '', contact: '', size: '', color: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contact) return toast.error('Preenche pelo menos o Nome e Contacto.');

    setLoading(true);
    try {
      await api.post('/leads', {
        productId: product._id,
        name: form.name,
        contact: form.contact,
        size: form.size,
        color: form.color,
        province: form.province
      });
      
      await api.post('/analytics/track', {
        type: 'purchase_attempt',
        page: window.location.pathname,
        targetId: product._id,
        targetName: product.name
      }).catch(() => {});

      toast.success('Dados registados! Redirecionando...');
      onCaptured(form);
    } catch {
      toast.error('Erro ao registar interesse.');
    } finally { setLoading(false); }
  };

  // Helper for consistent input styles with dynamic focus borders
  const getInputStyle = (fieldName) => ({
    background: '#ffffff',
    border: activeField === fieldName ? '1.5px solid #000000' : '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '11px 14px',
    color: '#000000',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    boxShadow: activeField === fieldName ? '0 0 0 3px rgba(0, 0, 0, 0.05)' : 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Inter', sans-serif"
  });

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 700,
    color: '#666668',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
    display: 'block'
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal" 
        style={{ 
          maxWidth: 440, 
          background: '#ffffff', 
          color: '#000000', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0,0,0,0.04)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#000000', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ShoppingBag size={20} style={{ strokeWidth: 2.2 }} /> O Teu Carrinho
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#f5f5f7', 
              border: '1px solid #e2e8f0', 
              color: '#000000', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }} 
            onMouseEnter={e => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#000000';
            }} 
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f5f5f7';
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Product Cart Summary Item */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f5f5f7', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '9px', color: '#88888b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              Equipamento Selecionado
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#000000', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </h4>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#000000', marginTop: '4px' }}>
              {product.price.toLocaleString()} MT
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label style={labelStyle}>Nome Completo</label>
            <input 
              style={getInputStyle('name')} 
              placeholder="Ex: Afonso Domingos" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              onFocus={() => setActiveField('name')}
              onBlur={() => setActiveField(null)}
              required 
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Contacto (WhatsApp)</label>
            <input 
              style={getInputStyle('contact')} 
              placeholder="+258 8x xxx xxxx" 
              value={form.contact} 
              onChange={e => setForm({...form, contact: e.target.value})} 
              onFocus={() => setActiveField('contact')}
              onBlur={() => setActiveField(null)}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label style={labelStyle}>Tamanho</label>
              <input 
                style={getInputStyle('size')} 
                placeholder="Ex: M, L, XL, 42" 
                value={form.size} 
                onChange={e => setForm({...form, size: e.target.value})} 
                onFocus={() => setActiveField('size')}
                onBlur={() => setActiveField(null)}
              />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Cor Preferida</label>
              <input 
                style={getInputStyle('color')} 
                placeholder="Ex: Preto" 
                value={form.color} 
                onChange={e => setForm({...form, color: e.target.value})} 
                onFocus={() => setActiveField('color')}
                onBlur={() => setActiveField(null)}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Província de Entrega</label>
            <select 
              value={form.province} 
              onChange={e => setForm({...form, province: e.target.value})}
              onFocus={() => setActiveField('province')}
              onBlur={() => setActiveField(null)}
              style={{
                ...getInputStyle('province'),
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666668' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                backgroundSize: '14px',
                paddingRight: '40px'
              }}
            >
              <option value="" style={{ background: '#ffffff', color: '#000000' }}>Selecionar Província</option>
              <option value="Maputo Cidade" style={{ background: '#ffffff', color: '#000000' }}>Maputo Cidade</option>
              <option value="Maputo Província" style={{ background: '#ffffff', color: '#000000' }}>Maputo Província</option>
              <option value="Gaza" style={{ background: '#ffffff', color: '#000000' }}>Gaza</option>
              <option value="Inhambane" style={{ background: '#ffffff', color: '#000000' }}>Inhambane</option>
              <option value="Manica" style={{ background: '#ffffff', color: '#000000' }}>Manica</option>
              <option value="Sofala" style={{ background: '#ffffff', color: '#000000' }}>Sofala</option>
              <option value="Tete" style={{ background: '#ffffff', color: '#000000' }}>Tete</option>
              <option value="Zambézia" style={{ background: '#ffffff', color: '#000000' }}>Zambézia</option>
              <option value="Nampula" style={{ background: '#ffffff', color: '#000000' }}>Nampula</option>
              <option value="Niassa" style={{ background: '#ffffff', color: '#000000' }}>Niassa</option>
              <option value="Cabo Delgado" style={{ background: '#ffffff', color: '#000000' }}>Cabo Delgado</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              background: '#000000', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', 
              gap: '10px',
              height: '48px', 
              fontSize: '13px',
              fontWeight: 700, 
              marginTop: '8px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              if(!loading) {
                e.currentTarget.style.background = '#222222';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              if(!loading) {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {loading ? (
              <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#ffffff' }} />
            ) : (
              <>
                <ShoppingBag size={16} style={{ strokeWidth: 2.2 }} /> Finalizar Compra no WhatsApp
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

