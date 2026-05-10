import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Calendar, BarChart2, Plus, Trash2, Share2, Play, Copy, X, Save } from 'lucide-react';

const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('teams');
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null);
  const [generatingCalendar, setGeneratingCalendar] = useState(false);

  const load = useCallback(async () => {
    try {
      const [tRes, teamsRes, matchesRes, standRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/teams`),
        api.get(`/tournaments/${id}/matches`),
        api.get(`/tournaments/${id}/standings`),
      ]);
      setTournament(tRes.data);
      setTeams(teamsRes.data);
      setMatches(matchesRes.data);
      setStandings(standRes.data);
    } catch { toast.error('Erro ao carregar torneio.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const generateCalendar = async () => {
    if (teams.length < 2) return toast.error('Adiciona pelo menos 2 equipas primeiro.');
    setGeneratingCalendar(true);
    try {
      const res = await api.post(`/tournaments/${id}/generate-calendar`, { startDate: tournament.startDate });
      toast.success(res.data.message);
      load();
      setTab('calendar');
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao gerar calendário.'); }
    finally { setGeneratingCalendar(false); }
  };

  const changeStatus = async (status) => {
    try {
      const res = await api.put(`/tournaments/${id}`, { status });
      setTournament(res.data);
      toast.success('Estado atualizado.');
    } catch { toast.error('Erro ao atualizar estado.'); }
  };

  const shareUrl = `${window.location.origin}/t/${tournament?.shareCode}`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado!');
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;
  if (!tournament) return <div className="page"><div className="container"><p>Torneio não encontrado.</p></div></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/dashboard/tournaments')} className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800 }}>{tournament.name}</h1>
                <span className={`badge ${statusBadge[tournament.status]}`}>{statusLabel[tournament.status]}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>📍 {tournament.neighborhood} · 🏟️ {tournament.location} · 👥 {teams.length}/{tournament.maxTeams} equipas</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tournament.status === 'draft' && (
                <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('registration')}>Abrir Inscrições</button>
              )}
              {tournament.status === 'registration' && (
                <button className="btn btn-primary btn-sm" onClick={() => changeStatus('active')}>
                  <Play size={14} /> Iniciar Torneio
                </button>
              )}
              {tournament.status === 'active' && (
                <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('finished')}>Finalizar</button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={copyShare}><Share2 size={14} /> Partilhar</button>
            </div>
          </div>
        </div>

        {/* Share Box */}
        <div className="share-box" style={{ marginBottom: 24 }}>
          <Share2 size={16} color="var(--green)" />
          <span className="share-url">{shareUrl}</span>
          <button className="btn btn-primary btn-sm" onClick={copyShare}><Copy size={13} /> Copiar</button>
          <Link to={`/t/${tournament.shareCode}`} target="_blank" className="btn btn-secondary btn-sm">Ver Público</Link>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 28 }}>
          {[['teams', <Users size={14} />, 'Equipas'], ['calendar', <Calendar size={14} />, 'Calendário'], ['standings', <BarChart2 size={14} />, 'Classificação']].map(([key, icon, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* TEAMS TAB */}
        {tab === 'teams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Equipas ({teams.length}/{tournament.maxTeams})</h2>
              {teams.length < tournament.maxTeams && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowTeamModal(true)}><Plus size={14} /> Adicionar Equipa</button>
              )}
            </div>
            {teams.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={48} strokeWidth={1} /></div>
                <h3>Sem equipas ainda</h3>
                <p style={{ marginBottom: 20 }}>Adiciona as equipas para começar</p>
                <button className="btn btn-primary" onClick={() => setShowTeamModal(true)}><Plus size={16} /> Adicionar Equipa</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {teams.map(t => (
                  <div key={t._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👕</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.captainName || 'Sem capitão'}</div>
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{ padding: '6px 8px' }} onClick={async () => {
                        if (!confirm(`Eliminar equipa "${t.name}"?`)) return;
                        await api.delete(`/tournaments/${id}/teams/${t._id}`);
                        setTeams(prev => prev.filter(x => x._id !== t._id));
                        toast.success('Equipa eliminada.');
                      }}><Trash2 size={13} /></button>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <span className="badge badge-gray">👥 {t.players?.length || 0} jogadores</span>
                      {t.contact && <span className="badge badge-gray">📞 {t.contact}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {teams.length >= 2 && matches.length === 0 && (
              <div style={{ marginTop: 24, padding: 20, background: 'var(--green-subtle)', border: '1px solid rgba(0,200,83,0.3)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>📅 Pronto para gerar o calendário!</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{teams.length} equipas registadas. Gera os jogos automaticamente.</div>
                </div>
                <button className="btn btn-primary" onClick={generateCalendar} disabled={generatingCalendar}>
                  {generatingCalendar ? 'A gerar...' : <><Calendar size={15} /> Gerar Calendário</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === 'calendar' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Calendário ({matches.length} jogos)</h2>
              <button className="btn btn-secondary btn-sm" onClick={generateCalendar} disabled={generatingCalendar || teams.length < 2}>
                <Calendar size={14} /> {matches.length > 0 ? 'Regenerar' : 'Gerar Calendário'}
              </button>
            </div>
            {matches.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Calendar size={48} strokeWidth={1} /></div>
                <h3>Calendário não gerado</h3>
                <p style={{ marginBottom: 20 }}>Adiciona as equipas e gera o calendário automaticamente</p>
              </div>
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
                            <div className="match-team">
                              <div className="match-team-name">{m.homeTeam?.name || '—'}</div>
                            </div>
                            <div className="match-score">
                              {m.status === 'finished' ? (
                                <>
                                  <div className="match-score-value" style={{ color: 'var(--green)' }}>{m.homeScore}</div>
                                  <div className="match-divider">×</div>
                                  <div className="match-score-value" style={{ color: 'var(--green)' }}>{m.awayScore}</div>
                                </>
                              ) : (
                                <>
                                  <div className="match-score-value" style={{ color: 'var(--text-muted)', fontSize: 20 }}>—</div>
                                  <div className="match-divider">vs</div>
                                  <div className="match-score-value" style={{ color: 'var(--text-muted)', fontSize: 20 }}>—</div>
                                </>
                              )}
                            </div>
                            <div className="match-team" style={{ textAlign: 'left' }}>
                              <div className="match-team-name">{m.awayTeam?.name || '—'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              {m.status !== 'finished' ? (
                                <button className="btn btn-primary btn-sm" onClick={() => setShowResultModal(m)}>Resultado</button>
                              ) : (
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowResultModal(m)}>Editar</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        )}

        {/* STANDINGS TAB */}
        {tab === 'standings' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Classificação</h2>
            {standings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BarChart2 size={48} strokeWidth={1} /></div>
                <h3>Sem dados de classificação</h3>
                <p>Insere resultados para ver a tabela actualizada</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Equipa</th>
                      <th>J</th><th>V</th><th>E</th><th>D</th>
                      <th>GM</th><th>GS</th><th>DG</th>
                      <th style={{ color: 'var(--green)' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.team._id} className={i < 3 ? `rank-${i + 1}` : ''}>
                        <td style={{ fontWeight: 700 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: s.team.color || 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👕</div>
                            <span style={{ fontWeight: 600 }}>{s.team.name}</span>
                          </div>
                        </td>
                        <td>{s.played}</td>
                        <td style={{ color: 'var(--green)' }}>{s.won}</td>
                        <td>{s.drawn}</td>
                        <td style={{ color: 'var(--red)' }}>{s.lost}</td>
                        <td>{s.goalsFor}</td>
                        <td>{s.goalsAgainst}</td>
                        <td style={{ color: s.goalsFor - s.goalsAgainst >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {s.goalsFor - s.goalsAgainst > 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD TEAM MODAL */}
      {showTeamModal && <AddTeamModal tournamentId={id} onClose={() => setShowTeamModal(false)} onSaved={(team) => { setTeams(prev => [...prev, team]); setShowTeamModal(false); }} />}

      {/* RESULT MODAL */}
      {showResultModal && <ResultModal match={showResultModal} tournamentId={id} onClose={() => setShowResultModal(null)} onSaved={() => { setShowResultModal(null); load(); }} />}
    </div>
  );
}

function AddTeamModal({ tournamentId, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', captainName: '', contact: '', color: '#00C853', players: [] });
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const addPlayer = () => {
    if (!playerName.trim()) return;
    setForm(prev => ({ ...prev, players: [...prev.players, { name: playerName.trim() }] }));
    setPlayerName('');
  };

  const removePlayer = (i) => setForm(prev => ({ ...prev, players: prev.players.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome da equipa obrigatório.');
    setLoading(true);
    try {
      const res = await api.post(`/tournaments/${tournamentId}/teams`, form);
      toast.success('Equipa adicionada!');
      onSaved(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao adicionar equipa.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Equipa</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Nome da Equipa *</label>
            <input className="form-input" placeholder="Ex: FC Maianga" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Capitão</label>
              <input className="form-input" placeholder="Nome do capitão" value={form.captainName} onChange={e => setForm(p => ({ ...p, captainName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Contacto</label>
              <input className="form-input" placeholder="Telemóvel" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cor da Equipa</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                style={{ width: 48, height: 40, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', padding: 2 }} />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Cor do equipamento</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Jogadores</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Nome do jogador" value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <button className="btn btn-primary btn-sm" onClick={addPlayer}><Plus size={14} /></button>
            </div>
            {form.players.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {form.players.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 100, padding: '4px 12px', fontSize: 13 }}>
                    {p.name}
                    <button onClick={() => removePlayer(i)} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'A guardar...' : <><Save size={15} /> Guardar Equipa</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultModal({ match, tournamentId, onClose, onSaved }) {
  const [home, setHome] = useState(match.homeScore ?? '');
  const [away, setAway] = useState(match.awayScore ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (home === '' || away === '') return toast.error('Insere os dois resultados.');
    setLoading(true);
    try {
      await api.put(`/tournaments/${tournamentId}/matches/${match._id}/result`, {
        homeScore: Number(home), awayScore: Number(away),
      });
      toast.success('Resultado guardado!');
      onSaved();
    } catch { toast.error('Erro ao guardar resultado.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Inserir Resultado</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{match.roundName}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 28 }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{match.homeTeam?.name}</div>
              <input type="number" min="0" className="score-input" value={home} onChange={e => setHome(e.target.value)} />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 22 }}>×</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{match.awayTeam?.name}</div>
              <input type="number" min="0" className="score-input" value={away} onChange={e => setAway(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'A guardar...' : <><Save size={15} /> Guardar Resultado</>}
          </button>
        </div>
      </div>
    </div>
  );
}
