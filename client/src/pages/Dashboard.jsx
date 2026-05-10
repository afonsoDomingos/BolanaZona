import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Trophy, Users, Calendar, Plus, ArrowRight, TrendingUp, Bell } from 'lucide-react';

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
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tournaments').then(res => setTournaments(res.data)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tournaments.length,
    active: tournaments.filter(t => t.status === 'active').length,
    finished: tournaments.filter(t => t.status === 'finished').length,
  };

  const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
  const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Painel</p>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800 }}>Olá, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Resumo dos teus torneios</p>
          </div>
          <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Novo Torneio</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'flex-start' }}>
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Stats */}
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
                  <div className="empty-state-icon">⚽</div>
                  <h3>Ainda sem torneios</h3>
                  <p style={{ marginBottom: 24 }}>Cria o teu primeiro torneio!</p>
                  <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Criar Torneio</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tournaments.slice(0, 5).map(t => (
                    <Link key={t._id} to={`/dashboard/tournaments/${t._id}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚽</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.neighborhood} · {t.maxTeams} equipas</div>
                      </div>
                      <span className={`badge ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Notifications */}
          <div className="card-glass" style={{ padding: 24, position: 'sticky', top: 96 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={18} color="var(--green)" /> Atividades Recentes
            </h3>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
