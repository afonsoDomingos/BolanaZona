import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck, Save, Hash } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('As senhas não coincidem.');
    if (password.length < 6) return toast.error('A senha deve ter pelo menos 6 caracteres.');
    if (code.length !== 6) return toast.error('O código deve ter 6 dígitos.');

    setLoading(true);
    try {
      await api.patch('/auth/reset-password', { code, password });
      toast.success('Senha redefinida com sucesso! Podes agora fazer login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código inválido ou expirado.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <div className="card-glass" style={{ maxWidth: 420, width: '100%', padding: 40, borderRadius: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ background: 'var(--green-subtle)', color: 'var(--green)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 className="font-syne" style={{ fontWeight: 800, fontSize: 24 }}>Nova Senha</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Introduz o código de 6 dígitos e a nova senha.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Código de Recuperação (6 dígitos)</label>
            <div style={{ position: 'relative' }}>
              <Hash size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: 48, letterSpacing: 4, fontWeight: 900 }}
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nova Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: 48 }}
                placeholder="******"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: 48 }}
                placeholder="******"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><Save size={18} /> Redefinir Senha</>}
          </button>
        </form>
      </div>
    </div>
  );
}
