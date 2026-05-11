import { useState, useEffect } from 'react';
import { Star, X, Send, Heart } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function FeedbackPopup() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ experience: '', source: '', rating: 0 });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Verificar se já respondeu ou fechou antes
    const hasFeedback = localStorage.getItem('bnz_feedback_v1');
    if (hasFeedback) return;

    // Disparar após 1 minuto (60000ms)
    const timer = setTimeout(() => {
      setShow(true);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

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

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      width: 'clamp(320px, 90vw, 400px)',
      background: 'rgba(13, 21, 41, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 200, 83, 0.3)',
      borderRadius: 24,
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      padding: 24,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚽</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Diz-nos a tua opinião!</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Leva apenas 30 segundos.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Que nota dás à plataforma?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={24} fill={form.rating >= star ? 'var(--yellow)' : 'none'} color={form.rating >= star ? 'var(--yellow)' : 'var(--text-muted)'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Como descreves a tua experiência?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['⭐ Fácil de usar', '🎨 Design Bonito', '🚀 Muito Rápido', '📱 Top no Telemóvel', '🤔 Podia ser melhor', '❌ Difícil'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setForm({ ...form, experience: form.experience.includes(tag) ? form.experience.replace(tag, '').trim() : (form.experience + ' ' + tag).trim() })}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, border: '1px solid',
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
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Onde ouviste falar de nós?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                      padding: '8px', borderRadius: 8, fontSize: 12, border: '1px solid',
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
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Algum comentário extra? (Opcional)</label>
              <textarea 
                className="form-input" 
                placeholder="Ex: Adorei os prints dos jogos!"
                style={{ fontSize: 13, minHeight: 60, borderRadius: 12, padding: 12 }}
                value={form.comment || ''}
                onChange={e => setForm({ ...form, comment: e.target.value })}
              />
            </div>

            <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44, borderRadius: 12 }}>
              Enviar Feedback <Send size={16} />
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
