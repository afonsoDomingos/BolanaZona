import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Plus, ArrowRight, User, Swords, Check, X, Calendar, MapPin, Trophy, LogOut, Edit2, Save, Upload } from 'lucide-react';


import api from '../services/api';
import toast from 'react-hot-toast';
import SquadDetailsModal from '../components/SquadDetailsModal';
import ChallengeMap from '../components/ChallengeMap';
import ChallengeModal from '../components/ChallengeModal';

export default function MySquads() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', neighborhood: '', city: 'Maputo (Cidade)', category: 'Senior' });
  const [saving, setSaving] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [tab, setTab] = useState('squads');
  const [updating, setUpdating] = useState(false);
  const [showSquadDetails, setShowSquadDetails] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(null);
  const [showResultModal, setShowResultModal] = useState(null);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [managedTeams, setManagedTeams] = useState([]);
  const [selectedEditTeam, setSelectedEditTeam] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSquads = async () => {
    try {
      const [sqRes, chRes, teamsRes] = await Promise.all([
        api.get('/squads/my-squads'),
        api.get('/challenges/my-challenges'),
        api.get('/teams/my-managed-teams')
      ]);
      setSquads(sqRes.data);
      setChallenges(chRes.data);
      setManagedTeams(teamsRes.data);
    } catch {
      toast.error('Erro ao carregar as tuas equipas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('new') === 'true' || searchParams.get('create') === 'true') {
      setShowModal(true);
    }
  }, [location.search]);


  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('O nome é obrigatório.');
    setSaving(true);
    try {
      const res = await api.post('/squads', formData);
      toast.success('Clube criado! Agora adiciona os teus jogadores. ⚽', { duration: 5000 });
      setShowModal(false);
      setFormData({ name: '', neighborhood: '', city: 'Maputo (Cidade)' });
      navigate(`/dashboard/squads/${res.data._id}`);
    } catch {
      toast.error('Erro ao criar clube.');
    } finally {
      setSaving(false);
    }
  };

  const updateChallengeStatus = async (id, status, reason = '') => {
    setUpdating(true);
    try {
      const res = await api.put(`/challenges/${id}/status`, { status, rejectionReason: reason });
      toast.success(status === 'accepted' ? 'Desafio Aceite! 🔥' : 'Desafio Recusado.');
      
      if (res.data.whatsappLink) {
        toast.success('O WhatsApp vai abrir para avisares o adversário!', { duration: 4000 });
        setTimeout(() => window.open(res.data.whatsappLink, '_blank'), 500);
      }
      
      fetchSquads();
      setShowRejectionModal(null);
      setRejectionReason('');
    } catch {
      toast.error('Erro ao atualizar estado.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUnlink = async (teamId) => {
    if (!confirm('Queres mesmo sair da gestão desta equipa?')) return;
    try {
      await api.put(`/teams/${teamId}/unlink`);
      toast.success('Desvinculado com sucesso.');
      setManagedTeams(prev => prev.filter(t => t._id !== teamId));
    } catch { toast.error('Erro ao desvincular.'); }
  };

  const btnTabStyle = (t) => ({
    padding: '12px 0', background: 'none', border: 'none', flexShrink: 0,
    color: tab === t ? 'var(--green)' : 'var(--text-muted)',
    borderBottom: tab === t ? '2px solid var(--green)' : '2px solid transparent',
    fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: '0.2s',
    display: 'flex', alignItems: 'center', gap: 8
  });


  const renderContent = () => {
    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    if (tab === 'squads') {
      if (squads.length === 0) {
        return (
          <div className="empty-state card-glass">
            <Shield size={56} color="var(--green)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Ainda não tens um Clube</h3>
            <p style={{ maxWidth: 400, margin: '12px auto 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Cria o teu plantel principal uma única vez e inscreve-o facilmente em qualquer torneio.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ height: 48, padding: '0 32px' }}>
              <Plus size={18} /> Criar o meu Clube
            </button>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {squads.map(squad => (
            <Link key={squad._id} to={`/dashboard/squads/${squad._id}`} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, transition: 'all 0.2s', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${squad.color || 'var(--green)'}` }}>
                  {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : <Shield size={28} color={squad.color || 'var(--green)'} />}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>{squad.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    {squad.neighborhood && <span>📍 {squad.neighborhood}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> {squad.players?.length || 0} Jogadores</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="badge badge-green hide-mobile">Pronto a Jogar</span>
                <ArrowRight color="var(--text-muted)" size={20} />
              </div>
            </Link>
          ))}
        </div>
      );
    }

    if (tab === 'tournaments') {
      if (managedTeams.length === 0) {
        return (
          <div className="empty-state card-glass">
            <Trophy size={56} color="var(--text-muted)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Sem equipas em torneios</h3>
            <p style={{ maxWidth: 400, margin: '12px auto 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Quando um organizador te vincular a uma equipa de torneio, ela aparecerá aqui.
            </p>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {managedTeams.map(team => (
            <div key={team._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: team.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  {team.logo ? <img src={team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : <Shield size={26} color="#fff" />}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>{team.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>🏆 {team.tournament?.name}</span>
                    <span className={`badge ${team.tournament?.status === 'active' ? 'badge-green' : team.tournament?.status === 'finished' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                      {team.tournament?.status === 'active' ? 'A Decorrer' : team.tournament?.status === 'finished' ? 'Concluído' : 'Inscrições'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <User size={12} style={{ display: 'inline', marginRight: 4 }} />{team.players?.length || 0} jogadores
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => setSelectedEditTeam(team)} className="btn btn-primary btn-sm" style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 12 }}>
                  <Edit2 size={13} /> Gerir Plantel
                </button>
                <Link to={`/t/${team.tournament?.shareCode}`} className="btn btn-secondary btn-sm" style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Trophy size={13} /> Torneio
                </Link>
                <button onClick={() => handleUnlink(team._id)} className="btn btn-secondary btn-sm" style={{ height: 36, color: 'var(--red)', borderColor: 'rgba(255,0,0,0.15)', fontSize: 12, gap: 6 }}>
                  <LogOut size={13} /> Sair
                </button>
              </div>

            </div>
          ))}
        </div>
      );
    }
    if (tab === 'challenges') {
      const filtered = challenges.filter(c => c.status !== 'accepted' && c.status !== 'completed');
      if (filtered.length === 0) {
        return (
          <div className="empty-state card-glass">
            <Swords size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <p>Ainda não tens desafios pendentes ou recusados.</p>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(c => {
            const isChallenger = squads.some(s => String(s._id) === String(c.challengerSquad?._id || c.challengerSquad));
            const mySquad = isChallenger ? c.challengerSquad : c.challengedSquad;
            const opponentSquad = isChallenger ? c.challengedSquad : c.challengerSquad;

            return (
              <div key={c._id} className="card-glass" style={{ padding: 24, borderRadius: 20, borderLeft: c.status === 'pending' ? '4px solid var(--yellow)' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>
                      {isChallenger ? 'Desafio Enviado ↗️' : 'Desafio Recebido ↙️'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>{mySquad?.name}</span>
                      <Swords size={16} color="var(--red)" />
                      <button onClick={() => setShowSquadDetails(opponentSquad)} style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 18, fontWeight: 800, cursor: 'pointer', color: 'var(--green)', textDecoration: 'underline', textAlign: 'left' }}>
                        {opponentSquad?.name}
                      </button>
                    </div>
                  </div>
                  <div className={`badge ${c.status === 'pending' ? 'badge-yellow' : 'badge-gray'}`}>
                    {c.status === 'pending' ? 'Pendente' : 'Recusado'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Data do Jogo</div>
                    <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Calendar size={16} color="var(--green)" /> {c.date ? new Date(c.date).toLocaleDateString() : 'A definir'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Local / Campo</div>
                    <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <MapPin size={16} color="var(--green)" /> {c.location || 'A definir'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Tipo / Aposta</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: c.type === 'wager' ? 'var(--yellow)' : 'var(--green)' }}>
                      {c.type === 'wager' ? `💰 ${c.wagerValue}` : '🤝 Amigável'}
                    </div>
                  </div>
                </div>
                {c.status === 'pending' && !isChallenger && (
                  <div className="btn-group-responsive">
                    <button className="btn btn-primary" disabled={updating} onClick={() => updateChallengeStatus(c._id, 'accepted')} style={{ flex: 1, justifyContent: 'center' }}><Check size={16}/> Aceitar Desafio</button>
                    <button className="btn btn-secondary" disabled={updating} onClick={() => setShowRejectionModal(c._id)} style={{ flex: 1, justifyContent: 'center', color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}><X size={16}/> Recusar</button>
                  </div>
                )}
                {c.status === 'pending' && isChallenger && (
                  <div className="btn-group-responsive">
                    <button className="btn btn-secondary" onClick={() => setEditingChallenge(c)} style={{ flex: 1, justifyContent: 'center', color: 'var(--yellow)', borderColor: 'rgba(255,193,7,0.2)' }}>
                      <Calendar size={16}/> Editar Desafio
                    </button>
                  </div>
                )}
                {c.status === 'rejected' && c.rejectionReason && (
                  <div style={{ width: '100%', marginTop: 8, padding: '8px 12px', background: 'rgba(255,0,0,0.05)', borderRadius: 8, fontSize: 11, color: 'var(--red)', border: '1px solid rgba(255,0,0,0.1)' }}>
                    <strong>Motivo da recusa:</strong> {c.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'upcoming') {
      const filtered = challenges.filter(c => c.status === 'accepted');
      if (filtered.length === 0) {
        return (
          <div className="empty-state card-glass">
            <Swords size={56} color="var(--text-muted)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Sem jogos agendados</h3>
            <p style={{ maxWidth: 400, margin: '12px auto 24px', color: 'var(--text-secondary)' }}>
              Aceita desafios na aba "Desafios" para veres aqui os teus próximos confrontos!
            </p>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(c => {
            const isChallenger = squads.some(s => String(s._id) === String(c.challengerSquad?._id || c.challengerSquad));
            const mySquad = isChallenger ? c.challengerSquad : c.challengedSquad;
            const opponentSquad = isChallenger ? c.challengedSquad : c.challengerSquad;

            return (
              <div key={c._id} className="card-glass" style={{ padding: 24, borderRadius: 20, borderLeft: '4px solid var(--green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>
                      {isChallenger ? 'Desafio Enviado ↗️' : 'Desafio Recebido ↙️'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>{mySquad?.name || 'Equipa'}</span>
                      <Swords size={16} color="var(--red)" />
                      <button onClick={() => setShowSquadDetails(opponentSquad)} style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 18, fontWeight: 800, cursor: 'pointer', color: 'var(--green)', textDecoration: 'underline', textAlign: 'left' }}>
                        {opponentSquad?.name || 'Ver Oponente'}
                      </button>
                    </div>
                  </div>
                  <div className="badge badge-green">Aceite</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.1), rgba(0,200,83,0.05))', padding: 20, borderRadius: 16, border: '1px solid rgba(0,200,83,0.2)' }}>
                    <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>📅 Data Confirmada</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{c.date ? new Date(c.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'A definir'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>📍 Local do Jogo</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{c.location || 'A definir'}</div>
                    {c.mapsLink && (
                      <button onClick={() => setExpandedMap(expandedMap === c._id ? null : c._id)} style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', color: 'var(--green)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        <MapPin size={14}/> {expandedMap === c._id ? 'Ocultar Mapa' : 'Ver Mapa'}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: 100, marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Tipo: <span style={{ fontWeight: 800, color: c.type === 'wager' ? 'var(--yellow)' : 'var(--green)' }}>{c.type === 'wager' ? `💰 Aposta (${c.wagerValue})` : '🤝 Jogo Amigável'}</span>
                  </div>
                  <a href={`https://wa.me/${opponentSquad?.contact}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>Combinar no WhatsApp 💬</a>
                </div>
                <div className="btn-group-responsive">
                  <button className="btn btn-secondary" onClick={() => setShowEditDetailsModal(c)} style={{ flex: 1, justifyContent: 'center' }}><Calendar size={16}/> Editar Jogo</button>
                  <button className="btn btn-primary" onClick={() => setShowResultModal(c)} style={{ flex: 1, justifyContent: 'center' }}><Trophy size={16}/> Inserir Resultado</button>
                </div>
                {c.mapsLink && expandedMap === c._id && (
                  <ChallengeMap location={c.location} mapsLink={c.mapsLink} city={opponentSquad?.city} />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'results') {
      const filtered = challenges.filter(c => c.status === 'completed');
      if (filtered.length === 0) {
        return (
          <div className="empty-state card-glass">
            <Trophy size={56} color="var(--text-muted)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Sem resultados ainda</h3>
            <p style={{ maxWidth: 400, margin: '12px auto 24px', color: 'var(--text-secondary)' }}>Finaliza os teus jogos agendados para veres aqui o histórico de vitórias!</p>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(c => {
            const isChallenger = squads.some(s => String(s._id) === String(c.challengerSquad?._id || c.challengerSquad));
            const myScore = isChallenger ? c.result?.challengerScore : c.result?.challengedScore;
            const opponentScore = isChallenger ? c.result?.challengedScore : c.result?.challengerScore;

            const isWin = myScore > opponentScore;
            const isDraw = myScore === opponentScore;
            return (
              <div key={c._id} className="card-glass" style={{ padding: 24, borderRadius: 20, borderLeft: `4px solid ${isWin ? 'var(--green)' : isDraw ? 'var(--yellow)' : 'var(--red)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{c.date ? new Date(c.date).toLocaleDateString() : 'Sem data'} · {c.location || 'Local desconhecido'}</div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: isWin ? 'var(--green)' : isDraw ? 'var(--yellow)' : 'var(--red)' }}>{isWin ? 'VITÓRIA 🏆' : isDraw ? 'EMPATE 🤝' : 'DERROTA ❌'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{c.challengerSquad?.name || 'Equipa A'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Desafiador</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 32, fontWeight: 900 }}>{c.result?.challengerScore || 0}</span>
                    <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>-</span>
                    <span style={{ fontSize: 32, fontWeight: 900 }}>{c.result?.challengedScore || 0}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{c.challengedSquad?.name || 'Equipa B'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Desafiado</div>
                  </div>
                </div>

                {c.result?.scorers?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 16, fontSize: 12 }}>
                    {/* Challenger Scorers */}
                    <div style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.03)', paddingRight: 16 }}>
                      {c.result.scorers
                        .filter(s => String(s.teamId) === String(c.challengerSquad?._id || c.challengerSquad))
                        .map((s, i) => (
                          <div key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>
                            {s.playerName} {s.goals > 1 && `(${s.goals})`} ⚽
                          </div>
                        ))}
                    </div>
                    {/* Challenged Scorers */}
                    <div style={{ textAlign: 'left', paddingLeft: 16 }}>
                      {c.result.scorers
                        .filter(s => String(s.teamId) === String(c.challengedSquad?._id || c.challengedSquad))
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
      );
    }
  };

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Meus Clubes</h1>
            <p style={{ color: 'var(--text-secondary)' }}>A tua identidade no mundo do futebol.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '0 24px', height: 44 }}>
            <Plus size={18} /> Criar Clube
          </button>
        </div>

        <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button onClick={() => setTab('squads')} style={btnTabStyle('squads')}>A Minha Garagem</button>
          <button onClick={() => setTab('tournaments')} style={btnTabStyle('tournaments')}>
            Torneios 🏆
            {managedTeams.length > 0 && <span style={{ background: 'var(--blue)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 100 }}>{managedTeams.length}</span>}
          </button>
          <button onClick={() => setTab('challenges')} style={btnTabStyle('challenges')}>
            Desafios ⚔️
            {challenges.filter(c => c.status === 'pending').length > 0 && <span style={{ background: 'var(--red)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 100 }}>{challenges.filter(c => c.status === 'pending').length}</span>}
          </button>
          <button onClick={() => setTab('upcoming')} style={btnTabStyle('upcoming')}>
            Próximos Jogos ⚽
            {challenges.filter(c => c.status === 'accepted' && new Date(c.date) >= new Date().setHours(0,0,0,0)).length > 0 && <span style={{ background: 'var(--green)', color: '#000', fontSize: 10, padding: '2px 6px', borderRadius: 100 }}>{challenges.filter(c => c.status === 'accepted' && new Date(c.date) >= new Date().setHours(0,0,0,0)).length}</span>}
          </button>
          <button onClick={() => setTab('results')} style={btnTabStyle('results')}>Resultados 🏁</button>
        </div>




  {renderContent()}
      </div>

      {selectedEditTeam && (
        <TeamEditModal
          team={selectedEditTeam}
          onClose={() => setSelectedEditTeam(null)}
          onSaved={(updatedTeam) => {
            setManagedTeams(prev => prev.map(t => t._id === updatedTeam._id ? updatedTeam : t));
            setSelectedEditTeam(null);
            fetchSquads(); // reload
          }}
        />
      )}

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card-glass animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Novo Clube</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Cria a tua lenda no Bola na Zona.</p>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="form-label">Nome da Equipa <span style={{color: 'var(--red)'}}>*</span></label>
                <input required className="form-input" placeholder="Ex: Galáticos FC" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Província / Cidade <span style={{color: 'var(--red)'}}>*</span></label>
                <select required className="form-select" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option value="Cabo Delgado">Cabo Delgado</option>
                  <option value="Gaza">Gaza</option>
                  <option value="Inhambane">Inhambane</option>
                  <option value="Manica">Manica</option>
                  <option value="Maputo (Cidade)">Maputo (Cidade)</option>
                  <option value="Maputo (Província)">Maputo (Província)</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Niassa">Niassa</option>
                  <option value="Sofala">Sofala</option>
                  <option value="Tete">Tete</option>
                  <option value="Zambézia">Zambézia</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Escalão / Categoria</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Senior">Sénior (Livre) ⚽</option>
                  <option value="Sub-20">Sub-20 (Juniores) 🏃</option>
                  <option value="Sub-17">Sub-17 (Juvenis) 👦</option>
                  <option value="Sub-15">Sub-15 (Iniciados) 🧒</option>
                  <option value="Veteranos">Veteranos (+35) 👴</option>
                  <option value="Feminino">Feminino ♀️</option>
                </select>
              </div>

              <div>
                <label className="form-label">Bairro / Comunidade (Opcional)</label>
                <input className="form-input" placeholder="Ex: Maxaquene" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, height: 48 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, height: 48 }}>
                  {saving ? <span className="spinner"/> : 'Criar Clube'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSquadDetails && (
        <SquadDetailsModal 
          squad={showSquadDetails} 
          onClose={() => setShowSquadDetails(null)} 
        />
      )}
      {editingChallenge && (
        <ChallengeModal 
          initialData={editingChallenge}
          mySquads={squads}
          onClose={() => setEditingChallenge(null)}
          onSuccess={fetchSquads}
        />
      )}
      {showRejectionModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRejectionModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 400, padding: 32, width: '100%' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Recusar Desafio ❌</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Diz-nos o motivo (opcional) para informarmos a equipa adversária:</p>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <select 
                className="form-select" 
                onChange={e => setRejectionReason(e.target.value)}
                defaultValue=""
              >
                <option value="">Sem motivo específico</option>
                <option value="Distância muito grande">Distância muito grande 🗺️</option>
                <option value="Valor da aposta muito alto">Valor da aposta muito alto 💰</option>
                <option value="Já temos jogo agendado">Já temos jogo agendado 🗓️</option>
                <option value="Plantel incompleto nesta data">Plantel incompleto nesta data 👥</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowRejectionModal(null)} style={{ flex: 1 }}>Cancelar</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  updateChallengeStatus(showRejectionModal, 'rejected', rejectionReason);
                }}
                style={{ flex: 1, background: 'var(--red)', border: 'none', color: '#fff', justifyContent: 'center' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <ResultChallengeModal 
          challenge={showResultModal} 
          onClose={() => setShowResultModal(null)} 
          onSuccess={fetchSquads} 
        />
      )}

      {showEditDetailsModal && (
        <EditChallengeDetailsModal 
          challenge={showEditDetailsModal} 
          onClose={() => setShowEditDetailsModal(null)} 
          onSuccess={fetchSquads} 
        />
      )}
    </div>
  );
}

function ResultChallengeModal({ challenge, onClose, onSuccess }) {
  const [challengerScore, setChallengerScore] = useState('');
  const [challengedScore, setChallengedScore] = useState('');
  const [scorers, setScorers] = useState([]); // Array of { playerName, teamId, goals }
  const [challengerPlayer, setChallengerPlayer] = useState('');
  const [challengerCustomName, setChallengerCustomName] = useState('');
  const [challengedPlayer, setChallengedPlayer] = useState('');
  const [challengedCustomName, setChallengedCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (challengerScore === '' || challengedScore === '') return toast.error('Insere os resultados.');
    
    // Sum of scorer goals per team
    const challengerScorerGoals = scorers
      .filter(s => s.teamId === challenge.challengerSquad._id)
      .reduce((sum, s) => sum + s.goals, 0);
    const challengedScorerGoals = scorers
      .filter(s => s.teamId === challenge.challengedSquad._id)
      .reduce((sum, s) => sum + s.goals, 0);

    // Dynamic warning
    if (Number(challengerScore) > 0 && challengerScorerGoals !== Number(challengerScore)) {
      if (!window.confirm(`Tens a certeza que queres submeter? Adicionaste ${challengerScorerGoals} golos de marcadores para o ${challenge.challengerSquad.name}, mas o resultado final inserido foi de ${challengerScore}.`)) {
        return;
      }
    }
    if (Number(challengedScore) > 0 && challengedScorerGoals !== Number(challengedScore)) {
      if (!window.confirm(`Tens a certeza que queres submeter? Adicionaste ${challengedScorerGoals} golos de marcadores para o ${challenge.challengedSquad.name}, mas o resultado final inserido foi de ${challengedScore}.`)) {
        return;
      }
    }

    setLoading(true);
    try {
      await api.put(`/challenges/${challenge._id}/result`, { 
        challengerScore, 
        challengedScore,
        scorers
      });
      toast.success('Resultado e Marcadores registados! 🏁');
      onSuccess();
      onClose();
    } catch {
      toast.error('Erro ao registar resultado.');
    } finally {
      setLoading(false);
    }
  };

  const addScorer = (playerName, teamId) => {
    if (!playerName.trim()) return;
    // Check if player already in list
    const existingIdx = scorers.findIndex(s => s.playerName === playerName && s.teamId === teamId);
    if (existingIdx > -1) {
      const updated = [...scorers];
      updated[existingIdx].goals += 1;
      setScorers(updated);
    } else {
      setScorers([...scorers, { playerName, teamId, goals: 1 }]);
    }
  };

  const removeScorer = (idx) => {
    const updated = [...scorers];
    if (updated[idx].goals > 1) {
      updated[idx].goals -= 1;
      setScorers(updated);
    } else {
      setScorers(updated.filter((_, i) => i !== idx));
    }
  };

  const challengerScorersList = scorers.filter(s => s.teamId === challenge.challengerSquad._id);
  const challengedScorersList = scorers.filter(s => s.teamId === challenge.challengedSquad._id);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 640, padding: 32, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>Finalizar Jogo 🏁</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14, textAlign: 'center' }}>Insere o resultado final e os marcadores de golo.</p>
        
        <form onSubmit={handleSave}>
          {/* Scores input */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 800 }}>{challenge.challengerSquad.name}</div>
              <input type="number" min="0" className="score-input" style={{ width: '100%', height: 60, fontSize: 28, textAlign: 'center', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }} value={challengerScore} onChange={e => setChallengerScore(e.target.value)} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 24, marginTop: 24, color: 'var(--text-muted)' }}>×</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 800 }}>{challenge.challengedSquad.name}</div>
              <input type="number" min="0" className="score-input" style={{ width: '100%', height: 60, fontSize: 28, textAlign: 'center', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }} value={challengedScore} onChange={e => setChallengedScore(e.target.value)} />
            </div>
          </div>

          {/* Goals Scorers Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
            {/* Challenger Scorers */}
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 12 }}>Marcadores {challenge.challengerSquad.name}</h3>
              
              {Number(challengerScore) > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select 
                      style={{ flex: 1, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }}
                      value={challengerPlayer}
                      onChange={e => {
                        const name = e.target.value;
                        if (name) {
                          addScorer(name, challenge.challengerSquad._id);
                          setChallengerPlayer('');
                        }
                      }}
                    >
                      <option value="">Plantel...</option>
                      {(challenge.challengerSquad.players || []).map((p, i) => (
                        <option key={i} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input 
                      type="text" 
                      placeholder="Outro jogador..." 
                      style={{ flex: 1, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }} 
                      value={challengerCustomName}
                      onChange={e => setChallengerCustomName(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-sm btn-primary" 
                      style={{ padding: '0 12px', fontSize: 12 }}
                      onClick={() => {
                        if (challengerCustomName.trim()) {
                          addScorer(challengerCustomName, challenge.challengerSquad._id);
                          setChallengerCustomName('');
                        }
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Scorer Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {challengerScorersList.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0, 200, 83, 0.15)', border: '1px solid rgba(0, 200, 83, 0.3)', padding: '4px 10px', borderRadius: 20, fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                        <span>⚽ {s.playerName} {s.goals > 1 && `(${s.goals})`}</span>
                        <button type="button" onClick={() => removeScorer(scorers.indexOf(s))} style={{ background: 'none', border: 'none', color: '#ff1744', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 900 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nenhum golo marcado.</span>
              )}
            </div>

            {/* Challenged Scorers */}
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 12 }}>Marcadores {challenge.challengedSquad.name}</h3>
              
              {Number(challengedScore) > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select 
                      style={{ flex: 1, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }}
                      value={challengedPlayer}
                      onChange={e => {
                        const name = e.target.value;
                        if (name) {
                          addScorer(name, challenge.challengedSquad._id);
                          setChallengedPlayer('');
                        }
                      }}
                    >
                      <option value="">Plantel...</option>
                      {(challenge.challengedSquad.players || []).map((p, i) => (
                        <option key={i} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input 
                      type="text" 
                      placeholder="Outro jogador..." 
                      style={{ flex: 1, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }} 
                      value={challengedCustomName}
                      onChange={e => setChallengedCustomName(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-sm btn-primary" 
                      style={{ padding: '0 12px', fontSize: 12 }}
                      onClick={() => {
                        if (challengedCustomName.trim()) {
                          addScorer(challengedCustomName, challenge.challengedSquad._id);
                          setChallengedCustomName('');
                        }
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Scorer Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {challengedScorersList.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0, 200, 83, 0.15)', border: '1px solid rgba(0, 200, 83, 0.3)', padding: '4px 10px', borderRadius: 20, fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                        <span>⚽ {s.playerName} {s.goals > 1 && `(${s.goals})`}</span>
                        <button type="button" onClick={() => removeScorer(scorers.indexOf(s))} style={{ background: 'none', border: 'none', color: '#ff1744', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 900 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nenhum golo marcado.</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner"/> : 'Confirmar Resultado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditChallengeDetailsModal({ challenge, onClose, onSuccess }) {
  const [form, setForm] = useState({
    date: challenge.date ? new Date(challenge.date).toISOString().split('T')[0] : '',
    location: challenge.location || '',
    mapsLink: challenge.mapsLink || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/challenges/${challenge._id}/details`, form);
      toast.success('Informações atualizadas! ✍️');
      onSuccess();
      onClose();
    } catch {
      toast.error('Erro ao atualizar informações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 440, padding: 32, width: '100%' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Editar Jogo 🗓️</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Altera os detalhes do desafio agendado.</p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nova Data</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Novo Local</label>
            <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Link Google Maps (Opcional)</label>
            <input className="form-input" placeholder="https://goo.gl/maps/..." value={form.mapsLink} onChange={e => setForm({...form, mapsLink: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner"/> : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamEditModal({ team, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: team.name || '',
    captainName: team.captainName || '',
    coachName: team.coachName || '',
    contact: team.contact || '',
    color: team.color || '#00C853',
    logo: team.logo || '',
    players: team.players || []
  });
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Import local squads
  const [squads, setSquads] = useState([]);
  const [selectedSquadId, setSelectedSquadId] = useState('');

  useEffect(() => {
    api.get('/squads/my-squads').then(res => setSquads(res.data)).catch(() => {});
  }, []);

  const handleImportSquad = (e) => {
    const squadId = e.target.value;
    setSelectedSquadId(squadId);
    if (!squadId) return;

    const squad = squads.find(s => s._id === squadId);
    if (squad) {
      setForm(prev => ({
        ...prev,
        name: squad.name,
        color: squad.color || prev.color,
        logo: squad.logo || prev.logo,
        players: squad.players || []
      }));
      toast.success('Clube importado com sucesso! 🪄');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, logo: res.data.url }));
      toast.success('Logotipo carregado! 📸');
    } catch {
      toast.error('Erro ao carregar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const addPlayer = () => {
    if (!playerName.trim()) return;
    setForm(prev => ({
      ...prev,
      players: [...prev.players, {
        name: playerName.trim(),
        number: playerNumber ? Number(playerNumber) : null,
        photo: playerPhoto
      }]
    }));
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPhoto('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPlayerPhoto(res.data.url);
      toast.success('Foto carregada! 📸');
    } catch (err) {
      toast.error('Erro ao carregar foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePlayer = (index) => {
    setForm(prev => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('O nome da equipa é obrigatório.');
    setLoading(true);
    try {
      const res = await api.put(`/teams/${team._id}`, form);
      toast.success('Equipa do torneio atualizada com sucesso! 🏆');
      onSaved(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar equipa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 500, padding: 32, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>🛡️ Gerir Equipa do Torneio</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Squad importer shortcut */}
        {squads.length > 0 && (
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)', marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--green)', fontWeight: 700 }}>🪄 Importar da Minha Garagem</label>
            <select className="form-select" value={selectedSquadId} onChange={handleImportSquad} style={{ height: 40, fontSize: 13, marginTop: 6 }}>
              <option value="">Selecionar um clube local...</option>
              {squads.map(s => <option key={s._id} value={s._id}>{s.name} ({s.players?.length || 0} jog.)</option>)}
            </select>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Substitui os dados da equipa pelos dados do teu clube principal.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 68, height: 68, borderRadius: 20, background: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
              {form.logo ? (
                <img src={form.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Shield size={32} color="#fff" />
              )}
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner" style={{ width: 20, height: 20 }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: 10, fontSize: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Upload size={14} /> Carregar Logo
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cor Principal:</span>
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nome da Equipa</label>
            <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div className="form-grid form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Treinador</label>
              <input className="form-input" placeholder="Opcional" value={form.coachName} onChange={e => setForm({...form, coachName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Contacto (WhatsApp)</label>
              <input className="form-input" placeholder="Ex: +258..." value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
            </div>
          </div>

          {/* Player Management section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span>Jogadores ({form.players?.length || 0})</span>
            </h3>

            {/* Add Player Box */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, background: playerPhoto ? 'var(--green)' : 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }}>
                {uploadingPhoto ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <User size={16} color={playerPhoto ? '#000' : 'var(--text-muted)'} />}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
              </label>
              <input style={{ flex: 3, height: 38, fontSize: 13 }} className="form-input" placeholder="Nome do jogador" value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <input style={{ flex: 1, height: 38, fontSize: 13, textAlign: 'center' }} className="form-input" placeholder="Nº" type="number" value={playerNumber} onChange={e => setPlayerNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <button type="button" className="btn btn-primary" onClick={addPlayer} style={{ padding: '0 16px', height: 38 }}><Plus size={16} /></button>
            </div>

            {/* Players List scrollable */}
            <div style={{ maxHeight: 180, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {form.players.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Sem jogadores inscritos. Adiciona-os acima.</div>
              ) : (
                form.players.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      {p.number !== null && <span style={{ color: 'var(--green)', fontWeight: 700 }}>#{p.number}</span>}
                      <span>{p.name}</span>
                    </div>
                    <button className="btn btn-sm" onClick={() => removePlayer(i)} style={{ color: 'var(--red)', background: 'none', border: 'none', padding: 4 }}><X size={14} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={16} /> Salvar Plantel</>}
          </button>
        </div>
      </div>
    </div>
  );
}

