import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Trophy, Users, Calendar, Plus, ArrowRight, TrendingUp, Bell, Shield, Phone } from 'lucide-react';

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(res => setActivities(res.data)).finally(() => setLoading(false));
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
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const welcomeFlag = localStorage.getItem('bnz_welcome');
    if (welcomeFlag === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('bnz_welcome');
    }
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments'),
      api.get('/tournaments/public/matches/live')
    ])
      .then(([tournamentsRes, matchesRes]) => {
        setTournaments(tournamentsRes.data);
        setMatches(matchesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

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
                user?.role === 'superadmin' || user?.role === 'admin' ? 'Prepara os torneios, o jogo vai começar! 🏆' :
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
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingRight: 4 }}>
            {user?.role === 'superadmin' && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/admin/users" className="btn btn-secondary"><Users size={16} /> Utilizadores</Link>
                <Link to="/admin/teams" className="btn btn-secondary"><Shield size={16} /> Central de Equipas</Link>
              </div>
            )}
            <Link to="/dashboard/squads" className="btn btn-secondary"><Shield size={16} /> Meus Clubes</Link>
            <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Novo Torneio</Link>
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

        <div className="dashboard-grid">
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Stats */}
            {/* Global/Live Matches */}
            {/* Jogos em Destaque removidos temporariamente */}

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
    </div>
  );
}
