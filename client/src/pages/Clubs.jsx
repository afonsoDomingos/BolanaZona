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
            <Swords size={16} style={{ marginRight: 8 }} /> Sistema de Desafios Diretos
          </div>
          <h1 className="font-syne" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>Lançar <span style={{ color: 'var(--green)' }}>Desafio</span></h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40 }}>
            Explora a comunidade de equipas oficiais, analisa o plantel, histórico de jogos e lança desafios para provares a supremacia do teu clube.
          </p>
          
          <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
            <Search size={20} color="var(--green)" style={{ position: 'absolute', left: 20, top: 20 }} />
            <input 
              className="form-input" 
              placeholder="Procurar equipa, bairro ou cidade..." 
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
            <h3>Nenhuma equipa encontrada</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {searchTerm ? 'Tente utilizar outros termos na sua pesquisa.' : 'Ainda não foram registadas equipas de futebol na plataforma.'}
            </p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredSquads.map(squad => (
              <div key={squad._id} className="card-glass hover-scale" style={{ display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10, 15, 30, 0.7)', transition: 'all 0.3s ease' }}>
                
                {/* Banner / Cover Header */}
                <div style={{
                  height: 110,
                  position: 'relative',
                  background: squad.banner 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(10,15,30,0.9)), url(${squad.banner}) center/cover no-repeat`
                    : 'linear-gradient(135deg, rgba(0,200,83,0.15) 0%, rgba(10,15,30,0.95) 100%)',
                  padding: '12px 16px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  {/* Category Pill */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#000', background: 'var(--green)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,200,83,0.3)' }}>
                    ⚽ {squad.category || 'Senior'}
                  </div>

                  {/* Player count pill */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#ffffff', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)' }}>
                    <Users size={12} color="var(--green)" /> {squad.players?.length || 0} Jogadores
                  </div>
                </div>

                {/* Main Content Area */}
                <div style={{ padding: '0 20px 20px', marginTop: -36, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* Logo Overlay */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: '#0a0f1e', border: `3px solid ${squad.color || 'var(--green)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', flexShrink: 0 }}>
                      {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={36} color={squad.color || 'var(--green)'} />}
                    </div>

                    {squad.createdAt && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                        Fundado em {new Date(squad.createdAt).getFullYear()}
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5, color: '#ffffff' }}>{squad.name}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <MapPin size={14} color="var(--green)" /> {squad.city || 'Maputo'}{squad.neighborhood ? ` • ${squad.neighborhood}` : ''}
                  </div>

                  {squad.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {squad.description}
                    </p>
                  )}
                  
                  {/* Stats Grid */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20, marginTop: 'auto' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>{squad.stats?.wins || 0}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Vitórias</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>{squad.stats?.matchesPlayed || 0}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Jogos</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--yellow)' }}>{squad.stats?.tournamentsWon || 0}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Títulos</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, fontWeight: 700 }}
                      onClick={() => setShowSquadDetails(squad)}
                    >
                      Ver Perfil
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
                          <button 
                            className="btn btn-secondary" 
                            style={{ 
                              flex: 1, 
                              height: 46, 
                              fontSize: 12,
                              borderRadius: 14,
                              borderColor: isPending ? 'var(--yellow)' : 'var(--green)', 
                              color: isPending ? 'var(--yellow)' : 'var(--green)', 
                              cursor: 'default' 
                            }}
                            disabled
                          >
                            <Calendar size={14} /> {isPending ? 'Pendente' : 'Agendado'}
                          </button>
                        );
                      }

                      return (
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, height: 46, fontSize: 13, borderRadius: 14, background: 'var(--green)', color: '#000000', fontWeight: 800, justifyContent: 'center', border: 'none' }}
                          onClick={() => {
                            if (!user) return toast.error('Faz login para desafiar esta equipa!');
                            if (mySquads.length === 0) return toast.error('Tens de criar uma Equipa primeiro no teu Dashboard!');
                            if (mySquads.find(ms => ms._id === squad._id)) return toast.error('Não podes desafiar o teu próprio clube!');
                            setShowChallengeModal(squad);
                          }}
                        >
                          <Swords size={16} /> Desafiar
                        </button>
                      );
                    })()}
                  </div>
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




