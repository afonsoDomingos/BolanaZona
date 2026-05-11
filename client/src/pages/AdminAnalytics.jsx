import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, ShoppingCart, Eye, Activity, Clock, MousePointer2, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const res = await api.get('/analytics/stats');
      setStats(res.data);
    } catch { toast.error('Erro ao carregar analytics.'); }
    finally { setLoading(false); }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/suggestions');
      setSuggestions(res.data);
    } catch { toast.error('Erro ao carregar sugestões.'); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [activeTab]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <header style={{ marginBottom: 32 }}>
          <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800 }}>
            Centro de <span className="gradient-text">Controlo Admin</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitoriza utilizadores, vendas e atividades em tempo real.</p>
        </header>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Visitas Totais', value: stats.totalVisits, icon: <Eye />, color: 'var(--blue)' },
            { label: 'Pedidos Compra', value: stats.totalPurchases, icon: <ShoppingCart />, color: 'var(--green)' },
            { label: 'Utilizadores Online', value: stats.onlineUsers.length, icon: <Activity />, color: 'var(--red)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ background: `${stat.color}20`, color: stat.color, padding: 12, borderRadius: 12 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
          {[
            { id: 'overview', label: 'Visão Geral', icon: <Eye size={16} /> },
            { id: 'suggestions', label: 'Sugestões', icon: <MessageSquare size={16} /> },
            { id: 'online', label: 'Utilizadores Online', icon: <Activity size={16} /> },
            { id: 'logs', label: 'Log de Atividade', icon: <Clock size={16} /> },
            { id: 'products', label: 'Top Produtos', icon: <ShoppingCart size={16} /> },
          ].map(tab => (
            <button 
              key={tab.id} 
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ whiteSpace: 'nowrap', borderRadius: 12 }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {activeTab === 'overview' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Visitas por Página</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.pageVisits.map(pv => (
                  <div key={pv._id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 150, fontSize: 14, fontWeight: 600 }}>{pv._id || 'Home'}</div>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(pv.count / stats.totalVisits) * 100}%`, height: '100%', background: 'var(--green)' }} />
                    </div>
                    <div style={{ width: 50, textAlign: 'right', fontSize: 14 }}>{pv.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Sugestões de Melhoria ({suggestions.length})</h3>
              {suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Ainda não existem sugestões.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {suggestions.map(s => (
                    <div key={s._id} className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                        <span className="badge badge-blue">{s.category}</span>
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>"{s.message}"</p>
                      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'online' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th>Última Atividade</th>
                </tr>
              </thead>
              <tbody>
                {stats.onlineUsers.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40 }}>Ninguém online no momento.</td></tr>
                ) : stats.onlineUsers.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'superadmin' ? 'yellow' : 'blue'}`}>{u.role}</span></td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}><div className="dot" /> Agora</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'logs' && (
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Utilizador / IP</th>
                    <th>Página / Alvo</th>
                    <th>Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEvents.map(e => (
                    <tr key={e._id}>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 6, 
                          fontSize: 11, 
                          fontWeight: 700,
                          background: e.type === 'purchase_attempt' ? 'var(--green-soft)' : 'rgba(255,255,255,0.05)',
                          color: e.type === 'purchase_attempt' ? 'var(--green)' : 'inherit'
                        }}>
                          {e.type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{e.user?.name || 'Visitante'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.ip}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{e.page}</div>
                        {e.targetName && <div style={{ fontSize: 11, color: 'var(--blue)' }}>{e.targetName}</div>}
                      </td>
                      <td style={{ fontSize: 12 }}>{new Date(e.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'products' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Produtos Mais Clicados (Intenção de Compra)</h3>
              {stats.topProducts.map((p, i) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'rgba(255,255,255,0.1)', width: 30 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p._id}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.count} cliques em comprar</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--green)' }}>{p.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(0.9); opacity: 1; } }
      `}</style>
    </div>
  );
}
