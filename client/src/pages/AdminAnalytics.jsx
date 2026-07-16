import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, ShoppingCart, Eye, Activity, Clock, MousePointer2, ShieldCheck, Mail, MessageSquare, Smartphone, Trophy, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalPurchases: 0,
    topProducts: [],
    pageVisits: [],
    recentEvents: [],
    onlineUsers: [],
    deviceStats: [],
    osStats: [],
    tournamentStats: []
  });
  const [suggestions, setSuggestions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
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

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
    } catch { toast.error('Erro ao carregar leads.'); }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data);
    } catch { toast.error('Erro ao carregar feedbacks.'); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'suggestions') fetchSuggestions();
    if (activeTab === 'leads') fetchLeads();
    if (activeTab === 'feedbacks') fetchFeedbacks();
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
            { id: 'leads', label: 'Leads (Vendas/Inscrições)', icon: <Users size={16} /> },
            { id: 'feedbacks', label: 'Feedbacks Site', icon: <Heart size={16} /> },
            { id: 'suggestions', label: 'Sugestões', icon: <MessageSquare size={16} /> },
            { id: 'tech', label: 'Tecnologia', icon: <Smartphone size={16} /> },
            { id: 'online', label: 'Utilizadores Ativos', icon: <Activity size={16} /> },
            { id: 'logs', label: 'Log de Atividade', icon: <Clock size={16} /> },
            { id: 'tournaments', label: 'Top Regiões (Torneios)', icon: <Trophy size={16} /> },
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
          {activeTab === 'leads' && (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Leads Captados ({leads.length})</h3>
                <button onClick={fetchLeads} className="btn btn-secondary btn-sm">Atualizar</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Interesse</th>
                      <th>Detalhes</th>
                      <th>Província</th>
                      <th>Pagamento</th>
                      <th>Estado</th>
                      <th>Data</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l._id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{l.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--green)' }}>{l.contact}</div>
                        </td>
                        <td>
                          <span className={`badge ${l.product ? 'badge-blue' : 'badge-green'}`}>
                            {l.product ? 'Loja' : 'Torneio'}
                          </span>
                          <div style={{ fontSize: 11, marginTop: 4 }}>
                            {l.product?.name || l.tournament?.name || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 12 }}>
                            {l.size && <span>Tam: <strong>{l.size}</strong> </span>}
                            {l.color && <span>Cor: <strong>{l.color}</strong> </span>}
                            {l.teamName && <span>Equipa: <strong>{l.teamName}</strong></span>}
                          </div>
                          {l.message && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>"{l.message}"</div>}
                        </td>
                        <td><span style={{ fontSize: 13 }}>{l.province || 'N/A'}</span></td>
                        <td>
                          <div style={{ fontSize: 12 }}>
                            <span style={{ 
                              fontWeight: 700, 
                              textTransform: 'uppercase', 
                              color: l.paymentMethod === 'mpesa' ? '#e51a24' : l.paymentMethod === 'emola' ? '#ff6600' : l.paymentMethod === 'whatsapp' ? '#25D366' : 'var(--blue)' 
                            }}>
                              {l.paymentMethod || 'WhatsApp'}
                            </span>
                            {l.paymentPhone && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.paymentPhone}</div>}
                            {l.paymentDetails && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>{l.paymentDetails}</div>}
                          </div>
                        </td>
                        <td>
                          <select
                            value={l.status || 'new'}
                            onChange={async (e) => {
                              try {
                                await api.put(`/leads/${l._id}/status`, { status: e.target.value });
                                toast.success('Estado atualizado!');
                                fetchLeads();
                              } catch {
                                toast.error('Erro ao atualizar estado.');
                              }
                            }}
                            className={`badge ${
                              l.status === 'converted' 
                                ? 'badge-green' 
                                : l.status === 'lost' 
                                  ? 'badge-red' 
                                  : l.status === 'contacted'
                                    ? 'badge-blue'
                                    : 'badge-yellow'
                            }`}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 11 }}
                          >
                            <option value="new" style={{ background: '#0a0f14', color: '#fff' }}>Pendente</option>
                            <option value="contacted" style={{ background: '#0a0f14', color: '#fff' }}>Contactado</option>
                            <option value="converted" style={{ background: '#0a0f14', color: '#fff' }}>Pago / Entregue</option>
                            <option value="lost" style={{ background: '#0a0f14', color: '#fff' }}>Cancelado</option>
                          </select>
                        </td>
                        <td style={{ fontSize: 12 }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a 
                            href={`https://wa.me/${(l.contact || '').replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                          >
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 40 }}>📋</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Nenhum lead registado ainda</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.5 }}>Quando utilizadores mostrarem interesse em produtos da loja ou inscrições em torneios, os dados aparecerão aqui.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Visitas por Página</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.pageVisits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 40 }}>📊</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Ainda sem dados de visitas</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.5 }}>As estatísticas de visitas por página serão exibidas assim que utilizadores começarem a navegar na plataforma.</div>
                  </div>
                ) : stats.pageVisits.map(pv => (
                  <div key={pv._id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 150, fontSize: 14, fontWeight: 600 }}>{pv._id || 'Home'}</div>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${stats.totalVisits > 0 ? (pv.count / stats.totalVisits) * 100 : 0}%`, height: '100%', background: 'var(--green)' }} />
                    </div>
                    <div style={{ width: 50, textAlign: 'right', fontSize: 14 }}>{pv.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedbacks' && (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Feedbacks da Comunidade ({feedbacks.length})</h3>
                <button onClick={fetchFeedbacks} className="btn btn-secondary btn-sm">Atualizar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {feedbacks.map(f => (
                  <div key={f._id} className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{f.user?.name || 'Visitante'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.user?.email || 'Anónimo'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < f.rating ? 'var(--yellow)' : 'none'} color={i < f.rating ? 'var(--yellow)' : 'var(--text-muted)'} />
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {f.experience?.split(' ').filter(tag => tag.includes('⭐') || tag.includes('🎨') || tag.includes('🚀') || tag.includes('📱')).map(tag => (
                        <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(0,200,83,0.1)', color: 'var(--green)', fontWeight: 700 }}>{tag}</span>
                      ))}
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>Via: {f.source}</span>
                    </div>
                    {f.comment && (
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                        "{f.comment}"
                      </p>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                      {new Date(f.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', gridColumn: '1/-1' }}>Ainda não existem feedbacks.</div>}
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

          {activeTab === 'tech' && (
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              <div>
                <h3 style={{ marginBottom: 20 }}>Dispositivos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {stats.deviceStats?.map(ds => (
                    <div key={ds._id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{ds._id}</span>
                        <span style={{ color: 'var(--green)' }}>{ds.count}</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                        <div style={{ width: `${(ds.count / stats.totalVisits) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: 20 }}>Sistemas Operativos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {stats.osStats?.map(os => (
                    <div key={os._id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700 }}>{os._id}</span>
                        <span style={{ color: 'var(--blue)' }}>{os.count}</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                        <div style={{ width: `${(os.count / stats.totalVisits) * 100}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'online' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Últimos Utilizadores Ativos</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Cargo</th>
                      <th>Telemóvel</th>
                      <th>Visto pela última vez</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.onlineUsers.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40 }}>Ninguém online no momento.</td></tr>
                    ) : stats.onlineUsers.map(u => {
                      const lastSeen = new Date(u.lastSeen);
                      const isOnline = (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000;
                      
                      return (
                        <tr key={u._id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                          </td>
                          <td><span className={`badge badge-${u.role === 'superadmin' ? 'yellow' : 'blue'}`}>{u.role}</span></td>
                          <td style={{ fontSize: 13 }}>{u.phone || 'N/A'}</td>
                          <td>
                            {isOnline ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>
                                <div className="dot" style={{ background: 'var(--green)', width: 8, height: 8, borderRadius: '50%', animation: 'pulse 2s infinite' }} /> 
                                Online agora
                              </span>
                            ) : (
                              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                {lastSeen.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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
                  {stats.recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <div style={{ fontSize: 40 }}>🔍</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Nenhuma atividade registada</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.5 }}>O log de atividades aparecerá aqui assim que utilizadores interagirem com a plataforma (visitas, compras, etc.).</div>
                        </div>
                      </td>
                    </tr>
                  ) : stats.recentEvents.map(e => (
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

          {activeTab === 'tournaments' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Torneios Criados por Província</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {stats.tournamentStats?.map(ts => (
                  <div key={ts._id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>{ts._id || 'Não especificada'}</span>
                      <span style={{ color: 'var(--green)', fontWeight: 800 }}>{ts.count} Torneios</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${(ts.count > 0 && stats.tournamentStats?.[0]?.count > 0) ? (ts.count / stats.tournamentStats[0].count) * 100 : 0}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--green), var(--blue))', 
                          borderRadius: 5 
                        }} 
                      />
                    </div>
                  </div>
                ))}
                {(!stats.tournamentStats || stats.tournamentStats.length === 0) && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Ainda não foram criados torneios.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Produtos Mais Clicados (Intenção de Compra)</h3>
              {stats.topProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 40 }}>🛍️</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Nenhum produto clicado ainda</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.5 }}>Assim que utilizadores clicarem em "Comprar" em produtos da loja, os dados de intenção de compra aparecerão aqui.</div>
                </div>
              ) : stats.topProducts.map((p, i) => (
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
