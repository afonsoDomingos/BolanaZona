import { useState } from 'react';
import { Heart, MessageSquare, Send, Smartphone, Coffee, Star } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Support() {
  const [form, setForm] = useState({ category: 'feature', message: '', name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message) return toast.error('Escreve a tua sugestão.');
    setLoading(true);
    try {
      await api.post('/suggestions', form);
      toast.success('Obrigado! A tua sugestão foi enviada. 🚀');
      setForm({ category: 'feature', message: '', name: '', email: '' });
    } catch {
      toast.error('Erro ao enviar sugestão.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page animate-fade-in">
      <div className="container" style={{ maxWidth: 900 }}>
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16 }}>
            Apoiar & <span className="gradient-text">Melhorar</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            O Bola na Zona é feito por e para a comunidade. Ajuda-nos a crescer e a tornar o futebol do bairro cada vez mais profissional.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {/* Coluna de Apoio */}
          <div className="card" style={{ border: '1px solid rgba(255,214,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,214,0,0.1)', padding: 12, borderRadius: 12 }}>
                <Heart size={24} color="var(--yellow)" fill="var(--yellow)" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Apoiar a Iniciativa</h2>
            </div>
            
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Se gostas do projeto e queres contribuir para os custos de servidor e desenvolvimento, qualquer apoio é bem-vindo!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e60000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>M</div>
                  <span style={{ fontWeight: 700 }}>M-Pesa</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>84 787 7405</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Afonso Domingos</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff7900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>e</div>
                  <span style={{ fontWeight: 700 }}>e-Mola</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>87 964 2412</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Afonso Domingos</div>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 16, background: 'var(--green-subtle)', borderRadius: 12, border: '1px solid rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Coffee size={20} color="var(--green)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>O teu apoio ajuda-nos a manter a plataforma gratuita!</span>
            </div>
          </div>

          {/* Coluna de Sugestões */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--green-subtle)', padding: 12, borderRadius: 12 }}>
                <MessageSquare size={24} color="var(--green)" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Sugerir Melhoria</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="feature">Nova Funcionalidade</option>
                  <option value="bug">Reportar Erro</option>
                  <option value="design">Design / Interface</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">A tua Sugestão *</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Explica o que podemos melhorar ou que funcionalidade gostarias de ver..."
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  required
                />
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nome (Opcional)</label>
                  <input className="form-input" placeholder="Teu nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (Opcional)</label>
                  <input className="form-input" placeholder="Teu email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>

              <button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 8 }}>
                {loading ? 'A enviar...' : <><Send size={18} /> Enviar Sugestão</>}
              </button>
            </form>
          </div>
        </div>
        
        {/* Extra Info */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <Star size={14} /> Juntos, elevamos o futebol moçambicano ao próximo nível.
          </div>
        </div>
      </div>
    </div>
  );
}
