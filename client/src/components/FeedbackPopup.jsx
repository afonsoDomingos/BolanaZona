import { useState, useEffect } from 'react';
import { Star, X, Send, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function FeedbackPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ experience: '', source: '', rating: 0 });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Apenas para utilizadores autenticados
    if (!user) return;

    // Não mostrar se já deu feedback
    if (user.hasGivenFeedback) return;

    // Verificar localStorage
    const hasFeedback = localStorage.getItem('bnz_feedback_v1');
    if (hasFeedback) return;

    // Disparar após 3 minutos de uso da plataforma
    const timer = setTimeout(() => {
      setShow(true);
    }, 180000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSubmit = async () => {
    if (form.rating === 0) return toast.error('Dá-nos uma nota de 1 a 5! ⭐');
    if (!form.source) return toast.error('Diz-nos onde ouviste falar de nós.');
    if (!form.experience) return toast.error('Partilha um pouco da tua experiência.');

    try {
      await api.post('/feedbacks', form);
      setSubmitted(true);
      localStorage.setItem('bnz_feedback_v1', 'done');
      setTimeout(() => setShow(false), 3000);
    } catch (err) {
      toast.error('Erro ao enviar feedback.');
    }
  };

  const closeForever = () => {
    localStorage.setItem('bnz_feedback_v1', 'dismissed');
    setShow(false);
  };

  if (!user || !show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      width: 'clamp(290px, 88vw, 360px)',
      background: 'rgba(13, 21, 41, 0.97)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 200, 83, 0.3)',
      borderRadius: 18,
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: 16,
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <button onClick={closeForever} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
        <X size={18} />
      </button>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>❤️</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Obrigado pelo apoio!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>O teu feedback ajuda-nos a fazer o melhor futebol do bairro.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚽</div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Diz-nos a tua opinião!</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Leva apenas 30 segundos.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Que nota dás à plataforma?</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={20} fill={form.rating >= star ? 'var(--yellow)' : 'none'} color={form.rating >= star ? 'var(--yellow)' : 'var(--text-muted)'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Como descreves a tua experiência?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['⭐ Fácil de usar', '🎨 Design Bonito', '🚀 Muito Rápido', '📱 Top no Telemóvel', '🤔 Podia melhorar', '❌ Difícil'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setForm({ ...form, experience: form.experience.includes(tag) ? form.experience.replace(tag, '').trim() : (form.experience + ' ' + tag).trim() })}
                    style={{
                      padding: '4px 8px', borderRadius: 6, fontSize: 11, border: '1px solid',
                      borderColor: form.experience.includes(tag) ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                      background: form.experience.includes(tag) ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)',
                      color: form.experience.includes(tag) ? 'var(--green)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Onde ouviste falar de nós?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { id: 'social_media', label: 'Redes Sociais' },
                  { id: 'friends', label: 'Amigos' },
                  { id: 'tournament', label: 'Num Torneio' },
                  { id: 'google', label: 'Google' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setForm({ ...form, source: s.id })}
                    style={{
                      padding: '6px', borderRadius: 6, fontSize: 11, border: '1px solid',
                      borderColor: form.source === s.id ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                      background: form.source === s.id ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)',
                      color: form.source === s.id ? 'var(--green)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Algum comentário? (Opcional)</label>
              <textarea 
                className="form-input" 
                placeholder="Ex: Adorei os prints dos jogos!"
                style={{ fontSize: 12, minHeight: 44, borderRadius: 10, padding: 10 }}
                value={form.comment || ''}
                onChange={e => setForm({ ...form, comment: e.target.value })}
              />
            </div>

            <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 38, borderRadius: 10, fontSize: 13 }}>
              Enviar Feedback <Send size={14} />
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
