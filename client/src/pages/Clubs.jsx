import { useState, useEffect } from 'react';
import { Shield, Search, MapPin, Swords, Users, X, Phone } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Clubs() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(null);
  const [showSquadDetails, setShowSquadDetails] = useState(null);
  
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

                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', height: 48, background: 'rgba(255,255,255,0.05)', border: 'none' }}
                    onClick={() => setShowSquadDetails(squad)}
                  >
                    Ver Equipa
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 2, justifyContent: 'center', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: 48 }}
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
      {showSquadDetails && (
        <SquadDetailsModal 
          squad={showSquadDetails} 
          onClose={() => setShowSquadDetails(null)} 
          onChallenge={() => {
            setShowSquadDetails(null);
            if (!user) return toast.error('Faz login para desafiar este clube!');
            if (mySquads.length === 0) return toast.error('Tens de criar um Clube primeiro no teu Dashboard!');
            if (mySquads.find(ms => ms._id === showSquadDetails._id)) return toast.error('Não podes desafiar o teu próprio clube!');
            setShowChallengeModal(showSquadDetails);
          }}
        />
      )}
    </div>
  );
}

function SquadDetailsModal({ squad, onClose, onChallenge }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 500, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `2px solid ${squad.color || 'var(--green)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={32} color={squad.color || 'var(--green)'} />}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{squad.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--green)" /> {squad.neighborhood || 'Desconhecido'}
              </div>
              {squad.contact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  <Phone size={14} color="var(--green)" /> {squad.contact}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Estatísticas</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.wins || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vitórias</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.draws || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Empates</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.losses || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Derrotas</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--yellow)' }}>{squad.stats?.tournamentsWon || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Títulos</div></div>
          </div>
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
            <Users size={18} color="var(--green)" /> Plantel Oficial
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(!squad.players || squad.players.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                Este clube ainda não registou jogadores.
              </div>
            ) : (
              squad.players.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={18} color="var(--text-muted)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.number && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)' }}>#{p.number}</span>}
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                    </div>
                    {p.position && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.position === 'GK' ? 'Guarda-Redes' : p.position === 'DEF' ? 'Defesa' : p.position === 'MID' ? 'Médio' : p.position === 'FWD' ? 'Avançado' : p.position}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <button className="btn btn-primary" onClick={onChallenge} style={{ width: '100%', justifyContent: 'center', height: 52, background: 'var(--red)', color: '#fff', border: 'none' }}>
            <Swords size={18} /> Lançar Desafio a {squad.name}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChallengeModal({ targetSquad, mySquads, onClose }) {
  const [form, setForm] = useState({ challengerSquad: mySquads[0]?._id, date: '', location: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/challenges', { ...form, challengedSquad: targetSquad._id });
      setSent(true);
      if (res.data.whatsappLink) {
        setWhatsappLink(res.data.whatsappLink);
        // Auto-open WhatsApp after short delay
        setTimeout(() => window.open(res.data.whatsappLink, '_blank'), 500);
        toast.success('Desafio enviado! O WhatsApp vai abrir agora. 📲', { duration: 5000 });
      } else {
        toast.success('Desafio enviado! O capitão adversário será notificado. ⚔️', { duration: 5000 });
      }
    } catch {
      toast.error('Erro ao lançar desafio.');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation screen after send
  if (sent) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal animate-slide-up" style={{ maxWidth: 420, padding: 40, textAlign: 'center' }}>
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 450, padding: 32 }}>
        <div className="modal-header" style={{ marginBottom: 24 }}>
          <h2 className="modal-title" style={{ fontSize: 24 }}>Lançar Desafio ⚔️</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
          Estás a enviar uma convocatória de amistoso para a equipa <strong>{targetSquad.name}</strong>.
          {targetSquad.contact && <span style={{ color: 'var(--green)', display: 'block', marginTop: 8, fontSize: 13 }}>📲 Esta equipa tem WhatsApp registado — a notificação será enviada automaticamente!</span>}
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
              {loading ? <span className="spinner" /> : '⚔️ Desafiar Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
