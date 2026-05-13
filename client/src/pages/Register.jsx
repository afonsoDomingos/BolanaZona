import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'player', province: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await loginWithGoogle(tokenResponse.access_token, form.role);
        console.log('✅ Resposta do Servidor (Registo):', res);
        toast.success('Conta criada com o Google! ⚽');
        localStorage.setItem('bnz_welcome', 'true');
        navigate('/dashboard');
      } catch (err) {
        console.error('🔥 ERRO COMPLETO NO REGISTO GOOGLE:', err.response?.data);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Erro no registo com Google.');
      } finally { setLoading(false); }
    },
    onError: () => setError('Falha na autenticação com Google.'),
  });

  const roles = [
    { id: 'admin', title: 'Organizador', desc: 'Criar e gerir torneios', icon: '🏆' },
    { id: 'player', title: 'Jogador', desc: 'Participar em equipas', icon: '⚽' },
    { id: 'viewer', title: 'Torcedor', desc: 'Seguir classificações', icon: '📣' },
  ];

  const provinces = [
    'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 
    'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'
  ];

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 2) {
      if (!form.name || !form.phone) return setError('Nome e Telemóvel são obrigatórios.');
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    const digits = form.phone.replace(/\D/g, '');
    const sanitizedPhone = digits.length > 9 ? digits.slice(-9) : digits;
    
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, sanitizedPhone, form.password, form.role, form.province);
      localStorage.setItem('bnz_welcome', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-wrapper" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 10px 20px', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,83,0.1) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 460 }} className="animate-slide-up">
        
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="spin-ball" style={{ fontSize: 32, marginBottom: 8 }}>⚽</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Criar Conta</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Passo {step} de 3 — {step === 1 ? 'Perfil' : step === 2 ? 'Identificação' : 'Segurança'}
          </p>
        </div>

        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          {/* TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <Link to="/login" style={{ flex: 1, padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Entrar
            </Link>
            <button className="active" style={{ flex: 1, padding: '16px 0', background: 'rgba(255,255,255,0.03)', color: 'var(--green)', fontWeight: 800, fontSize: 14, border: 'none', borderBottom: '2px solid var(--green)' }}>
              Criar Conta
            </button>
          </div>

          <div style={{ padding: '20px 28px' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            {step === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="form-label" style={{ textAlign: 'center', marginBottom: 4, fontSize: 13 }}>Como pretendes usar a plataforma?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {roles.map(r => (
                    <div key={r.id} onClick={() => setForm({ ...form, role: r.id })} style={{ padding: '12px 16px', borderRadius: 14, cursor: 'pointer', transition: '0.2s', background: form.role === r.id ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (form.role === r.id ? 'var(--green)' : 'rgba(255,255,255,0.1)'), display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 20 }}>{r.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: form.role === r.id ? 'var(--green)' : '#fff' }}>{r.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (form.role === r.id ? 'var(--green)' : 'rgba(255,255,255,0.2)'), position: 'relative' }}>
                        {form.role === r.id && <div style={{ position: 'absolute', top: 3, left: 3, width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, height: 48 }}>
                  Continuar com Email <ArrowRight size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>OU</span>
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
                    Registar com o Google
                  </button>
                </div>
              </div>
            ) : step === 2 ? (
              <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input type="text" className="form-input" placeholder="O teu nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Número de Telemóvel</label>
                  <input type="tel" className="form-input" placeholder="Ex: +258 8x xxx xxxx" autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (Opcional)</label>
                  <input type="email" className="form-input" placeholder="teu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Província</label>
                  <select className="form-input" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}>
                    <option value="">Selecionar Província (Opcional)</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Voltar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Próximo <ArrowRight size={16} /></button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Mín. 6 caracteres" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Senha</label>
                  <input type="password" className="form-input" placeholder="Repete a senha" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Voltar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', height: 48 }}>
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                        <span>A criar...</span>
                      </div>
                    ) : (
                      <><UserPlus size={18} /> Criar Conta</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
