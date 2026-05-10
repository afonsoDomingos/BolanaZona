import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Calendar, BarChart2, Users, Share2 } from 'lucide-react';

const formatLabel = { groups: 'Fase de Grupos', knockout: 'Mata-mata', groups_knockout: 'Grupos + Mata-mata' };
const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };

export default function PublicTournament() {
  const { shareCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('standings');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/tournaments/public/${shareCode}`)
      .then(res => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copiado!');
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>⚽</div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Torneio não encontrado</h1>
      <p style={{ color: 'var(--text-secondary)' }}>O link pode estar incorreto ou o torneio foi removido.</p>
      <Link to="/" className="btn btn-primary">Ir para a página inicial</Link>
    </div>
  );

  const { tournament, teams, matches, standings } = data;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,200,83,0.15) 0%, transparent 60%), var(--bg-secondary)',
        borderBottom: '1px solid var(--border)', padding: '40px 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-subtle)', border: '2px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⚽</div>
                <div>
                  <h1 className="font-syne" style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800 }}>{tournament.name}</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>📍 {tournament.neighborhood} · 🏟️ {tournament.location}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${statusBadge[tournament.status]}`}>{statusLabel[tournament.status]}</span>
                <span className="badge badge-gray">👥 {teams.length} equipas</span>
                <span className="badge badge-gray">{formatLabel[tournament.format]}</span>
                {tournament.prize && <span className="badge badge-yellow">🥇 {tournament.prize}</span>}
              </div>
            </div>
            <button onClick={copyLink} className="btn btn-secondary btn-sm">
              <Share2 size={14} /> Partilhar
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 28 }}>
            {[
              { label: 'Equipas', value: teams.length, icon: <Users size={18} /> },
              { label: 'Jogos', value: matches.length, icon: <Calendar size={18} /> },
              { label: 'Terminados', value: matches.filter(m => m.status === 'finished').length, icon: <Trophy size={18} /> },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ color: 'var(--green)' }}>{s.icon}</div>
                <div><div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container" style={{ paddingTop: 28 }}>
        <div className="tabs" style={{ marginBottom: 28 }}>
          {[['standings', <BarChart2 size={14} />, 'Classificação'], ['calendar', <Calendar size={14} />, 'Jogos'], ['teams', <Users size={14} />, 'Equipas']].map(([key, icon, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* STANDINGS */}
        {tab === 'standings' && (
          standings.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📊</div><h3>Sem resultados ainda</h3><p>Aguarda pelos primeiros jogos!</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Equipa</th>
                    <th>J</th><th>V</th><th>E</th><th>D</th>
                    <th>GM</th><th>GS</th><th>DG</th>
                    <th style={{ color: 'var(--green)' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => (
                    <tr key={s.team._id} className={i < 3 ? `rank-${i + 1}` : ''}>
                      <td style={{ fontWeight: 700 }}>{i + 1}</td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: s.team.color || '#00C853', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s.team.logo ? <img src={s.team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.team.name}</span>
                      </div></td>
                      <td>{s.played}</td>
                      <td style={{ color: 'var(--green)' }}>{s.won}</td>
                      <td>{s.drawn}</td>
                      <td style={{ color: 'var(--red)' }}>{s.lost}</td>
                      <td>{s.goalsFor}</td><td>{s.goalsAgainst}</td>
                      <td style={{ color: s.goalsFor - s.goalsAgainst >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {s.goalsFor - s.goalsAgainst > 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* CALENDAR */}
        {tab === 'calendar' && (
          matches.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📅</div><h3>Calendário não gerado ainda</h3></div>
          ) : (
            (() => {
              const rounds = [...new Set(matches.map(m => m.round))];
              return rounds.map(round => {
                const roundMatches = matches.filter(m => m.round === round);
                return (
                  <div key={round} style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ background: 'var(--green)', color: '#000', fontWeight: 800, fontSize: 13, padding: '4px 14px', borderRadius: 100 }}>
                        {roundMatches[0]?.roundName || `Ronda ${round}`}
                      </div>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {roundMatches.map(m => (
                        <div key={m._id} className="match-card">
                          <div className="match-team"><div className="match-team-name">{m.homeTeam?.name || '—'}</div></div>
                          <div className="match-score">
                            {m.status === 'finished' ? (
                              <>
                                <div className="match-score-value" style={{ color: 'var(--green)' }}>{m.homeScore}</div>
                                <div className="match-divider">×</div>
                                <div className="match-score-value" style={{ color: 'var(--green)' }}>{m.awayScore}</div>
                              </>
                            ) : (
                              <>
                                <div className="match-score-value" style={{ color: 'var(--text-muted)', fontSize: 18 }}>—</div>
                                <div className="match-divider">vs</div>
                                <div className="match-score-value" style={{ color: 'var(--text-muted)', fontSize: 18 }}>—</div>
                              </>
                            )}
                          </div>
                          <div className="match-team" style={{ textAlign: 'left' }}><div className="match-team-name">{m.awayTeam?.name || '—'}</div></div>
                          <span className={`badge ${m.status === 'finished' ? 'badge-green' : 'badge-gray'}`} style={{ flexShrink: 0 }}>
                            {m.status === 'finished' ? 'Terminado' : 'Agendado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()
          )
        )}

        {/* TEAMS */}
        {tab === 'teams' && (
          teams.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><h3>Sem equipas registadas</h3></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {teams.map(t => (
                <div key={t._id} className="card">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color || '#00C853', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.logo ? <img src={t.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>👥 {t.players?.length || 0} jogadores</div>
                    </div>
                  </div>
                  {t.captainName && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>🏅 Capitão: {t.captainName}</div>}
                </div>
              ))}
            </div>
          )
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Feito com ⚽ · <Link to="/" style={{ color: 'var(--green)' }}>Bola na Zona</Link> · Cria o teu torneio grátis
          </p>
        </div>
      </div>
    </div>
  );
}
