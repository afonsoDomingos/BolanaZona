import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, ArrowRight, Trophy, User, X, Save, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showErrorToast, ErrorContactAdminBanner } from '../utils/toastUtils';


const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };
const formatLabel = { groups: 'Fase de Grupos', knockout: 'Mata-mata', groups_knockout: 'Grupos + Mata-mata' };

export default function TournamentList() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedMatches, setExpandedMatches] = useState({});
  const [matchesByTournament, setMatchesByTournament] = useState({});
  const [showResultModal, setShowResultModal] = useState(null);

  const load = useCallback(() => {
    api.get('/tournaments')
      .then(res => setTournaments(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load matches for a tournament when expanded
  const toggleMatches = async (tId) => {
    if (expandedMatches[tId]) {
      setExpandedMatches(prev => ({ ...prev, [tId]: false }));
      return;
    }
    setExpandedMatches(prev => ({ ...prev, [tId]: true }));
    if (!matchesByTournament[tId]) {
      try {
        const res = await api.get(`/tournaments/${tId}`);
        setMatchesByTournament(prev => ({ ...prev, [tId]: res.data.matches || [] }));
      } catch { toast.error('Erro ao carregar jogos.'); }
    }
  };

  const refreshMatches = async (tId) => {
    try {
      const res = await api.get(`/tournaments/${tId}`);
      setMatchesByTournament(prev => ({ ...prev, [tId]: res.data.matches || [] }));
    } catch {}
  };

  const filtered = tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.neighborhood.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!confirm(`Eliminar "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/tournaments/${id}`);
      setTournaments(prev => prev.filter(t => t._id !== id));
      toast.success('Torneio eliminado.');
    } catch { toast.error('Erro ao eliminar.'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800 }}>
              {user?.role === 'superadmin' ? 'Todos os Torneios' : 'Os Meus Torneios'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {user?.role === 'superadmin' ? `${tournaments.length} torneios na plataforma` : `${tournaments.length} torneio(s) criado(s)`}
            </p>
          </div>
          <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Novo Torneio</Link>
        </div>

        <div style={{ background: 'linear-gradient(to right, rgba(0,200,83,0.1), rgba(0,0,0,0))', borderLeft: '4px solid var(--green)', padding: '16px 20px', borderRadius: 8, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Primeira vez a organizar?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Vê o nosso guia passo-a-passo de como gerir o teu torneio como um profissional.</p>
          </div>
          <Link to="/como-criar-torneio" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Ler o Guia <ArrowRight size={14} />
          </Link>
        </div>

        {tournaments.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Pesquisar por nome ou bairro..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Trophy size={64} strokeWidth={1} /></div>
            <h3>{search ? 'Nenhum resultado' : 'Sem torneios ainda'}</h3>
            <p style={{ marginBottom: 24 }}>Cria o teu primeiro torneio agora!</p>
            {!search && <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Criar Torneio</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(t => {
              const isOpen = expandedMatches[t._id];
              const tMatches = matchesByTournament[t._id] || [];
              const pendingMatches = tMatches.filter(m => m.status !== 'finished' && m.status !== 'cancelled');
              const hasActiveMatches = t.status === 'active';

              return (
                <div key={t._id} className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚽</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>📍 {t.neighborhood}</div>
                    </div>
                    <span className={`badge ${statusBadge[t.status]}`} style={{ fontSize: 10, padding: '3px 8px', letterSpacing: 0.3, flexShrink: 0, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {t.status === 'active' ? '● A Decorrer' : statusLabel[t.status]}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    <span className="badge badge-gray" style={{ fontSize: 11, padding: '3px 8px' }}>👥 {t.maxTeams} eq.</span>
                    <span className="badge badge-gray" style={{ fontSize: 11, padding: '3px 8px' }}>{formatLabel[t.format]}</span>
                    {t.createdBy && (
                      <span className="badge badge-gray" style={{ fontSize: 11, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={9} /> {t.createdBy.name || 'Sistema'}
                      </span>
                    )}
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Link to={`/dashboard/tournaments/${t._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: 13 }}>
                      Gerir <ArrowRight size={13} />
                    </Link>
                    {hasActiveMatches && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                        onClick={() => toggleMatches(t._id)}
                        title="Ver/Lançar Resultados"
                      >
                        <Trophy size={13} />
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" style={{ padding: '8px 12px' }} onClick={() => handleDelete(t._id, t.name)}>
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Expandable match list */}
                  {isOpen && (
                    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      {!matchesByTournament[t._id] ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><div className="spinner" style={{ width: 20, height: 20 }} /></div>
                      ) : tMatches.length === 0 ? (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>Sem jogos criados.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {/* Show pending first, then finished */}
                          {[...tMatches].sort((a, b) => {
                            if (a.status === 'finished' && b.status !== 'finished') return 1;
                            if (a.status !== 'finished' && b.status === 'finished') return -1;
                            return (a.round || 0) - (b.round || 0);
                          }).map(m => (
                            <div key={m._id} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--border)',
                              borderRadius: 10, padding: '8px 12px',
                              flexWrap: 'wrap'
                            }}>
                              {/* Teams + score */}
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                  {m.homeTeam?.name || '?'}
                                </span>
                                <span style={{
                                  fontSize: 13, fontWeight: 900, flexShrink: 0,
                                  color: m.status === 'finished' ? 'var(--green)' : 'var(--text-muted)',
                                  background: m.status === 'finished' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${m.status === 'finished' ? 'rgba(0,200,83,0.2)' : 'var(--border)'}`,
                                  borderRadius: 6, padding: '2px 8px', minWidth: 52, textAlign: 'center'
                                }}>
                                  {m.status === 'finished' ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'right' }}>
                                  {m.awayTeam?.name || '?'}
                                </span>
                              </div>

                              {/* Action button */}
                              {m.status !== 'finished' && m.status !== 'cancelled' ? (
                                <button
                                  className="btn btn-primary btn-sm animate-pulse-light"
                                  style={{ fontSize: 11, padding: '5px 10px', height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, width: 'auto' }}
                                  onClick={() => setShowResultModal({ match: m, tournamentId: t._id, teamsList: [] })}
                                >
                                  <CheckCircle size={12} /> Lançar
                                </button>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: 11, padding: '5px 10px', height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, width: 'auto', color: 'var(--green)', border: '1px solid rgba(0,200,83,0.2)' }}
                                  onClick={() => setShowResultModal({ match: m, tournamentId: t._id, teamsList: [] })}
                                >
                                  ✏️ Editar
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <QuickResultModal
          match={showResultModal.match}
          tournamentId={showResultModal.tournamentId}
          onClose={() => setShowResultModal(null)}
          onSaved={() => {
            const tId = showResultModal.tournamentId;
            setShowResultModal(null);
            refreshMatches(tId);
          }}
        />
      )}
    </div>
  );
}

function QuickResultModal({ match, tournamentId, onClose, onSaved }) {
  const [home, setHome] = useState(match.homeScore ?? '');
  const [away, setAway] = useState(match.awayScore ?? '');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSave = async (customStatus) => {
    if (home === '' || away === '') return toast.error('Insere os dois resultados.');
    setSaving(true);
    setApiError(null);
    try {
      await api.put(`/tournaments/${tournamentId}/matches/${match._id}/result`, {
        homeScore: Number(home),
        awayScore: Number(away),
        status: customStatus || 'finished'
      });
      toast.success(customStatus === 'live' ? 'Live Atualizado! 📡' : 'Resultado guardado! ✅');
      onSaved();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Erro ao guardar resultado.';
      setApiError(errMsg);
      showErrorToast(errMsg);
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 400 }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)', margin: '-4px auto 14px' }} />

        <div className="modal-header">
          <h2 className="modal-title">Lançar Resultado</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <ErrorContactAdminBanner error={apiError} />

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
          {match.homeTeam?.name || '?'} <span style={{ color: 'var(--text-muted)' }}>vs</span> {match.awayTeam?.name || '?'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {match.homeTeam?.name || 'Casa'}
            </div>
            <input
              type="number" min="0"
              className="score-input"
              value={home}
              onChange={e => setHome(e.target.value)}
              style={{ width: 72 }}
            />
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 20, paddingTop: 26 }}>×</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {match.awayTeam?.name || 'Fora'}
            </div>
            <input
              type="number" min="0"
              className="score-input"
              value={away}
              onChange={e => setAway(e.target.value)}
              style={{ width: 72 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, height: 44, justifyContent: 'center', fontSize: 13 }}
            onClick={() => handleSave('live')}
            disabled={saving}
          >
            📡 Live
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, height: 44, justifyContent: 'center', fontSize: 13 }}
            onClick={() => handleSave('finished')}
            disabled={saving}
          >
            {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Save size={14} /> Guardar Resultado</>}
          </button>
        </div>
      </div>
    </div>
  );
}
