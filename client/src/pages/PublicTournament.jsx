import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Calendar, BarChart2, Users, Share2, MapPin, ArrowLeft, Star, Clock, Camera } from 'lucide-react';
import TeamRegistrationModal from '../components/TeamRegistrationModal';
import SponsorProposalModal from '../components/SponsorProposalModal';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

const formatLabel = { groups: 'Todos contra Todos', knockout: 'Mata-mata', groups_knockout: 'Grupos + Eliminatórias' };
const statusLabel = { draft: 'Brevemente', registration: 'Inscrições Abertas', active: 'A Decorrer', finished: 'Concluído' };

export default function PublicTournament() {
  const { shareCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('standings');
  const [showRegistrationModal, setShowRegistrationModal] = useState(window.location.search.includes('action=register'));
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/tournaments/public/${shareCode}`)
      .then(res => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado! Partilha com a tua equipa. ⚽');
  };

  const captureImage = async (elementId, fileName) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const toastId = toast.loading('A preparar imagem... 📸');

    // Injetar marca d'água temporária
    const watermark = document.createElement('div');
    watermark.innerHTML = 'bolanazona.com';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '12px';
    watermark.style.right = '20px';
    watermark.style.color = 'rgba(255, 255, 255, 0.4)';
    watermark.style.fontSize = '13px';
    watermark.style.fontWeight = '800';
    watermark.style.letterSpacing = '1px';
    watermark.style.zIndex = '9999';
    watermark.style.pointerEvents = 'none';

    // Garantir que o container permite posicionamento absoluto
    const originalPosition = element.style.position;
    if (window.getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(watermark);

    try {
      const canvas = await html2canvas(element, { 
        backgroundColor: '#0f172a', // Cor de fundo do tema escuro
        scale: 2, 
        useCORS: true 
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.png`;
      a.click();
      toast.success('Imagem guardada com sucesso!', { id: toastId });
    } catch (err) {
      toast.error('Erro ao capturar imagem.', { id: toastId });
    } finally {
      // Limpar a marca d'água logo a seguir
      if (element.contains(watermark)) element.removeChild(watermark);
      element.style.position = originalPosition;
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;

  if (notFound) return (
    <div className="page animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div className="spin-ball" style={{ fontSize: 80, marginBottom: 24 }}>⚽</div>
      <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Ups! Torneio não encontrado</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 32 }}>Parece que este link já não é válido ou o torneio foi removido pelo organizador.</p>
      <Link to="/" className="btn btn-primary">Explorar outros torneios</Link>
    </div>
  );

  const { tournament, teams, matches, standings } = data;

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Dynamic Header / Hero */}
      <div style={{ 
        position: 'relative', 
        padding: '60px 0 40px',
        background: 'radial-gradient(circle at top right, rgba(0,200,83,0.15), transparent), radial-gradient(circle at bottom left, rgba(0,200,83,0.05), transparent)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <Link to="/explore" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
                <ArrowLeft size={16} /> Voltar à Exploração
              </Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div className="spin-ball" style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--green-subtle)', border: '2px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 10px 30px rgba(0,200,83,0.2)' }}>⚽</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1 className="font-syne" style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 900, lineHeight: 1.1 }}>{tournament.name}</h1>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 16 }}>
                    <MapPin size={18} color="var(--green)" /> {tournament.location}, {tournament.neighborhood}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span className={`badge ${tournament.status === 'active' ? 'badge-green' : tournament.status === 'registration' ? 'badge-blue' : 'badge-gray'}`} style={{ padding: '6px 16px', fontSize: 13 }}>
                  {statusLabel[tournament.status]}
                </span>
                <span className="badge badge-gray" style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 16px' }}>{formatLabel[tournament.format]}</span>
                {tournament.prize && <span className="badge badge-yellow" style={{ padding: '6px 16px' }}>🏆 {tournament.prize}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={copyLink} className="btn btn-secondary" style={{ borderRadius: 12, height: 48 }}><Share2 size={18} /> Partilhar</button>
              <button onClick={() => setShowSubscribeModal(true)} className="btn btn-secondary" style={{ borderRadius: 12, height: 48, borderColor: 'var(--green)', color: 'var(--green)' }}><Clock size={18} /> Seguir Torneio</button>
              <button onClick={() => setShowSponsorModal(true)} className="btn btn-secondary" style={{ borderRadius: 12, height: 48, borderColor: 'var(--yellow)', color: 'var(--yellow)' }}>🤝 Apoiar</button>
              {tournament.status === 'registration' && tournament.allowPublicRegistration && (
                <button onClick={() => setShowRegistrationModal(true)} className="btn btn-primary" style={{ borderRadius: 12, height: 48, padding: '0 32px', fontWeight: 700 }}>Inscrever Equipa</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Hall of Fame - Se Terminado */}
        {tournament.status === 'finished' && (
          <div style={{ position: 'relative', marginBottom: 48 }}>
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
              <button onClick={() => captureImage('print-hall-of-fame', `Campeoes_${tournament.name}`)} className="btn btn-secondary btn-sm" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                <Camera size={14} /> Guardar
              </button>
            </div>
            <div id="print-hall-of-fame" className="card-glass animate-slide-up" style={{ padding: 40, borderRadius: 32, border: '1px solid rgba(255,214,0,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 24 }}>Quadro de Honra 🏆</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
              <div style={{ transform: 'scale(1.1)' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: tournament.winner?.color || 'var(--yellow)', margin: '0 auto 20px', border: '6px solid var(--bg-card)', boxShadow: '0 0 50px rgba(255,214,0,0.4)', overflow: 'hidden' }}>
                  {tournament.winner?.logo ? <img src={tournament.winner.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 50, lineHeight: '110px' }}>🥇</span>}
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 900 }}>{tournament.winner?.name}</h2>
                <p style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: 14 }}>CAMPEÃO 2026</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
                {[
                  { label: 'Craque do Torneio (MVP)', value: tournament.mvp, icon: '🌟' },
                  { label: 'Melhor Marcador', value: tournament.bestScorer, icon: '⚽' },
                  { label: 'Melhor Guarda-redes', value: tournament.bestGoalkeeper, icon: '🧤' }
                ].filter(x => x.value).map(a => (
                  <div key={a.label} className="card" style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{a.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{a.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: 40, justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 100, maxWidth: 500, margin: '0 auto 40px' }}>
          {[
            ['standings', <BarChart2 size={16} />, 'Classificação'],
            ['calendar', <Calendar size={16} />, 'Jogos'],
            ['teams', <Users size={16} />, 'Equipas']
          ].map(([key, icon, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)} style={{ borderRadius: 100, flex: 1, height: 44 }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up">
          {tab === 'standings' && (
            standings.length === 0 ? (
              <div className="empty-state"><h3>Tabela a ser preparada...</h3><p>Os dados aparecerão logo após o primeiro apito!</p></div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="font-syne" style={{ fontSize: 20, fontWeight: 800 }}>Classificação Oficial</h3>
                  <button onClick={() => captureImage('print-standings', `Classificacao_${tournament.name}`)} className="btn btn-secondary btn-sm" style={{ border: '1px solid var(--green)', color: 'var(--green)' }}>
                    <Camera size={14} /> Guardar Tabela
                  </button>
                </div>
                <div id="print-standings" className="table-wrapper card-glass" style={{ borderRadius: 24, padding: 20 }}>
                  <table>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th><th>Equipa</th>
                      <th>J</th><th>V</th><th>E</th><th>D</th>
                      <th>DG</th><th style={{ color: 'var(--green)', textAlign: 'center' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.team._id} className={i < 3 ? `rank-${i + 1}` : ''}>
                        <td style={{ fontWeight: 800, fontSize: 18 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: s.team.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                              {s.team.logo ? <img src={s.team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{s.team.name}</span>
                          </div>
                        </td>
                        <td>{s.played}</td>
                        <td style={{ color: 'var(--green)', fontWeight: 600 }}>{s.won}</td>
                        <td>{s.drawn}</td>
                        <td style={{ color: 'var(--red)' }}>{s.lost}</td>
                        <td>{s.goalsFor - s.goalsAgainst}</td>
                        <td style={{ textAlign: 'center' }}><span style={{ background: 'var(--green)', color: '#000', fontWeight: 900, padding: '4px 12px', borderRadius: 8, fontSize: 18 }}>{s.points}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )
          )}

          {tab === 'calendar' && (
            matches.length === 0 ? (
              <div className="empty-state"><h3>Calendário em breve</h3><p>O organizador está a preparar as jornadas.</p></div>
            ) : (
              (() => {
                const rounds = [...new Set(matches.map(m => m.round))];
                return rounds.map(round => {
                  const roundMatches = matches.filter(m => m.round === round);
                  return (
                    <div key={round} style={{ marginBottom: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <h3 className="font-syne" style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>{roundMatches[0]?.roundName || `Ronda ${round}`}</h3>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--green), transparent)', opacity: 0.2 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {roundMatches.map(m => (
                          <div key={m._id} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                              <button onClick={() => captureImage(`print-match-${m._id}`, `Jogo_${m.homeTeam?.name}_vs_${m.awayTeam?.name}`)} className="btn btn-secondary btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 4 }} title="Guardar Resultado">
                                <Camera size={16} />
                              </button>
                            </div>
                            <div id={`print-match-${m._id}`} className="match-card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', padding: '20px 32px', gap: 24, flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, textAlign: 'right', fontWeight: 800, fontSize: 18 }}>{m.homeTeam?.name}</div>
                              
                              <div style={{ 
                                background: m.status === 'active' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)', 
                                padding: '12px 24px', 
                                borderRadius: 16, 
                                minWidth: 120, 
                                textAlign: 'center',
                                border: m.status === 'active' ? '1px solid var(--green)' : '1px solid var(--border)'
                              }}>
                                {m.status === 'finished' ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>{m.homeScore}</span>
                                    <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>-</span>
                                    <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>{m.awayScore}</span>
                                  </div>
                                ) : m.status === 'cancelled' ? (
                                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--red)', letterSpacing: 1 }}>CANCELADO</div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ fontSize: 20, fontWeight: 900 }}>{m.date ? new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{m.date ? new Date(m.date).toLocaleDateString() : 'A Definir'}</div>
                                  </div>
                                )}
                              </div>

                              <div style={{ flex: 1, textAlign: 'left', fontWeight: 800, fontSize: 18 }}>{m.awayTeam?.name}</div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                              {m.location && <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="var(--green)" /> {m.location}</div>}
                              {m.status === 'active' && <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} className="spin-slow" /> A DECORRER</div>}
                              {m.referee && <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>🏁 {m.referee}</div>}
                            </div>

                            {m.events?.length > 0 && (
                              <div style={{ padding: '0 32px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                                {m.events.map((e, i) => (
                                  <div key={i} style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>{e.type === 'goal' ? '⚽' : e.type === 'yellow_card' ? '🟨' : '🟥'}</span>
                                    <span style={{ fontWeight: 700 }}>{e.playerName}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()
            )
          )}

          {tab === 'teams' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {teams.map(t => (
                <div key={t._id} className="card-glass" style={{ padding: 24, borderRadius: 20 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: t.color || 'var(--green)', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
                      {t.logo ? <img src={t.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>👕</span>}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{t.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Users size={12} /> {t.players?.length || 0} Atletas
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capitão</div><div style={{ fontSize: 13, fontWeight: 700 }}>{t.captainName || '—'}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Treinador</div><div style={{ fontSize: 13, fontWeight: 700 }}>{t.coachName || '—'}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TeamRegistrationModal tournament={tournament} show={showRegistrationModal} onClose={() => setShowRegistrationModal(false)} />
      {showSponsorModal && <SponsorProposalModal tournament={tournament} onClose={() => setShowSponsorModal(false)} />}
      
      {/* Footer Branding */}
      <div style={{ padding: '60px 0 40px', textAlign: 'center', background: 'linear-gradient(to top, rgba(0,200,83,0.05), transparent)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Powered by <Link to="/" style={{ color: 'var(--green)', fontWeight: 800, textDecoration: 'none' }}>BOLA NA ZONA</Link>
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>O futebol do bairro, agora profissional.</p>
      </div>
      {showSubscribeModal && <SubscribeModal tournament={tournament} onClose={() => setShowSubscribeModal(false)} />}
    </div>
  );
}

function SubscribeModal({ tournament, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error('Preenche todos os campos.');
    setLoading(true);
    try {
      await api.post(`/tournaments/${tournament._id}/subscribe`, form);
      toast.success('Agora estás a seguir o torneio! ⚽');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao seguir torneio.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">Seguir Torneio ⚽</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Deixa o teu contacto para receberes os resultados e as próximas jornadas no teu WhatsApp!</p>
        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">O teu Nome</label>
            <input className="form-input" placeholder="Ex: Afonso" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">O teu WhatsApp</label>
            <input className="form-input" placeholder="Ex: +258 8x xxx xxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48 }}>
            {loading ? 'A processar...' : 'Ativar Notificações 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
