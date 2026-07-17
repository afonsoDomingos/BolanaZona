import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, ShoppingBag } from 'lucide-react';

export default function LeadCaptureModal({ product, onClose, onCaptured }) {
  const [form, setForm] = useState({ name: '', contact: '', size: '', color: '', province: '' });
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = product.price * quantity;

  // Atualizar contador do carrinho
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckoutSubmit = async (e, checkoutType) => {
    if (e) e.preventDefault();
    if (!form.name || !form.contact) return toast.error('Preenche pelo menos o Nome e Contacto.');

    if (checkoutType === 'direct') {
      setLoading(true);
      try {
        await api.post('/leads', {
          productId: product._id,
          name: form.name,
          contact: form.contact,
          size: form.size,
          color: form.color,
          province: form.province,
          quantity: quantity,
          checkoutType: 'direct',
          paymentMethod: 'external'
        });
        toast.success('Redirecionando...');
        onCaptured({ ...form, quantity }, 'direct');
      } catch {
        toast.error('Erro ao processar checkout.');
      } finally { setLoading(false); }
      return;
    }

    if ((paymentMethod === 'mpesa' || paymentMethod === 'emola') && !paymentPhone) {
      return toast.error('Insere o número de telemóvel para pagamento.');
    }

    setLoading(true);
    try {
      const paymentDetailsStr = paymentMethod === 'card' 
        ? `Cartão (Final ${cardNumber.slice(-4)})` 
        : paymentMethod === 'crypto' 
          ? 'USDT TRC20 Wallet' 
          : '';

      await api.post('/leads', {
        productId: product._id,
        name: form.name,
        contact: form.contact,
        size: form.size,
        color: form.color,
        province: form.province,
        quantity: quantity,
        checkoutType: paymentMethod === 'whatsapp' ? 'whatsapp' : 'native',
        paymentMethod: paymentMethod,
        paymentPhone: paymentPhone || form.contact,
        paymentDetails: paymentDetailsStr
      });
      
      await api.post('/analytics/track', {
        type: 'purchase_attempt',
        page: window.location.pathname,
        targetId: product._id,
        targetName: product.name,
        metadata: { checkoutType: 'native', paymentMethod }
      }).catch(() => {});

      toast.success('Dados registados!');
      setIsSuccess(true);
      
      // Remover do carrinho após compra bem-sucedida
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = cart.filter(item => item._id !== product._id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
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

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0, 200, 83, 0.1)', border: '2px solid #00C853', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C853', fontSize: 24, fontWeight: 'bold' }}>
              ✓
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#000000', margin: '0 0 4px' }}>Encomenda Registada!</h3>
              <p style={{ fontSize: '13px', color: '#666668', margin: 0, lineHeight: 1.4 }}>
                O teu pedido para <strong>{product.name}</strong> foi submetido com sucesso.
              </p>
            </div>

            <div style={{ background: '#f5f5f7', border: '1px solid #e2e8f0', width: '100%', borderRadius: 12, padding: 14, textAlign: 'left', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666668' }}>Método de Pagamento:</span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', color: '#00C853' }}>{paymentMethod}</span>
              </div>
              {(paymentMethod === 'mpesa' || paymentMethod === 'emola') && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666668' }}>Número de Pagamento:</span>
                  <span style={{ fontWeight: 700 }}>{paymentPhone}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666668' }}>Cliente:</span>
                <span style={{ fontWeight: 700 }}>{form.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666668' }}>Contacto:</span>
                <span style={{ fontWeight: 700 }}>{form.contact}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                <span style={{ color: '#666668', fontWeight: 600 }}>Total:</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#000000' }}>{totalPrice.toLocaleString()} MT</span>
              </div>
            </div>

            <p style={{ fontSize: 11, color: '#88888b', margin: 0, lineHeight: 1.4 }}>
              {paymentMethod === 'mpesa' || paymentMethod === 'emola' 
                ? "Por favor, valida a notificação de pagamento PIN no teu telemóvel para autorizar a transação." 
                : paymentMethod === 'whatsapp' 
                  ? "O WhatsApp será aberto para enviares a mensagem de encomenda."
                  : "A nossa equipa entrará em contacto pelo WhatsApp para processar a entrega."}
            </p>

            <button
              onClick={() => {
                onClose();
                if (paymentMethod === 'whatsapp') {
                  onCaptured({ ...form, quantity }, 'whatsapp');
                } else {
                  onCaptured({ ...form, quantity }, 'native');
                }
              }}
              style={{
                width: '100%',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                height: '46px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 8
              }}
            >
              Concluir
            </button>
          </div>
        ) : (
          <>
            {/* Product Cart Summary Item */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f5f5f7', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#000000' }}>
                    {totalPrice.toLocaleString()} MT
                  </div>
                  
                  {/* Seletor de Quantidade */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{
                        background: 'none', border: 'none', width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontWeight: 'bold', color: '#000000', fontSize: '14px',
                        userSelect: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: '#000000', userSelect: 'none' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      style={{
                        background: 'none', border: 'none', width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontWeight: 'bold', color: '#000000', fontSize: '14px',
                        userSelect: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    placeholder="Ex: M, L, XL" 
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

              {/* Payment Methods Section */}
              <div className="form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 8 }}>
                <label style={labelStyle}>Método de Pagamento</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))', gap: 6, marginBottom: 12 }}>
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
                    { id: 'mpesa', label: 'M-Pesa', icon: '📲', color: '#e51a24' },
                    { id: 'emola', label: 'e-Mola', icon: '🧡', color: '#ff6600' },
                    { id: 'card', label: 'Cartão', icon: '💳', color: '#0056b3' },
                    { id: 'crypto', label: 'Crypto', icon: '🪙', color: '#f7931a' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: paymentMethod === m.id ? `2px solid ${m.color}` : '1px solid #e2e8f0',
                        background: paymentMethod === m.id ? `${m.color}08` : '#ffffff',
                        color: '#000000',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* M-Pesa / e-Mola dynamic inputs */}
              {(paymentMethod === 'mpesa' || paymentMethod === 'emola') && (
                <div className="form-group" style={{ animation: 'fadeIn 0.2s ease' }}>
                  <label style={labelStyle}>Número de Telefone (9 dígitos)</label>
                  <input
                    style={getInputStyle('paymentPhone')}
                    placeholder="Ex: 84xxxxxxx"
                    value={paymentPhone}
                    onChange={e => setPaymentPhone(e.target.value)}
                    onFocus={() => setActiveField('paymentPhone')}
                    onBlur={() => setActiveField(null)}
                    maxLength={9}
                    required
                  />
                </div>
              )}

              {/* Card inputs */}
              {paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.2s ease' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Número do Cartão</label>
                    <input
                      style={getInputStyle('cardNumber')}
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      onFocus={() => setActiveField('cardNumber')}
                      onBlur={() => setActiveField(null)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label style={labelStyle}>Validade</label>
                      <input
                        style={getInputStyle('cardExpiry')}
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        onFocus={() => setActiveField('cardExpiry')}
                        onBlur={() => setActiveField(null)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={labelStyle}>CVV</label>
                      <input
                        style={getInputStyle('cardCvv')}
                        placeholder="xxx"
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        onFocus={() => setActiveField('cardCvv')}
                        onBlur={() => setActiveField(null)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Crypto info */}
              {paymentMethod === 'crypto' && (
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6, animation: 'fadeIn 0.2s ease' }}>
                  <div>Envia o pagamento de <strong>{totalPrice.toLocaleString()} MT</strong> correspondente para:</div>
                  <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 600, fontSize: 10, wordBreak: 'break-all', userSelect: 'all' }}>
                    USDT TRC20: TYV5dghf99wJ7K99dUSDT
                  </div>
                  <div>O pagamento será validado após entrares em contacto.</div>
                </div>
              )}

              <button 
                type="button" 
                onClick={(e) => handleCheckoutSubmit(e, 'native')}
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  background: '#00C853', 
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
                  boxShadow: '0 4px 12px rgba(0,200,83,0.2)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  if(!loading) {
                    e.currentTarget.style.background = '#00b047';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if(!loading) {
                    e.currentTarget.style.background = '#00C853';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#ffffff' }} />
                ) : (
                  <>
                    <ShoppingBag size={16} style={{ strokeWidth: 2.2 }} /> {paymentMethod === 'whatsapp' ? 'Finalizar Compra no WhatsApp' : 'Comprar Agora'}
                  </>
                )}
              </button>

              {product.checkoutUrl && (
                <button 
                  type="button" 
                  onClick={(e) => handleCheckoutSubmit(e, 'direct')}
                  disabled={loading} 
                  style={{ 
                    width: '100%', 
                    background: 'transparent', 
                    color: '#000000', 
                    border: '2px solid #000000', 
                    borderRadius: '8px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', 
                    gap: '10px',
                    height: '48px', 
                    fontSize: '13px',
                    fontWeight: 700, 
                    marginTop: '4px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    if(!loading) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if(!loading) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  {loading ? (
                    <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#000000' }} />
                  ) : (
                    <>
                      💳 Ir para o Checkout Direto
                    </>
                  )}
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
