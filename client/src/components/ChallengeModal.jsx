import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChallengeModal({ targetSquad, mySquads, onClose, onSuccess, initialData = null }) {
  const [form, setForm] = useState(initialData || { 
    challengerSquad: mySquads[0]?._id, 
    date: '', 
    location: '', 
    mapsLink: '',
    message: '',
    type: 'friendly',
    wagerValue: ''
  });
  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (initialData?._id) {
        res = await api.put(`/challenges/${initialData._id}`, form);
        toast.success('Desafio atualizado com sucesso! 🔄');
        onSuccess && onSuccess();
        onClose();
      } else {
        res = await api.post('/challenges', { ...form, challengedSquad: targetSquad._id });
        setSent(true);
        if (res.data.whatsappLink) {
          setWhatsappLink(res.data.whatsappLink);
          setTimeout(() => window.open(res.data.whatsappLink, '_blank'), 500);
          toast.success('Desafio enviado! O WhatsApp vai abrir agora. 📲', { duration: 5000 });
        } else {
          toast.success('Desafio enviado! O capitão adversário será notificado. ⚔️', { duration: 5000 });
        }
        onSuccess && onSuccess();
      }
    } catch {
      toast.error('Erro ao processar o desafio.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 420, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⚔️</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Desafio Lançado!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            O teu desafio foi registado na plataforma. 
            {whatsappLink ? ' O WhatsApp abriu para notificares o capitão adversário diretamente!' : ' O capitão adversário vai ver o desafio ao entrar na plataforma.'}
          </p>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', background: '#25D366', borderColor: '#25D366', marginBottom: 12, height: 52, fontSize: 16 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 10 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar via WhatsApp
            </a>
          )}
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center', height: 48 }}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 450, padding: 32 }}>
        <div className="modal-header" style={{ marginBottom: 24 }}>
          <h2 className="modal-title" style={{ fontSize: 24 }}>{initialData ? 'Editar Desafio 🔄' : 'Lançar Desafio ⚔️'}</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
          {initialData ? `Estás a editar o desafio enviado para a equipa ${initialData.challengedSquad?.name}.` : `Estás a enviar uma convocatória de amistoso para a equipa ${targetSquad.name}.`}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Qual é a tua equipa?</label>
            <select className="form-select" value={form.challengerSquad} onChange={e => setForm({...form, challengerSquad: e.target.value})} disabled={!!initialData}>
              {mySquads.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Data Sugerida</label>
              <input type="date" className="form-input" value={form.date ? new Date(form.date).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Local (Campo)</label>
              <input className="form-input" placeholder="Ex: Campo do Bairro" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Link Google Maps (Opcional)</label>
            <input className="form-input" placeholder="Cola o link da localização aqui..." value={form.mapsLink} onChange={e => setForm({...form, mapsLink: e.target.value})} />
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Tipo de Jogo</label>
              <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ background: form.type === 'wager' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255,255,255,0.05)', borderColor: form.type === 'wager' ? 'var(--yellow)' : 'rgba(255,255,255,0.1)' }}>
                <option value="friendly">Amigável 🤝</option>
                <option value="wager">Aposta / Valores 💰</option>
              </select>
            </div>
            {form.type === 'wager' && (
              <div className="form-group animate-slide-up">
                <label className="form-label">Valor da Aposta</label>
                <input className="form-input" placeholder="Ex: 500 MT" value={form.wagerValue} onChange={e => setForm({...form, wagerValue: e.target.value})} style={{ borderColor: 'var(--yellow)' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Provocação Amigável 💬</label>
            <textarea className="form-input" placeholder="Vamos ver quem manda na zona..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ height: 80, resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, height: 48 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, height: 48, background: initialData ? 'var(--yellow)' : 'var(--red)', color: initialData ? '#000' : '#fff', border: 'none' }}>
              {loading ? <span className="spinner" /> : initialData ? '🔄 Atualizar Desafio' : '⚔️ Desafiar Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
