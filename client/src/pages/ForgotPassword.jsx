import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Token gerado com sucesso! (Ver consola para teste)');
      console.log('🔗 Link de Recuperação:', res.data.resetUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao processar pedido.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ background: 'var(--blue-soft)', color: 'var(--blue)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Mail size={32} />
          </div>
          <h2 className="font-syne" style={{ fontWeight: 800 }}>Recuperar Senha</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Insere o teu email para receberes um link de redefinição.</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Endereço de Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: 48 }}
                  placeholder="teuemail@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48 }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><Send size={18} /> Enviar Instruções</>}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 16 }}>Instruções enviadas!</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Verifica a tua caixa de entrada (ou a consola do navegador para este teste).
            </p>
            <button onClick={() => setSent(false)} className="btn btn-secondary btn-sm">Tentar outro email</button>
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
