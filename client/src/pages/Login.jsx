import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    let sanitizedIdentifier = form.identifier.trim();
    const cleanPassword = form.password.trim();

    if (!sanitizedIdentifier.includes('@')) {
      const digits = sanitizedIdentifier.replace(/\D/g, '');
      sanitizedIdentifier = digits.length > 9 ? digits.slice(-9) : digits;
    }

    try {
      const result = await login(sanitizedIdentifier, cleanPassword);
      const greetings = {
        admin: 'Bem-vindo, Chefe da Zona! 🏆',
        superadmin: 'Bem-vindo, Mestre da Zona! 👑',
        player: 'Bem-vindo, Craque da Zona! ⚽',
        viewer: 'Bem-vindo à Zona, Torcedor! 📣'
      };
      const msg = greetings[result.user.role] || 'Bem-vindo de volta!';
      toast.success(msg);
      localStorage.setItem('bnz_welcome', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-wrapper" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 40px', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,83,0.1) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="animate-slide-up">
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="spin-ball" style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Entrar na Zona</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acede ao teu painel de torneios</p>
        </div>

        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          {/* TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <button className="active" style={{ flex: 1, padding: '16px 0', background: 'rgba(255,255,255,0.03)', color: 'var(--green)', fontWeight: 800, fontSize: 14, border: 'none', borderBottom: '2px solid var(--green)' }}>
              Entrar
            </button>
            <Link to="/register" style={{ flex: 1, padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Criar Conta
            </Link>
          </div>

          <div style={{ padding: 32 }}>
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Email ou Telemóvel</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="teu@email.com ou 84..."
                  value={form.identifier} 
                  onChange={e => setForm({ ...form, identifier: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Esqueci-me da senha?</Link>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, height: 48 }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                    <span>A entrar...</span>
                  </div>
                ) : (
                  <><LogIn size={18} /> Entrar</>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
