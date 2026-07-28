import { useState, useEffect } from 'react';
import { Shield, MapPin, Users, X, Phone, Swords, Calendar, Award } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SquadDetailsModal({ squad, onClose, onChallenge }) {
  const [activeTab, setActiveTab] = useState('players'); // 'players' | 'history'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!squad) return;
    
    // Fetch match history public challenges for this squad
    setLoadingHistory(true);
    api.get(`/challenges/squad/${squad._id}`)
      .then(res => {
        setHistory(res.data);
      })
      .catch(() => {
        console.error('Erro ao carregar o histórico de jogos.');
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [squad]);

  if (!squad) return null;

  const wins = squad.stats?.wins || 0;
  const draws = squad.stats?.draws || 0;
  const losses = squad.stats?.losses || 0;
  const matches = squad.stats?.matchesPlayed || 0;
  const goalsFor = squad.stats?.goalsFor || 0;
  const goalsAgainst = squad.stats?.goalsAgainst || 0;
  const goalDiff = goalsFor - goalsAgainst;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#090d18', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', padding: 0, boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
        
        {/* Banner Cover Header */}
        <div style={{
          height: 140,
          position: 'relative',
          background: squad.banner 
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(9,13,24,0.95)), url(${squad.banner}) center/cover no-repeat`
            : 'linear-gradient(135deg, rgba(0,200,83,0.2) 0%, rgba(9,13,24,0.95) 100%)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#000000', background: 'var(--green)', padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(0,200,83,0.3)' }}>
            ⚽ {squad.category || 'Senior'}
          </div>

          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Info Header */}
        <div style={{ padding: '0 24px 20px', marginTop: -42 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, background: '#090d18', border: `3px solid ${squad.color || 'var(--green)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.6)', flexShrink: 0 }}>
              {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={44} color={squad.color || 'var(--green)'} />}
            </div>

            {squad.createdAt && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.06)' }}>
                🗓️ Fundado em {new Date(squad.createdAt).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', marginBottom: 6, letterSpacing: -0.5 }}>{squad.name}</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} color="var(--green)" /> {squad.city || 'Maputo'}{squad.neighborhood ? ` • ${squad.neighborhood}` : ''}
            </div>
            {squad.contact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={15} color="var(--green)" /> {squad.contact}
              </div>
            )}
          </div>

          {squad.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 18 }}>
              {squad.description}
            </p>
          )}

          {/* Performance Stats Bar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Desempenho Desportivo</h3>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', background: 'rgba(0,200,83,0.1)', padding: '2px 8px', borderRadius: 100 }}>
                {winRate}% Vitórias
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ padding: '8px 4px', background: 'rgba(0,200,83,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>{wins}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vitórias</div>
              </div>
              <div style={{ padding: '8px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff' }}>{draws}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Empates</div>
              </div>
              <div style={{ padding: '8px 4px', background: 'rgba(255,68,68,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--red)' }}>{losses}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Derrotas</div>
              </div>
              <div style={{ padding: '8px 4px', background: 'rgba(255,193,7,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--yellow)' }}>{squad.stats?.tournamentsWon || 0}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Títulos</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 14, paddingTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span>⚽ Golos Marcados: <strong style={{ color: '#fff' }}>{goalsFor}</strong></span>
              <span>🛡️ Golos Sofridos: <strong style={{ color: '#fff' }}>{goalsAgainst}</strong></span>
              <span>📊 Saldo (DG): <strong style={{ color: goalDiff >= 0 ? 'var(--green)' : 'var(--red)' }}>{goalDiff > 0 ? `+${goalDiff}` : goalDiff}</strong></span>
            </div>
          </div>

          {/* Tabs navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, gap: 16 }}>
            <button 
              onClick={() => setActiveTab('players')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'players' ? '3px solid var(--green)' : '3px solid transparent',
                color: activeTab === 'players' ? '#ffffff' : 'var(--text-muted)',
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <Users size={16} color={activeTab === 'players' ? 'var(--green)' : 'currentColor'} /> Plantel de Jogadores ({squad.players?.length || 0})
            </button>
            
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'history' ? '3px solid var(--green)' : '3px solid transparent',
                color: activeTab === 'history' ? '#ffffff' : 'var(--text-muted)',
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <Calendar size={16} color={activeTab === 'history' ? 'var(--green)' : 'currentColor'} /> Histórico de Jogos ({history.length})
            </button>
          </div>

          {/* Tab contents */}
          {activeTab === 'players' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(!squad.players || squad.players.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                    Este clube ainda não registou jogadores no plantel.
                  </div>
                ) : (
                  squad.players.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} color="var(--text-muted)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {p.number !== undefined && p.number !== null && <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--green)', background: 'rgba(0,200,83,0.1)', padding: '1px 6px', borderRadius: 6 }}>#{p.number}</span>}
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>{p.name}</span>
                          {p.isCaptain && <span style={{ fontSize: 12 }} title="Capitão da Equipa">👑</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {p.position && <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>{p.position === 'GK' ? 'Guarda-Redes' : p.position === 'DEF' ? 'Defesa' : p.position === 'MID' ? 'Médio' : p.position === 'FWD' ? 'Avançado' : p.position}</span>}
                          {p.notes && <span>• {p.notes}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {loadingHistory ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div className="spinner" />
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                  <Swords size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                  <div>Ainda não disputou desafios oficiais.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.map(ch => {
                    const isChallenger = ch.challengerSquad._id === squad._id;
                    const myScore = isChallenger ? ch.result?.challengerScore : ch.result?.challengedScore;
                    const oppScore = isChallenger ? ch.result?.challengedScore : ch.result?.challengerScore;
                    const opponent = isChallenger ? ch.challengedSquad : ch.challengerSquad;
                    
                    let outcomeBadge = 'badge-gray';
                    let outcomeText = 'Empate';
                    if (myScore > oppScore) {
                      outcomeBadge = 'badge-green';
                      outcomeText = 'Vitória';
                    } else if (myScore < oppScore) {
                      outcomeBadge = 'badge-red';
                      outcomeText = 'Derrota';
                    }

                    return (
                      <div key={ch._id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        
                        {/* Top date + status badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: 'var(--text-muted)' }}>📅 {new Date(ch.date).toLocaleDateString('pt-PT')} • {ch.location || 'Campo Oficial'}</span>
                          <span className={`badge ${outcomeBadge}`} style={{ fontSize: 10, padding: '3px 10px', textTransform: 'uppercase', fontWeight: 800, borderRadius: 100 }}>{outcomeText}</span>
                        </div>

                        {/* Versus row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                          
                          {/* My Squad */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: squad.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                              {squad.logo ? <img src={squad.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={16} color="#fff" />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ffffff' }}>{squad.name}</span>
                          </div>

                          {/* Score display */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', margin: '0 12px' }}>
                            <span style={{ fontWeight: 900, fontSize: 16, color: myScore > oppScore ? 'var(--green)' : myScore < oppScore ? 'var(--red)' : '#ffffff' }}>{myScore}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>-</span>
                            <span style={{ fontWeight: 900, fontSize: 16, color: oppScore > myScore ? 'var(--green)' : oppScore < myScore ? 'var(--red)' : '#ffffff' }}>{oppScore}</span>
                          </div>

                          {/* Opponent Squad */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{opponent?.name}</span>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: opponent?.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                              {opponent?.logo ? <img src={opponent.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={16} color="#fff" />}
                            </div>
                          </div>

                        </div>

                        {ch.result?.scorers?.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10, fontSize: 11 }}>
                            {/* My Squad Scorers */}
                            <div style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.04)', paddingRight: 10 }}>
                              {ch.result.scorers
                                .filter(s => String(s.teamId) === String(squad._id))
                                .map((s, i) => (
                                  <div key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>
                                    {s.playerName} {s.goals > 1 && `(${s.goals})`} ⚽
                                  </div>
                                ))}
                            </div>
                            {/* Opponent Squad Scorers */}
                            <div style={{ textAlign: 'left', paddingLeft: 10 }}>
                              {ch.result.scorers
                                .filter(s => String(s.teamId) === String(opponent?._id || opponent))
                                .map((s, i) => (
                                  <div key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>
                                    ⚽ {s.playerName} {s.goals > 1 && `(${s.goals})`}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {onChallenge && (
            <div style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={onChallenge} style={{ width: '100%', justifyContent: 'center', height: 50, borderRadius: 16, background: 'var(--green)', color: '#000000', fontWeight: 900, border: 'none', fontSize: 15 }}>
                <Swords size={18} /> Lançar Desafio Direto a {squad.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
}
