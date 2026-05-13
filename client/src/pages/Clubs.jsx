import { useState, useEffect } from 'react';
import { Shield, Search, MapPin, Swords, Users, X, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import SquadDetailsModal from '../components/SquadDetailsModal';
import ChallengeModal from '../components/ChallengeModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Clubs() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(null);
  const [showSquadDetails, setShowSquadDetails] = useState(null);
  
  const { user } = useAuth();
  const [mySquads, setMySquads] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);

  useEffect(() => {
    fetchSquads();
    if (user) {
      Promise.all([
        api.get('/squads/my-squads'),
        api.get('/challenges/my-challenges')
      ]).then(([sqRes, chRes]) => {
        setMySquads(sqRes.data);
        setMyChallenges(chRes.data);
      }).catch(() => {});
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
                      <MapPin size={14} color="var(--green)" /> {squad.city || 'Maputo (Cidade)'}{squad.neighborhood ? ` - ${squad.neighborhood}` : ''}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 900, color: 'var(--yellow)', background: 'rgba(255, 193, 7, 0.1)', padding: '2px 8px', borderRadius: 100, marginTop: 6, textTransform: 'uppercase' }}>
                      {squad.category || 'Senior'}
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

                <div className="btn-group-responsive">
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', height: 48, background: 'rgba(255,255,255,0.05)', border: 'none' }}
                    onClick={() => setShowSquadDetails(squad)}
                  >
                    Ver Equipa
                  </button>
                  {(() => {
                    const isMySquad = mySquads.find(ms => ms._id === squad._id);
                    if (isMySquad) return null;

                    const activeChallenge = myChallenges.find(c => 
                      (c.status === 'pending' || (c.status === 'accepted' && new Date(c.date) >= new Date().setHours(0,0,0,0))) && 
                      (c.challengedSquad._id === squad._id || c.challengerSquad._id === squad._id)
                    );

                    if (activeChallenge) {
                      const isPending = activeChallenge.status === 'pending';
                      return (
                        <div className="btn-group-responsive" style={{ width: '100%' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ 
                              flex: 1, 
                              height: 44, 
                              fontSize: 13, 
                              borderColor: isPending ? 'var(--yellow)' : 'var(--green)', 
                              color: isPending ? 'var(--yellow)' : 'var(--green)', 
                              cursor: 'default' 
                            }}
                            disabled
                          >
                            <Calendar size={16} /> {isPending ? 'Desafio Pendente' : 'Jogo Agendado'}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, height: 44, fontSize: 13, background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-subtle)'; e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        onClick={() => {
                          if (!user) return toast.error('Faz login para desafiar este clube!');
                          if (mySquads.length === 0) return toast.error('Tens de criar um Clube primeiro no teu Dashboard!');
                          if (mySquads.find(ms => ms._id === squad._id)) return toast.error('Não podes desafiar o teu próprio clube!');
                          setShowChallengeModal(squad);
                        }}
                      >
                        <Swords size={18} /> Lançar Desafio
                      </button>
                    );
                  })()}
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
          onSuccess={() => api.get('/challenges/my-challenges').then(res => setMyChallenges(res.data))}
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




