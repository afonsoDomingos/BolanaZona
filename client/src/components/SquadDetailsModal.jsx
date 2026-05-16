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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: 500, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `2px solid ${squad.color || 'var(--green)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={32} color={squad.color || 'var(--green)'} />}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{squad.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--green)" /> {squad.city || 'Maputo'}{squad.neighborhood ? ` - ${squad.neighborhood}` : ''}
              </div>
              {squad.contact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  <Phone size={14} color="var(--green)" /> {squad.contact}
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--yellow)', background: 'rgba(255, 193, 7, 0.1)', padding: '4px 10px', borderRadius: 100, marginTop: 8, textTransform: 'uppercase', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                ⚽ {squad.category || 'Senior'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Estatísticas na Liga</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>{squad.stats?.wins || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vitórias</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.draws || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Empates</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--red)' }}>{squad.stats?.losses || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Derrotas</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--yellow)' }}>{squad.stats?.tournamentsWon || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Títulos</div></div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 20, gap: 16 }}>
          <button 
            onClick={() => setActiveTab('players')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'players' ? '2px solid var(--green)' : '2px solid transparent',
              color: activeTab === 'players' ? '#fff' : 'var(--text-muted)',
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
            <Users size={16} /> Plantel ({squad.players?.length || 0})
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--green)' : '2px solid transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text-muted)',
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
            <Calendar size={16} /> Histórico de Jogos ({history.length})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'players' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(!squad.players || squad.players.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                  Este clube ainda não registou jogadores.
                </div>
              ) : (
                squad.players.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={18} color="var(--text-muted)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.number !== undefined && p.number !== null && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)' }}>#{p.number}</span>}
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                      </div>
                      {p.position && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.position === 'GK' ? 'Guarda-Redes' : p.position === 'DEF' ? 'Defesa' : p.position === 'MID' ? 'Médio' : p.position === 'FWD' ? 'Avançado' : p.position}</div>}
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
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                <Swords size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
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
                    <div key={ch._id} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      
                      {/* Top date + badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                        <span style={{ color: 'var(--text-muted)' }}>📅 {new Date(ch.date).toLocaleDateString('pt-PT')}</span>
                        <span className={`badge ${outcomeBadge}`} style={{ fontSize: 9, padding: '2px 8px', textTransform: 'uppercase', fontWeight: 800 }}>{outcomeText}</span>
                      </div>

                      {/* Versus row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                        
                        {/* My Squad */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: squad.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {squad.logo ? <img src={squad.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={14} color="#fff" />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>{squad.name}</span>
                        </div>

                        {/* Score display */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, margin: '0 12px' }}>
                          <span style={{ fontWeight: 900, fontSize: 14, color: myScore > oppScore ? 'var(--green)' : myScore < oppScore ? 'var(--red)' : '#fff' }}>{myScore}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>-</span>
                          <span style={{ fontWeight: 900, fontSize: 14, color: oppScore > myScore ? 'var(--green)' : oppScore < myScore ? 'var(--red)' : '#fff' }}>{oppScore}</span>
                        </div>

                        {/* Opponent Squad */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{opponent?.name}</span>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: opponent?.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {opponent?.logo ? <img src={opponent.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={14} color="#fff" />}
                          </div>
                        </div>

                      </div>

                      {ch.result?.scorers?.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 10, fontSize: 11 }}>
                          {/* My Squad Scorers */}
                          <div style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.03)', paddingRight: 10 }}>
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
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onChallenge} style={{ width: '100%', justifyContent: 'center', height: 52, background: 'var(--red)', color: '#fff', border: 'none' }}>
              <Swords size={18} /> Lançar Desafio a {squad.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
