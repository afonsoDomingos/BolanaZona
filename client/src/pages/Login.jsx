import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await loginWithGoogle(tokenResponse.access_token);
        console.log('✅ Resposta do Servidor:', res);
        toast.success('Entraste com o Google! ⚽');
        navigate('/dashboard');
      } catch (err) {
        console.error('🔥 ERRO COMPLETO DO GOOGLE LOGIN:', err.response?.data);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Erro no login com Google.');
      } finally { setLoading(false); }
    },
    onError: () => setError('Falha na autenticação com Google.'),
  });

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
    <div className="auth-page-wrapper" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 10px 20px', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,83,0.1) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="animate-slide-up">
        
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="spin-ball" style={{ fontSize: 32, marginBottom: 8 }}>⚽</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Entrar na Zona</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Acede ao teu painel de torneios</p>
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

          <div style={{ padding: '24px 28px' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>OU</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => googleLoginHandler()}
                  className="btn"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    height: 46,
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'var(--green)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com o Google
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
