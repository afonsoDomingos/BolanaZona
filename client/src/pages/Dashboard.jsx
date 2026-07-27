import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Trophy, Users, Calendar, Plus, ArrowRight, TrendingUp, Bell, Shield, Phone, ChevronLeft, ChevronRight, Handshake, Youtube, ArrowLeft as BackIcon, X } from 'lucide-react';
import MatchLikeButton from '../components/MatchLikeButton';
import toast from 'react-hot-toast';

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(res => setActivities(Array.isArray(res.data) ? res.data : [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>;

  if (activities.length === 0) return (
    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>
      Nenhuma atividade recente.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {activities.map(a => (
        <div key={a._id} style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.type === 'success' ? 'var(--green)' : 'var(--blue)', marginTop: 6, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{a.title}</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 4 }}>{a.message}</p>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('action') === 'new-match') {
      setShowMatchModal(true);
    }
  }, [location.search]);

  useEffect(() => {
    const welcomeFlag = localStorage.getItem('bnz_welcome');
    if (welcomeFlag === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('bnz_welcome');
    }
  }, []);

  const scrollRef = useRef(null);

  const scrollMatches = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const [matches, setMatches] = useState([]);
  const [managedTeams, setManagedTeams] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments'),
      api.get('/tournaments/public/matches/live'),
      api.get('/teams/my-managed-teams')
    ])
      .then(([tournamentsRes, matchesRes, teamsRes]) => {
        setTournaments(Array.isArray(tournamentsRes.data) ? tournamentsRes.data : []);
        setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
        setManagedTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUnlink = async (teamId) => {
    if (!window.confirm('Queres mesmo deixar de gerir esta equipa? Perderás o acesso ao painel dela.')) return;
    try {
      await api.put(`/teams/${teamId}/unlink`);
      toast.success('Desvinculado com sucesso.');
      setManagedTeams(managedTeams.filter(t => t._id !== teamId));
    } catch {
      toast.error('Erro ao desvincular.');
    }
  };

  const handleMatchLike = (match) => {
    const tournamentId = match.tournament?._id || match.tournament;

    // Incrementar localmente para feedback visual imediato
    setMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: (m.likes || 0) + 1 } : m));

    api.post(`/tournaments/${tournamentId}/matches/${match._id}/like`)
      .then(res => {
        setMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: res.data.likes ?? 0 } : m));
      })
      .catch(() => {
        setMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: Math.max(0, (m.likes || 0) - 1) } : m));
      });
  };


  const stats = {
    total: tournaments.length,
    active: tournaments.filter(t => t.status === 'active').length,
    finished: tournaments.filter(t => t.status === 'finished').length,
  };

  const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
  const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };

  return (
    <div className="page" style={{ position: 'relative' }}>
      {showWelcome && (
        <div className="splash-overlay">
          <div style={{
            position: 'absolute', width: '100%', height: '100%', 
            background: 'radial-gradient(circle at center, rgba(0,200,83,0.08) 0%, transparent 70%)',
            zIndex: -1
          }} />

          <div className="card-glass splash-card" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
            <div className="spin-ball splash-ball" style={{ fontSize: 'clamp(60px, 15vw, 100px)', marginBottom: 24 }}>⚽</div>
            <h1 className="font-syne animate-slide-up splash-title">
              Bem-vindo à <span className="gradient-text">Zona</span>
            </h1>
            <p className="animate-slide-up splash-text" style={{ animationDelay: '0.1s' }}>
              Olá, {user?.name?.split(' ')[0]}! {
                user?.role === 'superadmin' ? 'Prepara os torneios, o jogo vai começar! 🏆' :
                user?.role === 'admin' ? 'Gerencia os teus torneios, és o organizador! 🏆' :
                user?.role === 'player' ? 'Prepara as chuteiras, és o craque de hoje! ⚽' :
                'Acompanha tudo, a emoção está aqui! 📣'
              }
            </p>

            {localStorage.getItem('bnz_visitor_number') && (
              <div className="animate-slide-up" style={{ 
                animationDelay: '0.2s', marginTop: 16, fontSize: 13, color: 'var(--green)', 
                fontWeight: 700, padding: '4px 12px', background: 'rgba(0,200,83,0.1)', 
                borderRadius: 20, border: '1px solid rgba(0,200,83,0.2)', display: 'inline-block' 
              }}>
                Utilizador nº {localStorage.getItem('bnz_visitor_number')} na plataforma 🏆
              </div>
            )}
            
            <div style={{ marginTop: 40, width: '100%', maxWidth: 240, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--green), #00e676)', width: '100%', animation: 'loading-bar 3s linear forwards' }} />
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-sm"
              style={{ 
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Voltar"
            >
              <BackIcon size={16} /> Voltar
            </button>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Painel</p>
              <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800 }}>
                Olá, {
                  user?.role === 'superadmin' ? 'Chefe ' : 
                  user?.role === 'admin' ? 'Organizador ' : 
                  user?.role === 'player' ? 'Craque ' : 'Torcedor '
                }{user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Resumo dos teus torneios</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingRight: 4 }}>
            {(user?.role === 'superadmin' || user?.role === 'admin') && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {user?.role === 'superadmin' && (
                  <Link to="/admin/users" className="btn btn-secondary"><Users size={16} /> Utilizadores</Link>
                )}
                {user?.role === 'superadmin' && (
                  <Link to="/admin/partners" className="btn btn-secondary"><Handshake size={16} /> Parceiros</Link>
                )}
                {user?.role === 'superadmin' && (
                  <Link to="/admin/teams" className="btn btn-secondary"><Shield size={16} /> Central de Equipas</Link>
                )}
                {user?.role === 'superadmin' && (
                  <Link to="/admin/shorts" className="btn btn-secondary"><Youtube size={16} /> Configurar Shorts</Link>
                )}
              </div>
            )}
            <Link to="/dashboard/squads" className="btn btn-secondary"><Shield size={16} /> Meus Clubes</Link>
            <Link to="/dashboard/squads?new=true" className="btn btn-secondary"><Plus size={16} /> Criar Clube</Link>
            <button 

              onClick={() => setShowMatchModal(true)} 
              className="btn"
              style={{
                background: 'linear-gradient(135deg, var(--green), #00c853)',
                color: '#000000',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0, 200, 83, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Calendar size={16} /> Agendar Jogo
            </button>
            <Link to="/dashboard/tournaments/new" className="btn btn-secondary"><Plus size={16} /> Novo Torneio</Link>
          </div>
        </div>

        {/* WhatsApp Missing Alert */}
        {!user?.phone && (
          <div className="card animate-slide-up" style={{ 
            background: 'rgba(37, 211, 102, 0.08)', 
            border: '1px solid rgba(37, 211, 102, 0.2)', 
            marginBottom: 32, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            padding: '20px 24px',
            marginRight: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, 
                background: '#25D366', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: '#000' 
              }}>
                <Phone size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Configura o teu WhatsApp! 📲</h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Precisas de um número para receber notificações de desafios e gerir os teus clubes.
                </p>
              </div>
            </div>
            <Link to="/profile" className="btn" style={{ background: '#25D366', color: '#000', fontWeight: 800, fontSize: 13 }}>
              Registar Agora
            </Link>
          </div>
        )}

{/* Jogos em Destaque - Design Slim */}
            {matches.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Jogos em Destaque <span className="badge badge-red" style={{ fontSize: 9, padding: '1px 6px' }}>LIVE</span>
                  </h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => scrollMatches('left')}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => scrollMatches('right')}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={scrollRef}
                  style={{ 
                    display: 'flex', 
                    overflowX: 'auto', 
                    gap: 12, 
                    paddingBottom: 8,
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'smooth'
                  }} className="hide-scrollbar"
                >
                  {matches.map(m => (
                    <Link key={m._id} to={`/t/${m.tournament?.shareCode}`} className="card" style={{ 
                      textDecoration: 'none', 
                      minWidth: 280,
                      padding: '12px 16px', 
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {m.tournament?.name}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: m.homeTeam?.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {m.homeTeam?.logo ? <img src={m.homeTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                          </div>
                          <span style={{ 
                            fontWeight: 700, 
                            fontSize: 11, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            color: 'var(--text-primary)'
                          }}>{m.homeTeam?.name}</span>
                        </div>

                        <div style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, minWidth: 46, textAlign: 'center', flexShrink: 0 }}>
                          {m.status === 'live' ? (
                            <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--green)' }}>{m.homeScore} - {m.awayScore}</span>
                          ) : m.status === 'finished' ? (
                            <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-muted)' }}>{m.homeScore} - {m.awayScore}</span>
                          ) : (
                            <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-secondary)' }}>VS</span>
                          )}
                        </div>


                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
                          <span style={{ 
                            fontWeight: 700, 
                            fontSize: 11, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            color: 'var(--text-primary)'
                          }}>{m.awayTeam?.name}</span>
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: m.awayTeam?.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {m.awayTeam?.logo ? <img src={m.awayTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                          </div>
                        </div>
                      </div>
                      {/* Date + Location + Likes row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 6, fontSize: 9, color: 'var(--text-muted)' }}>
                          {m.date && <span>📅 {new Date(m.date).toLocaleDateString('pt-PT')} · {new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>}
                          {m.location && <span>🏟️ {m.location}</span>}
                        </div>
                        <MatchLikeButton 
                          likes={m.likes || 0} 
                          views={m.views || 0} 
                          onLike={() => handleMatchLike(m)} 
                          size="sm" 
                        />
                      </div>
                    </Link>

                  ))}
                  <div style={{ minWidth: 24, flexShrink: 0 }} />
                </div>
              </div>
            )}
        <div className="dashboard-grid">
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Stats */}
            {/* Global/Live Matches */}




                        <style>{`
              .badge-red { background: rgba(255, 23, 68, 0.1); color: #ff1744; border: 1px solid rgba(255, 23, 68, 0.2); }
              ::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="stats-grid">
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total de Torneios</div></div>
                  <div style={{ background: 'var(--green-subtle)', borderRadius: 12, padding: 10, color: 'var(--green)' }}><Trophy size={22} /></div>
                </div>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><div className="stat-value" style={{ color: 'var(--yellow)' }}>{stats.active}</div><div className="stat-label">A Decorrer</div></div>
                  <div style={{ background: 'rgba(255,214,0,0.1)', borderRadius: 12, padding: 10, color: 'var(--yellow)' }}><TrendingUp size={22} /></div>
                </div>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.finished}</div><div className="stat-label">Concluídos</div></div>
                  <div style={{ background: 'rgba(41,121,255,0.1)', borderRadius: 12, padding: 10, color: 'var(--blue)' }}><Calendar size={22} /></div>
                </div>
              </div>
            </div>

                        {/* Recent Tournaments */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Torneios Recentes</h2>
                <Link to="/dashboard/tournaments" style={{ color: 'var(--green)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Ver todos <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : tournaments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon spin-ball">⚽</div>
                  <h3>Ainda sem torneios</h3>
                  <p style={{ marginBottom: 24 }}>Cria o teu primeiro torneio!</p>
                  <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Criar Torneio</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tournaments.slice(0, 5).map(t => (
                    <Link key={t._id} to={`/dashboard/tournaments/${t._id}`} className="card recent-tournament-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                        <div className="card-icon-sm spin-ball">⚽</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.neighborhood} · {t.maxTeams} equipas</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`badge ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
                        <ArrowRight size={16} color="var(--text-muted)" className="hide-mobile" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {managedTeams.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={22} color="var(--blue)" /> Equipas que Gerencio
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {managedTeams.map(team => (
                    <div key={team._id} className="card animate-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(41,121,255,0.02)', border: '1px solid rgba(41,121,255,0.1)', borderRadius: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: team.color || 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {team.logo ? <img src={team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <Shield size={20} color="#fff" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{team.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Torneio: <span style={{ color: 'var(--text-secondary)' }}>{team.tournament?.name}</span></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                          onClick={() => handleUnlink(team._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'rgba(255,0,0,0.1)', height: 36, fontSize: 12 }}
                        >
                          Sair da Gestão
                        </button>
                        <Link to={`/t/${team.tournament?.shareCode}`} className="btn btn-primary btn-sm" style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', fontSize: 12 }}>
                          Ver Torneio
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Sidebar - Notifications */}
          <div className="dashboard-sidebar">
            <div className="card-glass" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={18} color="var(--green)" /> Atividades Recentes
              </h3>
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>

      {showMatchModal && (
        <AddMatchModal 
          tournaments={tournaments} 
          onClose={() => setShowMatchModal(false)} 
          onMatchAdded={() => {
            api.get('/tournaments/public/matches/live').then(res => setMatches(Array.isArray(res.data) ? res.data : []));
            api.get('/tournaments').then(res => setTournaments(Array.isArray(res.data) ? res.data : []));
          }} 
        />
      )}
    </div>
  );
}

function AddMatchModal({ tournaments, onClose, onMatchAdded }) {
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?._id || 'new');
  const [newTournamentName, setNewTournamentName] = useState('Jogos Rápidos & Amigáveis');
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [roundName, setRoundName] = useState('Jogo Amigável');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!homeTeamName.trim() || !awayTeamName.trim()) {
      toast.error('Por favor, indica o nome da Equipa Casa e Equipa Fora.');
      return;
    }

    setLoading(true);
    try {
      let targetTournamentId = selectedTournament;

      // Criar novo torneio se selecionado "novo"
      if (targetTournamentId === 'new' || !targetTournamentId) {
        const tRes = await api.post('/tournaments', {
          name: newTournamentName.trim() || 'Jogos Rápidos & Amigáveis',
          description: 'Torneio de jogos amigáveis e rápidos agendados.',
          format: 'league',
          status: 'active'
        });
        targetTournamentId = tRes.data._id;
      }

      // Adicionar o jogo
      await api.post(`/tournaments/${targetTournamentId}/matches`, {
        homeTeamName: homeTeamName.trim(),
        awayTeamName: awayTeamName.trim(),
        date: date ? new Date(date) : new Date(),
        location: location.trim(),
        round: 1,
        roundName: roundName.trim() || 'Jogo Amigável',
        status: 'scheduled'
      });

      toast.success('Jogo agendado com sucesso! ⚽');
      onMatchAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao agendar jogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚽ Agendar Jogo
          </h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
          {/* Seletor de Torneio */}
          <div className="form-group">
            <label className="form-label">Torneio / Competição</label>
            <select 
              className="form-select" 
              value={selectedTournament} 
              onChange={e => setSelectedTournament(e.target.value)}
            >
              <option value="new">⚡ Jogo Amigável / Criar Novo Torneio</option>
              {tournaments.map(t => (
                <option key={t._id} value={t._id}>🏆 {t.name}</option>
              ))}
            </select>
          </div>

          {selectedTournament === 'new' && (
            <div className="form-group">
              <label className="form-label">Nome da Competição / Torneio</label>
              <input 
                className="form-input" 
                placeholder="Ex: Liga Amadora / Jogos Rápidos" 
                value={newTournamentName} 
                onChange={e => setNewTournamentName(e.target.value)} 
              />
            </div>
          )}

          {/* Equipas */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Equipa Casa (Mandante)</label>
              <input 
                className="form-input" 
                placeholder="Ex: AC Juvenil" 
                value={homeTeamName} 
                onChange={e => setHomeTeamName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Equipa Fora (Visitante)</label>
              <input 
                className="form-input" 
                placeholder="Ex: Mandevo FC" 
                value={awayTeamName} 
                onChange={e => setAwayTeamName(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Data & Hora e Local */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Data e Hora</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Local do Jogo</label>
              <input 
                className="form-input" 
                placeholder="Ex: Campo de Maxaquene" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
              />
            </div>
          </div>

          {/* Ronda / Tipo */}
          <div className="form-group">
            <label className="form-label">Fase ou Ronda (Opcional)</label>
            <input 
              className="form-input" 
              placeholder="Ex: Jornada 1 / Amigável / Quartos de Final" 
              value={roundName} 
              onChange={e => setRoundName(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              height: 48, 
              marginTop: 8, 
              background: 'linear-gradient(135deg, var(--green), #00c853)', 
              color: '#000', 
              fontWeight: 800,
              fontSize: 14
            }}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Plus size={16} /> Publicar Jogo no Calendário</>}
          </button>
        </form>
      </div>
    </div>
  );
}
