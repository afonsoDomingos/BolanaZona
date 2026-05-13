import { useState, useEffect } from 'react';
import { Shield, Search, MapPin, Swords } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Clubs() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(null);
  
  const { user } = useAuth();
  const [mySquads, setMySquads] = useState([]);

  useEffect(() => {
    fetchSquads();
    if (user) {
      api.get('/squads/my-squads').then(res => setMySquads(res.data)).catch(() => {});
    }
  }, [user]);

  const fetchSquads = async () => {
    try {
      const res = await api.get('/squads/public-all');
      setSquads(res.data);
    } catch {
      toast.error('Erro ao carregar a comunidade de clubes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSquads = squads.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.neighborhood && s.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{ background: 'var(--green-subtle)', borderBottom: '1px solid rgba(0,200,83,0.1)', padding: '60px 0 40px', marginBottom: 40, textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,200,83,0.2)', color: 'var(--green)', padding: '6px 16px', borderRadius: 100, fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
            <Swords size={16} style={{ marginRight: 8 }} /> Sistema de Desafios Ativo
          </div>
          <h1 className="font-syne" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>A Liga <span style={{ color: 'var(--green)' }}>Nacional</span></h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40 }}>
            Explora as equipas oficiais da plataforma, encontra adversários no teu bairro e lança desafios diretos para provares quem manda na zona.
          </p>
          
          <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
            <Search size={20} color="var(--green)" style={{ position: 'absolute', left: 20, top: 20 }} />
            <input 
              className="form-input" 
              placeholder="Procurar equipa ou bairro..." 
              style={{ paddingLeft: 56, height: 60, fontSize: 16, borderRadius: 100, border: '2px solid rgba(0,200,83,0.3)', background: 'rgba(0,0,0,0.4)', boxShadow: '0 8px 32px rgba(0,200,83,0.1)' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filteredSquads.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} color="var(--text-muted)" />
            <h3>Nenhum clube encontrado</h3>
          </div>
        ) : (
          <div className="grid">
            {filteredSquads.map(squad => (
              <div key={squad._id} className="card-glass hover-scale" style={{ display: 'flex', flexDirection: 'column', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `2px solid ${squad.color || 'var(--green)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={36} color={squad.color || 'var(--green)'} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>{squad.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <MapPin size={14} color="var(--green)" /> {squad.neighborhood || 'Luanda'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 900 }}>{squad.stats?.wins || 0}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vitórias</div></div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 900 }}>{squad.stats?.matchesPlayed || 0}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Jogos</div></div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 900, color: 'var(--yellow)' }}>{squad.stats?.tournamentsWon || 0}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Títulos</div></div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: 48 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  onClick={() => {
                    if (!user) return toast.error('Faz login para desafiar este clube!');
                    if (mySquads.length === 0) return toast.error('Tens de criar um Clube primeiro no teu Dashboard!');
                    if (mySquads.find(ms => ms._id === squad._id)) return toast.error('Não podes desafiar o teu próprio clube!');
                    setShowChallengeModal(squad);
                  }}
                >
                  <Swords size={18} /> Lançar Desafio
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showChallengeModal && (
        <ChallengeModal 
          targetSquad={showChallengeModal} 
          mySquads={mySquads} 
          onClose={() => setShowChallengeModal(null)} 
        />
      )}
    </div>
  );
}

function ChallengeModal({ targetSquad, mySquads, onClose }) {
  const [form, setForm] = useState({ challengerSquad: mySquads[0]?._id, date: '', location: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/challenges', { ...form, challengedSquad: targetSquad._id });
      toast.success('Desafio lançado! As notificações foram enviadas. ⚔️', { duration: 5000 });
      onClose();
    } catch {
      toast.error('Erro ao lançar desafio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 450, padding: 32 }}>
        <div className="modal-header" style={{ marginBottom: 24 }}>
          <h2 className="modal-title" style={{ fontSize: 24 }}>Lançar Desafio ⚔️</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
          Estás a enviar uma convocatória de amistoso para a equipa <strong>{targetSquad.name}</strong>.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Qual é a tua equipa?</label>
            <select className="form-select" value={form.challengerSquad} onChange={e => setForm({...form, challengerSquad: e.target.value})}>
              {mySquads.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Data Sugerida</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Local (Campo)</label>
              <input className="form-input" placeholder="Ex: Campo do Bairro" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Provocação Amigável 💬</label>
            <textarea className="form-input" placeholder="Vamos ver quem manda na zona..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ height: 80, resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, height: 48 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, height: 48, background: 'var(--red)', color: '#fff', border: 'none' }}>
              {loading ? <span className="spinner" /> : 'Desafiar Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
