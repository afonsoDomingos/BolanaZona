import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, MessageCircle, Phone } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentData, setSentData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Se for telemóvel, normalizar para 9 dígitos
    let sanitizedIdentifier = identifier.trim();
    if (!sanitizedIdentifier.includes('@')) {
      const digits = sanitizedIdentifier.replace(/\D/g, '');
      sanitizedIdentifier = digits.length > 9 ? digits.slice(-9) : digits;
    }

    try {
      const res = await api.post('/auth/forgot-password', { identifier: sanitizedIdentifier });
      setSentData(res.data);
      toast.success('Código gerado com sucesso!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao processar pedido.');
    } finally { setLoading(false); }
  };

  const openWhatsApp = () => {
    if (!sentData) return;
    const message = `Olá! Preciso de recuperar a minha senha no Bola na Zona. O meu código de recuperação é: *${sentData.code}*`;
    window.open(`https://wa.me/258847877405?text=${encodeURIComponent(message)}`, '_blank');
    navigate('/reset-password');
  };

  return (
    <div className="page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <div className="card-glass" style={{ maxWidth: 420, width: '100%', padding: 40, borderRadius: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ background: 'var(--green-subtle)', color: 'var(--green)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageCircle size={32} />
          </div>
          <h2 className="font-syne" style={{ fontWeight: 800, fontSize: 24 }}>Recuperar Senha</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enviaremos um código de 6 dígitos para o teu WhatsApp.</p>
        </div>

        {!sentData ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Telemóvel ou Email</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: 48 }}
                  placeholder="84... ou teu@email.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48 }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><Send size={18} /> Gerar Código</>}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,200,83,0.1)', padding: 16, borderRadius: 16, marginBottom: 24 }}>
              <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 8, fontSize: 16 }}>Código Gerado!</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 4, color: 'var(--text-primary)' }}>{sentData.code}</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Usa este código para definir a nova senha.</p>
            </div>
            
            <button onClick={openWhatsApp} className="btn btn-primary" style={{ width: '100%', background: '#25D366', borderColor: '#25D366', height: 48, marginBottom: 16 }}>
              <MessageCircle size={18} /> Receber no WhatsApp
            </button>
            
            <button onClick={() => navigate('/reset-password')} className="btn btn-secondary" style={{ width: '100%', height: 48 }}>
              Já tenho o código
            </button>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
