import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return setError('Nome e Telemóvel são obrigatórios.');
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.phone, form.password);
      toast.success('Conta criada! Bem-vindo 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'hidden',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,83,0.1) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="spin-ball" style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Criar Conta</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Passo {step} de 2 — {step === 1 ? 'Identificação' : 'Segurança'}
          </p>
        </div>

        <div className="card-glass" style={{ padding: '24px 32px' }}>
          {error && <div className="alert alert-error" style={{ marginBottom: 16, padding: '8px 12px', fontSize: 13 }}>{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" className="form-input" placeholder="O teu nome"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Telemóvel</label>
                <input type="tel" className="form-input" placeholder="Ex: +258 8x xxx xxxx"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Opcional)</label>
                <input type="email" className="form-input" placeholder="teu@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                Próximo Passo <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} className="form-input"
                    placeholder="Mín. 6 caracteres" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required
                    style={{ paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Senha</label>
                <input type="password" className="form-input" placeholder="Repete a senha"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Voltar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> A criar...</> : <><UserPlus size={16} /> Criar Conta</>}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          Já tens conta?{' '}
          <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
