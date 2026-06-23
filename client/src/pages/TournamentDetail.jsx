import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Calendar, BarChart2, Plus, Trash2, Share2, Play, Copy, X, Save, MapPin, Edit2, Camera, MessageCircle, Shield, Trophy } from 'lucide-react';

import MatchShareModal from '../components/MatchShareModal';
import LinkManagerModal from '../components/LinkManagerModal';


const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('calendar');
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editTeamData, setEditTeamData] = useState(null);
  const [showResultModal, setShowResultModal] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showEditMatchModal, setShowEditMatchModal] = useState(null);
  const [showEditTournamentModal, setShowEditTournamentModal] = useState(false);
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [generatingCalendar, setGeneratingCalendar] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  // Array para armazenar logs de depuração e helper para adicioná‑los
  const [debugLogs, setDebugLogs] = useState([]);
  const addLog = (msg) => setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [viewMode, setViewMode] = useState('bracket');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');


  const { user: currentUser } = useAuth();
  const isOwner = currentUser && tournament && (
    (typeof tournament.createdBy === 'string' && tournament.createdBy === currentUser._id) ||
    (tournament.createdBy?._id === currentUser._id)
  );
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const canManage = isOwner || isAdmin;

  const load = useCallback(async () => {
    addLog('Starting load()');
    try {
      const [tRes, sRes, subRes, propRes, leadRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/standings`),
        api.get(`/tournaments/${id}/subscribers`),
        api.get(`/tournaments/${id}/sponsor-proposals`),
        api.get(`/leads?tournamentId=${id}`)
      ]);
      setTournament(tRes.data.tournament);
      setTeams(tRes.data.teams);
      setMatches(tRes.data.matches);

      if (tRes.data.tournament?.format === 'groups') {
        setViewMode('list');
      }

      // Redirecionamento de segurança: Se não for dono, admin ou superadmin, vai para a página pública
      const ownerId = tRes.data.tournament.createdBy?._id || tRes.data.tournament.createdBy;
      if (currentUser && currentUser.role !== 'superadmin' && currentUser.role !== 'admin' && ownerId !== currentUser._id) {
        navigate(`/t/${tRes.data.tournament.shareCode}`, { replace: true });
        return;
      }

      setStandings(sRes.data);
      setSubscribers(subRes.data);
      setProposals(propRes.data);
      setLeads(leadRes.data);
    } catch (err) {
      console.error(err);
      addLog(`Error in load(): ${err.message || err}`);
      toast.error('Erro ao carregar detalhes do torneio.');
    } finally {
      setLoading(false);
      addLog('Finished load()');
    }
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

  const changeStatus = async (status, awards = {}) => {
    if (status === 'active') {
      const approvedTeams = teams.filter(t => t.status === 'approved');
      if (approvedTeams.length < 2) {
        toast.error('❌ Precisas de pelo menos 2 equipas confirmadas para iniciar o torneio.');
        return;
      }
      if (matches.length === 0) {
        toast.error('❌ Precisas de gerar o calendário primeiro antes de iniciar.');
        setTab('calendar');
        return;
      }
    }

    try {
      // Quando inicia a competição, fecha automaticamente as inscrições públicas
      const extraPayload = status === 'active' ? { allowPublicRegistration: false } : {};
      const res = await api.put(`/tournaments/${id}`, { status, ...extraPayload, ...awards });
      setTournament(res.data);
      if (status === 'active') {
        toast.success('Torneio iniciado! Inscrições encerradas automaticamente. 🚀');
      } else {
        toast.success('Estado atualizado.');
      }
    } catch { toast.error('Erro ao atualizar estado.'); }
  };

  const handleApproveTeam = async (teamId) => {
    try {
      await api.put(`/tournaments/${id}/teams/${teamId}`, { status: 'approved' });
      toast.success('Equipa aprovada! 🎉');
      load();
    } catch { toast.error('Erro ao aprovar equipa.'); }
  };

  const handleRejectTeam = async (teamId) => {
    if (!window.confirm('Rejeitar esta inscrição?')) return;
    try {
      await api.delete(`/tournaments/${id}/teams/${teamId}`);
      toast.success('Inscrição rejeitada.');
      load();
    } catch { toast.error('Erro ao rejeitar equipa.'); }
  };

  const handleDeleteTournament = async () => {
    if (!window.confirm('Tens a certeza que desejas eliminar este torneio permanentemente? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/tournaments/${id}`);
      toast.success('Torneio eliminado com sucesso.');
      navigate('/dashboard/tournaments');
    } catch { toast.error('Erro ao eliminar torneio.'); }
  };

  const shareUrl = `${window.location.origin}/t/${tournament?.shareCode}`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado!');
  };

  const shareMatchWhatsApp = (m) => {
    const homeName = m.homeTeam?.name || 'Casa';
    const awayName = m.awayTeam?.name || 'Fora';
    const scoreText = m.status === 'finished' ? `*${m.homeScore} - ${m.awayScore}*` : 'v';
    
    let eventsText = '';
    if (m.events?.length > 0) {
      eventsText = '\n⚽ *Golos/Cartões:* \n' + m.events.map(e => {
        const icon = e.type === 'goal' ? '⚽' : e.type === 'yellow_card' ? '🟨' : '🟥';
        return `${icon} ${e.playerName} (${e.team === m.homeTeam?._id ? 'Casa' : 'Fora'})`;
      }).join('\n');
    }

    const text = `🏆 *BOLA NA ZONA - RELATÓRIO* 🏆\n\n` +
                 `🏟️ *Torneio:* ${tournament.name}\n` +
                 `⚔️ *Jogo:* ${homeName} ${scoreText} ${awayName}\n` +
                 `📍 *Local:* ${m.location || tournament.location}\n` +
                 (m.referee ? `🏁 *Árbitro:* ${m.referee}\n` : '') +
                 eventsText +
                 `\n\n📊 *Ver Classificação:* ${shareUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
                {canManage && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => setShowEditTournamentModal(true)} title="Editar"><Edit2 size={13} /></button>
                    {(tournament.status !== 'finished' || isSuperAdmin) && (
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: 'var(--red)' }} onClick={handleDeleteTournament} title="Eliminar Torneio"><Trash2 size={13} /></button>
                    )}
                  </div>
                )}
                <span className={`badge ${statusBadge[tournament.status]}`}>{statusLabel[tournament.status]}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>📍 {tournament.neighborhood} · 🏟️ {tournament.location} · 👥 {teams.length}/{tournament.maxTeams} equipas</p>
              {tournament.createdBy && (
                <p style={{ color: 'var(--green)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>
                  🛡️ Organizador: {tournament.createdBy.name || 'Sistema'} {tournament.createdBy.email && `(${tournament.createdBy.email})`}
                </p>
              )}
            </div>
            
            {/* Financial Summary */}
            {tournament.registrationFee > 0 && (
              <div style={{ display: 'flex', gap: 24, background: 'rgba(0,200,83,0.05)', padding: '12px 24px', borderRadius: 16, border: '1px solid rgba(0,200,83,0.1)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Arrecadado</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>
                    {teams.reduce((acc, t) => acc + (t.amountPaid || 0), 0).toLocaleString()} MT
                  </div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expectativa</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {(tournament.maxTeams * tournament.registrationFee).toLocaleString()} MT
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {canManage && (
                <>
                  {tournament.status === 'draft' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('registration')}>Abrir Inscrições</button>
                  )}
                  {tournament.status === 'registration' && (
                    <button className="btn btn-primary btn-sm" onClick={() => changeStatus('active')}>
                      <Play size={14} /> Iniciar Torneio
                    </button>
                  )}
                  {tournament.status === 'active' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowFinishModal(true)}>Finalizar</button>
                  )}
                </>
              )}
              <button className="btn btn-secondary btn-sm" onClick={copyShare}><Share2 size={14} /> Partilhar</button>
            </div>
          </div>
        </div>

        {/* Onboarding Checklist for Organizer */}
        {canManage && tournament.status !== 'finished' && (
          <div className="card" style={{ marginBottom: 24, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <h3 className="font-syne" style={{ fontSize: 18, fontWeight: 800 }}>Guia de Organização</h3>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Progresso: <span style={{ color: 'var(--green)' }}>{Math.round(([true, tournament.status !== 'draft', teams.filter(t => t.status === 'approved').length >= 2, matches.length > 0, tournament.status === 'active'].filter(Boolean).length / 5) * 100)}%</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${([true, tournament.status !== 'draft', teams.filter(t => t.status === 'approved').length >= 2, matches.length > 0, tournament.status === 'active'].filter(Boolean).length / 5) * 100}%`, 
                background: 'var(--green)', 
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
              }} />
            </div>

            {/* Checklist Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: '1. Criar Torneio', done: true, action: null },
                { label: '2. Abrir Inscrições', done: tournament.status !== 'draft', action: tournament.status === 'draft' ? () => changeStatus('registration') : null },
                { label: `3. Equipas (${teams.filter(t => t.status === 'approved').length}/${tournament.maxTeams})`, done: teams.filter(t => t.status === 'approved').length >= 2, action: () => setTab('teams') },
                { label: `4. Gerar Jogos (${matches.length})`, done: matches.length > 0, action: () => setTab('calendar') },
                { label: '5. Iniciar Competição', done: tournament.status === 'active', action: tournament.status === 'registration' ? () => changeStatus('active') : null }
              ].map((step, idx) => (
                <div key={idx} 
                  onClick={step.action}
                  className={step.action && !step.done ? "pulse-animation" : ""}
                  style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: step.done ? 'rgba(0, 200, 83, 0.05)' : (step.action ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.01)'), 
                  border: step.done ? '1px solid rgba(0, 200, 83, 0.2)' : (step.action ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border)'),
                  borderRadius: 12, 
                  padding: '10px 14px', 
                  fontSize: 13,
                  color: step.done ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                  cursor: step.action ? 'pointer' : 'default'
                }}>
                  <span style={{ color: step.done ? 'var(--green)' : (step.action ? '#fff' : 'var(--text-muted)'), fontWeight: 'bold' }}>
                    {step.done ? '✓' : (step.action ? '▶' : '○')}
                  </span>
                  <span style={{ fontWeight: step.action && !step.done ? 600 : 400, color: step.action && !step.done ? '#fff' : 'inherit' }}>{step.label}</span>
                </div>
              ))}
            </div>

            {/* Alert/Action Message */}
            <div className="alert" style={{ 
              background: 'rgba(0, 200, 83, 0.04)', 
              border: '1px solid rgba(0, 200, 83, 0.15)', 
              color: '#fff',
              fontSize: 14,
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <span style={{ fontSize: 18, marginTop: -2 }}>💡</span>
              <div style={{ flex: 1 }}>
                {tournament.status === 'draft' && (
                  <span><strong>Próximo Passo:</strong> O teu torneio está em modo <em>Rascunho</em>. Clica em <strong>Abrir Inscrições</strong> no topo superior direito para permitir inscrições de equipas.</span>
                )}
                {tournament.status === 'registration' && teams.filter(t => t.status === 'approved').length < 2 && (
                  <span><strong>Próximo Passo:</strong> As inscrições estão abertas! Partilha o link de inscrição com as equipas ou clica em <strong>Adicionar Equipa</strong> na aba de equipas abaixo. Precisas de pelo menos 2 equipas confirmadas.</span>
                )}
                {tournament.status === 'registration' && teams.filter(t => t.status === 'approved').length >= 2 && matches.length === 0 && (
                  <span><strong>Próximo Passo:</strong> Tens {teams.filter(t => t.status === 'approved').length} equipas confirmadas! Acede à aba <strong>Calendário</strong> abaixo e clica em <strong>Gerar Calendário</strong> para criar a tabela de jogos.</span>
                )}
                {tournament.status === 'registration' && matches.length > 0 && (
                  <span><strong>Próximo Passo:</strong> O calendário está pronto com {matches.length} jogos! Quando estiver tudo a postos para começar a primeira jornada, clica no botão <strong>Iniciar Torneio</strong> no topo direito.</span>
                )}
                {tournament.status === 'active' && (
                  <span><strong>Torneio a Decorrer:</strong> Lança os golos e marcadores dos jogos na aba <strong>Calendário</strong> para atualizar a tabela de classificação automaticamente em tempo real!</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share & Registration Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Public Page Share */}
          <div className="share-box" style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-start', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Share2 size={16} color="var(--green)" />
              <strong style={{ fontSize: 14 }}>Página Pública do Torneio</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Partilha com os adeptos para acompanharem a classificação e resultados.</p>
            <div style={{ display: 'flex', gap: 8, width: '100%', background: 'var(--bg-main)', padding: 8, borderRadius: 8 }}>
              <span className="share-url" style={{ flex: 1, fontSize: 12 }}>{shareUrl}</span>
              <button className="btn btn-secondary btn-sm" onClick={copyShare}><Copy size={13} /> Copiar</button>
              <Link to={`/t/${tournament.shareCode}`} target="_blank" className="btn btn-primary btn-sm">Ver</Link>
            </div>
          </div>
          
          {/* Registration Toggle & Link */}
          <div className="share-box" style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-start', padding: 20, border: tournament.allowPublicRegistration ? '1px solid var(--green)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color={tournament.allowPublicRegistration ? "var(--green)" : "var(--text-muted)"} />
                <strong style={{ fontSize: 14 }}>Inscrições de Equipas</strong>
              </div>
              {canManage && (
                <div 
                  onClick={async () => {
                    try {
                      const res = await api.put(`/tournaments/${id}`, { allowPublicRegistration: !tournament.allowPublicRegistration });
                      setTournament(res.data);
                      toast.success(res.data.allowPublicRegistration ? 'Inscrições Abertas!' : 'Inscrições Encerradas!');
                    } catch { toast.error('Erro ao alterar permissão.'); }
                  }}
                  style={{ 
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: '0.3s',
                    background: tournament.allowPublicRegistration ? 'var(--green)' : 'var(--bg-main)',
                    border: '1px solid ' + (tournament.allowPublicRegistration ? 'var(--green)' : 'var(--border)')
                  }}
                >
                  <div style={{ 
                    width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, 
                    left: tournament.allowPublicRegistration ? 22 : 2, transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {tournament.allowPublicRegistration 
                ? 'As equipas podem inscrever-se de forma autónoma. Envia-lhes este link:' 
                : 'As inscrições públicas estão fechadas. Apenas tu podes adicionar equipas.'}
            </p>
            {tournament.allowPublicRegistration && (
              <div style={{ display: 'flex', gap: 8, width: '100%', background: 'var(--bg-main)', padding: 8, borderRadius: 8 }}>
                <span className="share-url" style={{ flex: 1, fontSize: 12 }}>{shareUrl}?reg=true</span>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(`${shareUrl}?reg=true`);
                  toast.success('Link de Inscrição copiado! 🔗');
                }}><Copy size={13} /> Copiar Link Privado</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 28 }}>
          {[
            ['teams', <Users size={14} />, 'Equipas'],
            ['calendar', <Calendar size={14} />, 'Calendário'],
            ['standings', <BarChart2 size={14} />, 'Classificação'],
            ['info', <MapPin size={14} />, 'Localização'],
            ['sponsors', <Share2 size={14} />, 'Patrocínios'],
            ['subscribers', <MessageCircle size={14} />, 'Seguidores'],
            ['leads', <Users size={14} />, 'Interessados']
          ].map(([key, icon, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* TEAMS TAB */}
        {tab === 'teams' && (
          <div>
            {/* Pending Teams Section */}
            {teams.filter(t => t.status === 'pending').length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠️ Inscrições Pendentes ({teams.filter(t => t.status === 'pending').length})
                </h3>
                {canManage ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {teams.filter(t => t.status === 'pending').map(t => (
                      <div key={t._id} className="card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>👤 {t.captainName} · 📞 {t.contact}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>📋 {t.players?.length} jogadores</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveTeam(t._id)} style={{ padding: '6px 12px' }}>Aprovar</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleRejectTeam(t._id)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Existem inscrições a aguardar aprovação pelo organizador.</p>
                )}
                <div className="divider" style={{ margin: '32px 0' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Equipas Confirmadas ({teams.filter(t => t.status === 'approved').length}/{tournament.maxTeams})</h2>
              {canManage && teams.filter(t => t.status === 'approved').length < tournament.maxTeams && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowTeamModal(true)}><Plus size={14} /> Adicionar Equipa</button>
              )}
            </div>
            {teams.filter(t => t.status === 'approved').length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={48} strokeWidth={1} /></div>
                <h3>Sem equipas confirmadas</h3>
                <p style={{ marginBottom: 20 }}>Adiciona ou aprova equipas para começar</p>
                <button className="btn btn-primary" onClick={() => setShowTeamModal(true)}><Plus size={16} /> Adicionar Equipa</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {teams.filter(t => t.status === 'approved').map(t => (
                  <div key={t._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div 
                          onClick={() => t.logo && setPreviewImage(t.logo)}
                          style={{ 
                            width: 40, height: 40, borderRadius: 10, background: t.color || 'var(--green)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            overflow: 'hidden', flexShrink: 0, cursor: t.logo ? 'pointer' : 'default' 
                          }}
                        >
                          {t.logo ? <img src={t.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.captainName || 'Sem capitão'}</div>
                        </div>
                      </div>
                      {canManage && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} onClick={() => {
                            setEditTeamData(t);
                            setShowTeamModal(true);
                          }}><Edit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm" style={{ padding: '6px 8px' }} onClick={async () => {
                            if (!confirm(`Eliminar equipa "${t.name}"?`)) return;
                            await api.delete(`/tournaments/${id}/teams/${t._id}`);
                            setTeams(prev => prev.filter(x => x._id !== t._id));
                            toast.success('Equipa eliminada.');
                          }}><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-gray">👥 {t.players?.length || 0} jogadores</span>
                      {t.contact && <span className="badge badge-gray">📞 {t.contact}</span>}
                      {tournament.registrationFee > 0 && (
                        <span className={`badge ${t.paymentStatus === 'paid' ? 'badge-green' : t.paymentStatus === 'partial' ? 'badge-yellow' : 'badge-red'}`}>
                          {t.paymentStatus === 'paid' ? '✅ Pago' : t.paymentStatus === 'partial' ? `⏳ ${t.amountPaid} MT` : '❌ Pendente'}
                        </span>
                      )}
                    </div>

                    {canManage && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {t.captains && t.captains.length > 0 ? (
                            <span style={{ color: 'var(--green)', fontWeight: 600 }}>✅ Gestor Vinculado</span>
                          ) : (
                            <span>⚠️ Sem gestor</span>
                          )}
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => setShowLinkModal(t)}
                        >
                          {t.captains && t.captains.length > 0 ? 'Gerir Gestores' : 'Vincular Gestor'}
                        </button>

                      </div>
                    )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Calendário ({matches.length} jogos)</h2>
                {matches.length > 0 && tournament?.format !== 'groups' && (
                  <div className="view-switcher">
                    <button 
                      className={`switcher-btn ${viewMode === 'bracket' ? 'active' : ''}`} 
                      onClick={() => setViewMode('bracket')}
                    >
                      🌳 Árvore
                    </button>
                    <button 
                      className={`switcher-btn ${viewMode === 'list' ? 'active' : ''}`} 
                      onClick={() => setViewMode('list')}
                    >
                      📋 Lista
                    </button>
                  </div>
                )}
              </div>
              {canManage && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowManualMatchModal(true)}>
                    <Plus size={14} /> Adicionar Jogo
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={generateCalendar} disabled={generatingCalendar || teams.length < 2}>
                    <Calendar size={14} /> {matches.length > 0 ? 'Regenerar' : 'Gerar Calendário'}
                  </button>
                </div>
              )}
            </div>
            {matches.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Calendar size={48} strokeWidth={1} /></div>
                <h3>Calendário não gerado</h3>
                <p style={{ marginBottom: 20 }}>Adicione jogos manualmente ou gere o calendário automaticamente após aprovar as equipas</p>
              </div>
            ) : (
              viewMode === 'bracket' ? (
                <>
                  {/* Round Filter */}
                  {(() => {
                    const rList = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
                    const maxR = Math.max(...rList);
                    const getRName = (round) => {
                      const mInRound = matches.filter(m => m.round === round).length;
                      const distFromFinal = maxR - round;
                      const customName = matches.find(m => m.round === round)?.roundName;
                      if (customName) return customName;
                      if (distFromFinal === 0) return 'Final';
                      if (distFromFinal === 1) return mInRound <= 2 ? 'Meias-Finais' : 'Semifinal';
                      if (distFromFinal === 2) return 'Quartos de Final';
                      if (distFromFinal === 3) return 'Oitavos de Final';
                      if (distFromFinal === 4) return '1/16 de Final';
                      return `Fase ${round}`;
                    };
                    if (rList.length <= 1) return null;
                    return (
                      <div className="view-switcher" style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                        <button 
                          className={`switcher-btn ${selectedRoundFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setSelectedRoundFilter('all')}
                          style={{ fontSize: 12, padding: '6px 12px', height: 'auto', borderRadius: '8px' }}
                        >
                          🌳 Árvore Completa
                        </button>
                        {rList.map(r => (
                          <button 
                            key={r}
                            className={`switcher-btn ${selectedRoundFilter === r.toString() ? 'active' : ''}`}
                            onClick={() => setSelectedRoundFilter(r.toString())}
                            style={{ fontSize: 12, padding: '6px 12px', height: 'auto', borderRadius: '8px' }}
                          >
                            {getRName(r)}
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="bracket-scroll-container full-width-bleed" style={{
                      position: 'relative',
                      backgroundImage: 'url(/loginbg1.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      minHeight: 'calc(100vh - 280px)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 150px, black calc(100% - 150px), transparent 100%)',
                      maskImage: 'linear-gradient(to bottom, transparent 0%, black 150px, black calc(100% - 150px), transparent 100%)'
                    }}>
                      {/* Dark overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,36,0.85)', zIndex: 0 }} />
                  <div className="bracket-container" style={{ position: 'relative', zIndex: 1 }}>
                    {(() => {
                      const bracketMatches = matches.filter(m => m.phase === 'knockout');

                      if (bracketMatches.length === 0) {
                        return (
                          <div className="empty-state" style={{ width: '100%' }}>
                            <div className="empty-state-icon"><Trophy size={48} strokeWidth={1} /></div>
                            <h3>Fase a Eliminar (Mata-Mata)</h3>
                            <p>Os jogos das eliminatórias ainda não foram criados para este torneio.</p>
                          </div>
                        );
                      }

                      const rounds = [...new Set(bracketMatches.map(m => m.round))].sort((a, b) => a - b);
                      const maxRound = Math.max(...rounds);
                      const finalMatches = bracketMatches.filter(m => m.round === maxRound);

                      const getRoundName = (round) => {
                        const matchesInRound = bracketMatches.filter(m => m.round === round).length;
                        const distFromFinal = maxRound - round; // 0 = final, 1 = semis, 2 = quarters, etc
                        const customName = bracketMatches.find(m => m.round === round)?.roundName;
                        if (customName) return customName;
                        if (distFromFinal === 0) return 'Final';
                        if (distFromFinal === 1) return matchesInRound <= 2 ? 'Meias-Finais' : 'Semifinal';
                        if (distFromFinal === 2) return 'Quartos de Final';
                        if (distFromFinal === 3) return 'Oitavos de Final';
                        if (distFromFinal === 4) return '1/16 de Final';
                        return `Fase ${round}`;
                      };

                      const isDoubleLegged = (round) => {
                        const rMatches = bracketMatches.filter(m => m.round === round);
                        return rMatches.some(m => m.leg === 2 || m.leg === '2');
                      };

                      const renderMatchCard = (m) => {
                        const homeWinner = m.status === 'finished' && m.homeScore > m.awayScore;
                        const awayWinner = m.status === 'finished' && m.awayScore > m.homeScore;
                        return (
                          <div key={m._id} className="bracket-match-node">
                            <div 
                              className="bracket-match-card" 
                              style={{ 
                                position: 'relative', 
                                opacity: m.status === 'finished' ? 0.65 : 1,
                                cursor: canManage ? 'pointer' : 'default'
                              }}
                              onClick={canManage ? () => setShowResultModal(m) : undefined}
                              title={canManage ? "Clique para lançar resultado" : undefined}
                            >
                              {/* Casa */}
                              <div className={`bracket-team-row ${homeWinner ? 'winner' : ''}`}>
                                <div className="bracket-team-info">
                                  <div className="bracket-team-logo" style={{ borderColor: m.homeTeam?.color || 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                    {m.homeTeam?.logo ? <img src={m.homeTeam.logo} alt="" /> : (m.homeTeam?.name ? m.homeTeam.name.charAt(0).toUpperCase() : '?')}
                                  </div>
                                  <span className="bracket-team-name" title={m.homeTeam?.name || 'A anunciar'}>
                                    {m.homeTeam?.name || 'A anunciar'}
                                  </span>
                                </div>
                                <span className="bracket-team-score">
                                  {m.status === 'finished' || m.status === 'live' || m.status === 'active' ? m.homeScore : '—'}
                                </span>
                              </div>

                              {/* Fora */}
                              <div className={`bracket-team-row ${awayWinner ? 'winner' : ''}`}>
                                <div className="bracket-team-info">
                                  <div className="bracket-team-logo" style={{ borderColor: m.awayTeam?.color || 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                    {m.awayTeam?.logo ? <img src={m.awayTeam.logo} alt="" /> : (m.awayTeam?.name ? m.awayTeam.name.charAt(0).toUpperCase() : '?')}
                                  </div>
                                  <span className="bracket-team-name" title={m.awayTeam?.name || 'A anunciar'}>
                                    {m.awayTeam?.name || 'A anunciar'}
                                  </span>
                                </div>
                                <span className="bracket-team-score">
                                  {m.status === 'finished' || m.status === 'live' || m.status === 'active' ? m.awayScore : '—'}
                                </span>
                              </div>

                              {/* Info & Ações */}
                              <div className="bracket-meta-bar">
                                <div className="bracket-meta-date">
                                  {m.status === 'live' || m.status === 'active' ? (
                                    <span style={{ color: 'var(--green)', fontWeight: 800 }}>● LIVE</span>
                                  ) : m.status === 'finished' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                      <span style={{ color: 'var(--green)', fontWeight: 900, background: 'rgba(0,200,83,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '8px' }}>✓ TERMINADO</span>
                                      {m.date && (
                                        <span>
                                          {new Date(m.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) + ' ' +
                                           new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  ) : m.date ? (
                                    new Date(m.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) + ' ' +
                                    new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                                  ) : (
                                    'Agendado'
                                  )}
                                </div>
                                <div className="bracket-actions">
                                  <button 
                                    className="bracket-action-btn whatsapp" 
                                    onClick={(e) => { e.stopPropagation(); shareMatchWhatsApp(m); }} 
                                    title="Partilhar WhatsApp"
                                  >
                                    <MessageCircle size={11} />
                                  </button>
                                  {canManage && (
                                    <>
                                      <button 
                                        className="bracket-action-btn" 
                                        onClick={(e) => { e.stopPropagation(); setShowEditMatchModal(m); }} 
                                        title="Editar Jogo"
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button 
                                        className="bracket-action-btn" 
                                        onClick={(e) => { e.stopPropagation(); setShowResultModal(m); }} 
                                        title="Lançar Resultado"
                                        style={
                                          m.status !== 'finished' 
                                            ? { background: 'var(--green)', color: '#000', borderColor: 'var(--green)', opacity: 1, boxShadow: '0 0 10px rgba(0,200,83,0.5)' }
                                            : { background: 'rgba(0, 200, 83, 0.1)', color: 'var(--green)', borderColor: 'rgba(0, 200, 83, 0.2)' }
                                        }
                                      >
                                        <Trophy size={11} />
                                      </button>
                                      <button 
                                        className="bracket-action-btn" 
                                        onClick={(e) => { e.stopPropagation(); setShowShareModal(m); }} 
                                        title="Partilhar Imagem"
                                      >
                                        <Camera size={11} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      };

                      const nonFinalRounds = rounds.filter(r => r !== maxRound);
                      const filteredNonFinalRounds = nonFinalRounds.filter(r => selectedRoundFilter === 'all' || selectedRoundFilter === r.toString());
                      
                      const leftColumns = filteredNonFinalRounds.map((round) => {
                        const roundMatches = bracketMatches.filter(m => m.round === round);
                        const leftMatches = roundMatches.slice(0, Math.ceil(roundMatches.length / 2));
                        if (leftMatches.length === 0) return null;
                        const roundName = getRoundName(round);
                        const double = isDoubleLegged(round);
                        return (
                          <div key={`left-${round}`} className="bracket-column">
                            <div className="bracket-round-title">
                              {roundName}
                              {double && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.7 }}>2 mãos</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 16 }}>
                              {leftMatches.map(renderMatchCard)}
                            </div>
                          </div>
                        );
                      });

                      const rightColumns = filteredNonFinalRounds.map((round) => {
                        const roundMatches = bracketMatches.filter(m => m.round === round);
                        const rightMatches = roundMatches.slice(Math.ceil(roundMatches.length / 2));
                        if (rightMatches.length === 0) return null;
                        const roundName = getRoundName(round);
                        const double = isDoubleLegged(round);
                        return (
                          <div key={`right-${round}`} className="bracket-column right-side">
                            <div className="bracket-round-title">
                              {roundName}
                              {double && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.7 }}>2 mãos</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 16 }}>
                              {rightMatches.map(renderMatchCard)}
                            </div>
                          </div>
                        );
                      }).reverse();

                      // For groups format, we don't have a single crowned champion from the final match
                      // We rely on the tournament winner if set, or just leave it blank
                      const crownedChampion = tournament.winner || null;
                      const showFinal = selectedRoundFilter === 'all' || selectedRoundFilter === maxRound.toString();

                      return (
                        <>
                          <div className="bracket-left-wing">
                            {leftColumns}
                          </div>

                          {showFinal && finalMatches[0] && (() => {
                            const finalMatch = finalMatches[0];
                            const homeQualified = !!finalMatch?.homeTeam;
                            const awayQualified = !!finalMatch?.awayTeam;
                            const bothQualified = homeQualified && awayQualified;
                            const finalFinished = finalMatch?.status === 'finished';
                            const pendingCount = (!homeQualified ? 1 : 0) + (!awayQualified ? 1 : 0);

                            const renderFinalTeam = (team, label) => {
                              if (team) {
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div className="bracket-team-logo bracket-final-team-logo" style={{ borderColor: team.color || 'var(--green)', color: '#fff', boxShadow: `0 0 18px ${team.color || 'rgba(0,200,83,0.4)'}` }}>
                                      {team.logo ? <img src={team.logo} alt="" /> : team.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', textAlign: 'center', maxWidth: 110, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                      {team.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                                      ✓ Apurado
                                    </div>
                                  </div>
                                );
                              }
                              // Slot vazio — a aguardar
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                  <div className="bracket-team-logo bracket-final-team-logo" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', animation: 'pulse 2s ease-in-out infinite' }}>
                                    ⏳
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 110 }}>
                                    {label}
                                  </div>
                                  <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                    Jogo em falta
                                  </div>
                                </div>
                              );
                            };

                            return (
                              <div className="bracket-center-final">
                                {/* 4 cantos neon — um span por canto */}
                                <span className="final-corner final-corner--tl" />
                                <span className="final-corner final-corner--tr" />
                                <span className="final-corner final-corner--bl" />
                                <span className="final-corner final-corner--br" />

                                <div className="bracket-header-title" style={{ textAlign: 'center', width: '100%', marginBottom: 10 }}>
                                  <div className="bracket-final-subtitle">ROAD TO</div>
                                  <div className="bracket-final-title">{tournament.name}</div>
                                </div>

                                {/* Status badge when pending */}
                                {!bothQualified && (
                                  <div style={{
                                    background: 'rgba(245,158,11,0.15)',
                                    border: '1px solid rgba(245,158,11,0.4)',
                                    borderRadius: 8,
                                    padding: '5px 12px',
                                    fontSize: 11,
                                    color: '#f59e0b',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    marginBottom: 10,
                                    letterSpacing: 0.5
                                  }}>
                                    ⏳ {pendingCount === 2 ? 'Aguarda 2 jogos' : 'Aguarda 1 jogo'}
                                  </div>
                                )}

                                {/* Home Team (Top) */}
                                {renderFinalTeam(finalMatch?.homeTeam, 'Finalista 1')}

                                <div className="bracket-trophy-column" style={{ margin: '10px 0' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src="/TACA.png" alt="Troféu" className="bracket-final-trophy-img" />
                                    <div className="bracket-final-title">{tournament.name}</div>
                                    <div className="bracket-final-subtitle">FINAL</div>
                                    {/* Show score if final is played */}
                                    {finalFinished && (
                                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontWeight: 900, fontSize: 22, color: finalMatch.homeScore > finalMatch.awayScore ? 'var(--green)' : 'var(--text-muted)' }}>{finalMatch.homeScore}</span>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>-</span>
                                        <span style={{ fontWeight: 900, fontSize: 22, color: finalMatch.awayScore > finalMatch.homeScore ? 'var(--green)' : 'var(--text-muted)' }}>{finalMatch.awayScore}</span>
                                      </div>
                                    )}
                                    {crownedChampion && (
                                      <div style={{ marginTop: 12, fontWeight: 900, color: crownedChampion.color || 'var(--yellow)', fontSize: 16 }}>
                                        🏆 {crownedChampion.name}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Away Team (Bottom) */}
                                {renderFinalTeam(finalMatch?.awayTeam, 'Finalista 2')}

                                {/* Click to launch result */}
                                {canManage && bothQualified && (
                                  <div
                                    onClick={() => setShowResultModal(finalMatch)}
                                    style={{
                                      marginTop: 12,
                                      cursor: 'pointer',
                                      background: finalFinished ? 'rgba(0,200,83,0.1)' : 'var(--green)',
                                      color: finalFinished ? 'var(--green)' : '#000',
                                      border: '1px solid var(--green)',
                                      borderRadius: 8,
                                      padding: '6px 16px',
                                      fontSize: 11,
                                      fontWeight: 800,
                                      textAlign: 'center',
                                      letterSpacing: 0.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      justifyContent: 'center'
                                    }}
                                  >
                                    {finalFinished ? '✓ Ver / Editar Resultado' : '🏆 Lançar Resultado Final'}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="bracket-right-wing">
                            {rightColumns}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                </>
              ) : (
                <div>
                  {(() => {
                    if (!matches || matches.length === 0) return <div className="error" style={{ color: 'var(--red)' }}>Nenhuma partida encontrada.</div>;
                    try {
                      const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
                      return rounds.map(round => {
                        const roundMatches = matches.filter(m => m.round === round);
                        return (
                          <div key={round} style={{ marginBottom: 30 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{roundMatches[0]?.roundName || `Ronda ${round}`}</div>
                              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {roundMatches.map(m => (
                                <div key={m._id} className="match-card" style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 700, fontSize: 14, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.homeTeam?.name || '—'}</div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8, minWidth: 80, textAlign: 'center' }}>
                                      {m.status === 'finished' ? (
                                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{m.homeScore} - {m.awayScore}</div>
                                      ) : m.status === 'live' || m.status === 'active' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{m.homeScore !== null ? m.homeScore : 0} - {m.awayScore !== null ? m.awayScore : 0}</div>
                                          <div className="badge badge-green pulse-dot" style={{ fontSize: 9, padding: '2px 6px' }}>LIVE</div>
                                        </div>
                                      ) : m.status === 'cancelled' ? (
                                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)' }}>CANCELADO</div>
                                      ) : (
                                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-muted)' }}>VS</div>
                                      )}
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>{m.awayTeam?.name || '—'}</div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 8px', color: '#25D366' }} onClick={() => shareMatchWhatsApp(m)} title="WhatsApp"><MessageCircle size={14} /></button>
                                      {canManage && (
                                        <>
                                          <button className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} onClick={() => setShowEditMatchModal(m)} title="Editar Jogo"><Edit2 size={14} /></button>
                                          <button className="btn btn-primary btn-sm" style={{ padding: '6px 8px', cursor: 'pointer' }} onClick={() => setShowResultModal(m)} title="Lançar Resultado e Marcadores"><Trophy size={14} /></button>
                                          <button className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} onClick={() => setShowShareModal(m)} title="Partilhar"><Camera size={14} /></button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    } catch (err) {
                      console.error('Error rendering matches:', err);
                      return <div className="error" style={{ color: 'var(--red)' }}>Erro ao carregar partidas.</div>;
                    }
                  })()}
                </div>
              )
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
                      <th title="Jogos disputados" style={{ cursor: 'help' }}>J</th>
                      <th title="Vitórias" style={{ cursor: 'help' }}>V</th>
                      <th title="Empates" style={{ cursor: 'help' }}>E</th>
                      <th title="Derrotas" style={{ cursor: 'help' }}>D</th>
                      <th title="Golos Marcados" style={{ cursor: 'help' }}>GM</th>
                      <th title="Golos Sofridos" style={{ cursor: 'help' }}>GS</th>
                      <th title="Diferença de Golos" style={{ cursor: 'help' }}>DG</th>
                      <th title="Pontos" style={{ color: 'var(--green)', cursor: 'help' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.team._id} className={i < 3 ? `rank-${i + 1}` : ''}>
                        <td style={{ fontWeight: 700 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: s.team.color || 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 14 }}>
                              {s.team.logo ? <img src={s.team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                            </div>
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
                <div style={{ marginTop: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span><strong>J:</strong> Jogos</span>
                  <span><strong>V:</strong> Vitórias</span>
                  <span><strong>E:</strong> Empates</span>
                  <span><strong>D:</strong> Derrotas</span>
                  <span><strong>GM:</strong> Golos Marcados</span>
                  <span><strong>GS:</strong> Golos Sofridos</span>
                  <span><strong>DG:</strong> Diferença Golos</span>
                  <span><strong>PTS:</strong> Pontos</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INFO/MAP TAB */}
        {tab === 'info' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Localização do Torneio</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <MapPin size={18} color="var(--green)" />
                    <span style={{ fontWeight: 700 }}>{tournament.location}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 28 }}>{tournament.neighborhood}, Moçambique</p>
                </div>
                
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tournament.location + ' ' + (tournament.neighborhood || '') + ' Moçambique')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
                >
                  <MapPin size={14} /> Traçar Rota / Como Chegar
                </a>
              </div>
              <div style={{ width: '100%', height: 400, background: 'var(--bg-secondary)', position: 'relative' }}>
                <iframe
                  title="Tournament Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(tournament.location + ' ' + (tournament.neighborhood || '') + ' Moçambique')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
                <div style={{ padding: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                  💡 Dica: Podes usar a roda do rato ou os dedos para fazer zoom no mapa.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPONSORS TAB */}
        {tab === 'sponsors' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Propostas de Patrocínio 🤝</h2>
              <div className="badge badge-gray">{proposals.length} propostas</div>
            </div>

            {proposals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🤝</div>
                <h3>Ainda não há propostas</h3>
                <p>As marcas que clicarem em "Apoiar" na página pública aparecerão aqui.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {proposals.map(p => (
                  <div key={p._id} className="card" style={{ borderLeft: p.status === 'pending' ? '4px solid var(--yellow)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</h3>
                          <span className={`badge ${p.status === 'pending' ? 'badge-yellow' : p.status === 'accepted' ? 'badge-green' : 'badge-gray'}`}>
                            {p.status === 'pending' ? 'Pendente' : p.status === 'accepted' ? 'Aceite' : p.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                          📧 {p.email} {p.contact && `· 📞 ${p.contact}`}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, border: '1px solid var(--border)' }}>
                      "{p.message}"
                    </div>
                    {canManage && p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary btn-sm" onClick={async () => {
                          await api.put(`/tournaments/sponsor-proposals/${p._id}`, { status: 'accepted' });
                          toast.success('Proposta marcada como aceite!');
                          load();
                        }}>Aceitar</button>
                        <button className="btn btn-secondary btn-sm" onClick={async () => {
                          if(!window.confirm('Recusar esta proposta?')) return;
                          await api.put(`/tournaments/sponsor-proposals/${p._id}`, { status: 'rejected' });
                          load();
                        }}>Recusar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIBERS TAB */}
        {tab === 'subscribers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Seguidores do WhatsApp ({subscribers.length})</h2>
              {canManage && (
                <button className="btn btn-secondary btn-sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Olá seguidores do torneio ' + tournament.name)}`, '_blank')}>
                  <MessageCircle size={14} /> Mensagem para Todos
                </button>
              )}
            </div>
            
            {subscribers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MessageCircle size={48} strokeWidth={1} /></div>
                <h3>Sem seguidores ainda</h3>
                <p>O público pode clicar em "Seguir Torneio" na página pública para aparecer aqui.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>WhatsApp</th>
                      <th>Data de Subscrição</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(s => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 700 }}>{s.name}</td>
                        <td>{s.phone}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a href={`https://wa.me/${s.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ color: '#25D366' }}>
                            <MessageCircle size={14} /> Conversar
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {tab === 'leads' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Tentativas de Inscrição ({leads.length}) ⚡</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Equipas que começaram o processo mas não finalizaram.</p>
            </div>
            
            {leads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚡</div>
                <h3>Sem interessados ainda</h3>
                <p>Quando alguém começar a inscrever uma equipa, os dados aparecerão aqui.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Equipa / Capitão</th>
                      <th>Contacto</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l._id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{l.teamName || '—'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.name}</div>
                        </td>
                        <td>{l.contact}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a href={`https://wa.me/${l.contact.replace(/\s/g, '')}?text=${encodeURIComponent('Olá ' + l.name + ', vimos que tentaste inscrever a equipa ' + l.teamName + ' no torneio ' + tournament.name + '. Precisas de ajuda?')}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ background: '#25D366', color: '#fff' }}>
                            <MessageCircle size={14} /> WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD/EDIT TEAM MODAL */}
      {showTeamModal && (
        <AddTeamModal
          tournamentId={id}
          initialData={editTeamData}
          onClose={() => { setShowTeamModal(false); setEditTeamData(null); }}
          onSaved={(team) => {
            if (editTeamData) {
              setTeams(prev => prev.map(x => x._id === team._id ? team : x));
            } else {
              setTeams(prev => [...prev, team]);
            }
            setShowTeamModal(false);
            setEditTeamData(null);
          }}
        />
      )}

      {/* RESULT MODAL */}
      {showResultModal && (
        <ResultModal 
          match={showResultModal} 
          tournamentId={id} 
          teams={teams} 
          matches={matches} 
          onClose={() => setShowResultModal(null)} 
          onSaved={() => { setShowResultModal(null); load(); }} 
        />
      )}

      {/* SHARE MODAL */}
      {showShareModal && <MatchShareModal match={showShareModal} tournament={tournament} onClose={() => setShowShareModal(null)} />}

      {/* FINISH TOURNAMENT MODAL */}
      {showFinishModal && (
        <FinishTournamentModal 
          teams={teams} 
          onClose={() => setShowFinishModal(false)} 
          onConfirm={(awards) => {
            changeStatus('finished', awards);
            setShowFinishModal(false);
          }} 
        />
      )}

      {/* MANUAL MATCH MODAL */}
      {showManualMatchModal && (
        <ManualMatchModal 
          tournamentId={id} 
          teams={teams.filter(t => t.status === 'approved')} 
          onClose={() => setShowManualMatchModal(false)} 
          onSaved={() => { setShowManualMatchModal(false); load(); }} 
        />
      )}

      {/* EDIT MATCH MODAL (SCHEDULE/DATE) */}
      {showEditMatchModal && (
        <MatchScheduleModal 
          match={showEditMatchModal} 
          tournamentId={id} 
          onClose={() => setShowEditMatchModal(null)} 
          onSaved={() => { setShowEditMatchModal(null); load(); }} 
        />
      )}

      {/* EDIT TOURNAMENT MODAL */}
      {showEditTournamentModal && (
        <TournamentEditModal 
          tournament={tournament} 
          onClose={() => setShowEditTournamentModal(false)} 
          onSaved={(updated) => { 
            setTournament(updated); 
          }} 
        />
      )}
      
      {showLinkModal && (
        <LinkManagerModal 
          team={showLinkModal} 
          onClose={() => setShowLinkModal(null)} 
          onLinked={() => { 
            setShowLinkModal(null); 
            load(); 
          }} 
        />
      )}

      {previewImage && (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <button style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={32} /></button>
          <img 
            src={previewImage} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>


  );
}


function ManualMatchModal({ tournamentId, teams, onClose, onSaved }) {

  const [form, setForm] = useState({ homeTeam: '', awayTeam: '', round: 1, roundName: 'Jornada 1', date: '', location: '', referee: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.homeTeam || !form.awayTeam) return toast.error('Seleciona as duas equipas.');
    if (form.homeTeam === form.awayTeam) return toast.error('As equipas devem ser diferentes.');
    
    setLoading(true);
    try {
      await api.post(`/tournaments/${tournamentId}/matches`, form);
      toast.success('Jogo adicionado!');
      onSaved();
    } catch { toast.error('Erro ao adicionar jogo.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Jogo Manual ⚽</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Equipa Casa</label>
              <select className="form-select" value={form.homeTeam} onChange={e => setForm({ ...form, homeTeam: e.target.value })}>
                <option value="">Selecionar...</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Equipa Fora</label>
              <select className="form-select" value={form.awayTeam} onChange={e => setForm({ ...form, awayTeam: e.target.value })}>
                <option value="">Selecionar...</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Ronda (Número)</label>
              <input type="number" className="form-input" value={form.round} onChange={e => setForm({ ...form, round: Number(e.target.value), roundName: `Jornada ${e.target.value}` })} />
            </div>
            <div className="form-group">
              <label className="form-label">Nome da Ronda</label>
              <input className="form-input" value={form.roundName} onChange={e => setForm({ ...form, roundName: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Data e Hora</label>
            <input type="datetime-local" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Local</label>
            <input className="form-input" placeholder="Ex: Campo A" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 8 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Plus size={16} /> Adicionar ao Calendário</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FinishTournamentModal({ teams, onClose, onConfirm }) {
  const [form, setForm] = useState({ winner: '', mvp: '', bestScorer: '', bestGoalkeeper: '' });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title">Encerrar Torneio 🏆</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Parabéns pela conclusão do torneio! Define agora o quadro de honra oficial para imortalizar os vencedores.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Equipa Campeã</label>
            <select className="form-select" value={form.winner} onChange={e => setForm({ ...form, winner: e.target.value })}>
              <option value="">Selecionar equipa...</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">MVP (Melhor Jogador)</label>
            <input type="text" className="form-input" placeholder="Nome do jogador..." value={form.mvp} onChange={e => setForm({ ...form, mvp: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Melhor Marcador</label>
            <input type="text" className="form-input" placeholder="Nome do jogador..." value={form.bestScorer} onChange={e => setForm({ ...form, bestScorer: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Melhor Guarda-redes</label>
            <input type="text" className="form-input" placeholder="Nome do jogador..." value={form.bestGoalkeeper} onChange={e => setForm({ ...form, bestGoalkeeper: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onConfirm(form)}>Confirmar Encerramento</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentEditModal({ tournament, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...tournament });
  const [loading, setLoading] = useState(false);

  const provinces = [
    'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 
    'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'
  ];

  const formatOptions = [
    { value: 'groups', label: '📊 Fase de Grupos' },
    { value: 'knockout', label: '⚔️ Mata-mata' },
    { value: 'groups_knockout', label: '🏆 Grupos + Mata-mata' },
  ];

  const handleSave = async () => {
    if (!form.name || !form.neighborhood || !form.location) {
      return toast.error('Preenche os campos obrigatórios (Nome, Bairro, Local).');
    }
    setLoading(true);
    try {
      const res = await api.put(`/tournaments/${tournament._id}`, form);
      toast.success('Torneio atualizado!');
      onSaved(res.data);
    } catch { toast.error('Erro ao atualizar torneio.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Torneio</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {user?.role === 'superadmin' && (
            <div style={{ background: 'rgba(255,214,0,0.1)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,214,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={20} color="var(--yellow)" fill="var(--yellow)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>Liga Oficial</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Destacar este torneio como verificado.</div>
                </div>
              </div>
              <input type="checkbox" checked={form.isOfficial} onChange={e => setForm({...form, isOfficial: e.target.checked})} style={{ width: 24, height: 24, accentColor: 'var(--yellow)' }} />
            </div>
          )}

          {/* Nome */}
          <div className="form-group">
            <label className="form-label">Nome do Torneio *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          {/* Localização */}
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Província</label>
              <select className="form-select" value={form.province || 'Maputo Cidade'} onChange={e => setForm({...form, province: e.target.value})}>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bairro *</label>
              <input className="form-input" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Local / Campo *</label>
              <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          {/* Formato e Nº de Equipas */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Formato</label>
              <select className="form-select" value={form.format} onChange={e => setForm({...form, format: e.target.value})}
                disabled={tournament.status === 'active'}
                title={tournament.status === 'active' ? 'Não podes alterar o formato com o torneio a decorrer' : ''}>
                {formatOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              {tournament.status === 'active' && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>🔒 Bloqueado (torneio ativo)</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Nº Máximo de Equipas</label>
              <select className="form-select" value={form.maxTeams} onChange={e => setForm({...form, maxTeams: Number(e.target.value)})}
                disabled={tournament.status === 'active'}
                title={tournament.status === 'active' ? 'Não podes alterar o nº de equipas com o torneio a decorrer' : ''}>
                {[4,6,8,10,12,16,20,24,32].map(n => <option key={n} value={n}>{n} equipas</option>)}
              </select>
              {tournament.status === 'active' && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>🔒 Bloqueado (torneio ativo)</span>}
            </div>
          </div>

          {/* Data e Financeiro */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Data de Início</label>
              <input type="date" className="form-input" value={form.startDate ? new Date(form.startDate).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Taxa de Inscrição (MT)</label>
              <input type="number" className="form-input" value={form.registrationFee} onChange={e => setForm({...form, registrationFee: Number(e.target.value)})} />
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Prémio / Troféu</label>
              <input className="form-input" value={form.prize || ''} onChange={e => setForm({...form, prize: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Link de Comunicação</label>
              <input className="form-input" placeholder="WhatsApp / Telegram" value={form.contactLink || ''} onChange={e => setForm({...form, contactLink: e.target.value})} />
            </div>
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea className="form-input" rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: 'vertical' }} />
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchScheduleModal({ match, tournamentId, onClose, onSaved }) {
  const getLocalDateString = (d) => {
    if (!d) return '';
    const dateObj = new Date(d);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    return (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 10);
  };

  const getLocalTimeString = (d) => {
    if (!d) return '';
    const dateObj = new Date(d);
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [date, setDate] = useState(match.date ? getLocalDateString(match.date) : '');
  const [time, setTime] = useState(match.date ? getLocalTimeString(match.date) : '');
  const [location, setLocation] = useState(match.location || '');
  const [referee, setReferee] = useState(match.referee || '');
  const [status, setStatus] = useState(match.status || 'scheduled');
  const [homeScore, setHomeScore] = useState(match.homeScore ?? '');
  const [awayScore, setAwayScore] = useState(match.awayScore ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const dateTime = date && time ? new Date(`${date}T${time}`) : null;
      await api.put(`/tournaments/${tournamentId}/matches/${match._id}`, {
        date: dateTime, 
        location, 
        referee, 
        status,
        homeScore: homeScore !== '' ? Number(homeScore) : null,
        awayScore: awayScore !== '' ? Number(awayScore) : null
      });
      toast.success('Jogo atualizado!');
      onSaved();
    } catch { toast.error('Erro ao atualizar jogo.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">Agendar / Estado do Jogo</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{match.homeTeam?.name} vs {match.awayTeam?.name}</p>
          
          <div className="form-group">
            <label className="form-label">Estado da Partida</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="scheduled">📅 Agendado</option>
              <option value="live">🔴 Ao Vivo / A Decorrer</option>
              <option value="finished">🏁 Concluído</option>
              <option value="cancelled">🚫 Cancelado / Anulado</option>
            </select>
          </div>

          {(status === 'live' || status === 'active' || status === 'finished') && (
            <div style={{ background: 'rgba(0,200,83,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(0,200,83,0.1)' }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>Pontuação em Direto</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>CASA</div>
                  <input type="number" min="0" className="score-input" style={{ width: 60, height: 50, fontSize: 24 }} value={homeScore} onChange={e => setHomeScore(e.target.value)} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, marginTop: 15 }}>×</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>FORA</div>
                  <input type="number" min="0" className="score-input" style={{ width: 60, height: 50, fontSize: 24 }} value={awayScore} onChange={e => setAwayScore(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Local / Campo</label>
            <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Campo da Maianga" />
          </div>
          <div className="form-group">
            <label className="form-label">Árbitro</label>
            <input className="form-input" value={referee} onChange={e => setReferee(e.target.value)} placeholder="Nome do árbitro" />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'A guardar...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTeamModal({ tournamentId, initialData, onClose, onSaved }) {
  const [form, setForm] = useState(initialData || { name: '', captainName: '', coachName: '', contact: '', color: '#00C853', logo: '', players: [], paymentStatus: 'pending', amountPaid: 0 });
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // FASE 2: Import Squads
  const [squads, setSquads] = useState([]);
  const [selectedSquadId, setSelectedSquadId] = useState('');

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  useEffect(() => {
    // Fetch user squads
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
      toast.success('Logotipo carregado!');
    } catch { toast.error('Erro ao carregar imagem.'); }
    finally { setUploading(false); }
  };

  const addPlayer = () => {
    if (!playerName.trim()) return;
    setForm(prev => ({ 
      ...prev, 
      players: [...prev.players, { 
        name: playerName.trim(),
        number: playerNumber ? Number(playerNumber) : null
      }] 
    }));
    setPlayerName('');
    setPlayerNumber('');
  };

  const removePlayer = (i) => setForm(prev => ({ ...prev, players: prev.players.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome da equipa obrigatório.');
    setLoading(true);
    try {
      let res;
      if (initialData) {
        res = await api.put(`/tournaments/${tournamentId}/teams/${initialData._id}`, form);
        toast.success('Equipa atualizada!');
      } else {
        res = await api.post(`/tournaments/${tournamentId}/teams`, form);
        toast.success('Equipa adicionada!');
      }
      onSaved(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao guardar equipa.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Editar Equipa' : 'Adicionar Equipa'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {!initialData && squads.length > 0 && (
          <div style={{ background: 'rgba(0,200,83,0.1)', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid rgba(0,200,83,0.2)' }}>
            <label className="form-label" style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Shield size={16} /> Importar dos Meus Clubes
            </label>
            <select className="form-select" value={selectedSquadId} onChange={handleImportSquad}>
              <option value="">Selecionar Clube Guardado...</option>
              {squads.map(s => <option key={s._id} value={s._id}>{s.name} ({s.players?.length || 0} Jogadores)</option>)}
            </select>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
              Isto vai preencher automaticamente o nome, símbolo, cor e o plantel inteiro num segundo.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Nome da Equipa *</label>
            <input className="form-input" placeholder="Ex: FC Maianga" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Capitão</label>
              <input className="form-input" placeholder="Nome do capitão" value={form.captainName} onChange={e => setForm(p => ({ ...p, captainName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Treinador</label>
              <input className="form-input" placeholder="Nome do treinador" value={form.coachName} onChange={e => setForm(p => ({ ...p, coachName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Contacto</label>
              <input className="form-input" placeholder="Telemóvel" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ background: 'rgba(0,200,83,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(0,200,83,0.1)' }}>
            <div className="form-group">
              <label className="form-label">Estado de Pagamento</label>
              <select className="form-select" value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                <option value="pending">❌ Pendente</option>
                <option value="partial">⏳ Parcial</option>
                <option value="paid">✅ Pago</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Valor Pago (MT)</label>
              <input type="number" className="form-input" placeholder="0" value={form.amountPaid} onChange={e => setForm(p => ({ ...p, amountPaid: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Logotipo da Equipa</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: form.color || 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {form.logo ? <img src={form.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
              </div>
              <div style={{ flex: 1 }}>
                <input type="file" id="logo-upload" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                <label htmlFor="logo-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  {uploading ? 'A carregar...' : 'Escolher Foto'}
                </label>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>PNG, JPG até 5MB</p>
              </div>
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
              <input className="form-input" style={{ width: '80px', textAlign: 'center' }} placeholder="Nº (Opc)" type="number" value={playerNumber} onChange={e => setPlayerNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <input className="form-input" placeholder="Nome do jogador" value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <button className="btn btn-primary btn-sm" onClick={addPlayer}><Plus size={14} /></button>
            </div>
            {form.players.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {form.players.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 100, padding: '4px 12px', fontSize: 13 }}>
                    {p.number && <span style={{ color: 'var(--green)', fontWeight: 800 }}>#{p.number}</span>} {p.name}
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

function ResultModal({ match, tournamentId, teams, matches, onClose, onSaved }) {
  const [home, setHome] = useState(match.homeScore ?? '');
  const [away, setAway] = useState(match.awayScore ?? '');
  const [referee, setReferee] = useState(match.referee || '');
  const [events, setEvents] = useState(match.events || []);
  const [loading, setLoading] = useState(false);

  // Null-safe team IDs (final match may not have teams yet)
  const homeTeamId = match.homeTeam?._id || '';
  const awayTeamId = match.awayTeam?._id || '';

  // Event form state
  const [newEvent, setNewEvent] = useState({ type: 'goal', team: homeTeamId, playerName: '', minute: '' });

  const homePlayers = teams.find(t => t._id === homeTeamId)?.players || [];
  const awayPlayers = teams.find(t => t._id === awayTeamId)?.players || [];
  const currentTeamPlayers = newEvent.team === homeTeamId ? homePlayers : awayPlayers;

  // Validation Checks for Knockout Rounds
  const prevRoundMatches = (match.phase === 'knockout' && match.round > 1)
    ? (matches || []).filter(m => m.phase === 'knockout' && m.round === match.round - 1)
    : [];
  const pendingInPrevRound = prevRoundMatches.filter(m => m.status !== 'finished' && m.status !== 'cancelled');
  const hasPendingPrevRound = pendingInPrevRound.length > 0;
  const prevRoundName = prevRoundMatches[0]?.roundName || `Ronda ${match.round - 1}`;

  const hasNoTeams = match.phase === 'knockout' && (!match.homeTeam || !match.awayTeam);
  const isSubmissionBlocked = hasNoTeams || hasPendingPrevRound;

  const handleAddEvent = () => {
    if (!newEvent.playerName) return toast.error('Seleciona ou escreve o nome do jogador.');
    setEvents([...events, { ...newEvent, id: Date.now(), minute: newEvent.minute ? Number(newEvent.minute) : null }]);
    setNewEvent({ ...newEvent, playerName: '', minute: '' });
  };

  const handleRemoveEvent = (id) => setEvents(events.filter(e => e.id !== id && e._id !== id));

  const handleSave = async (customStatus) => {
    if (home === '' || away === '') return toast.error('Insere os dois resultados.');
    setLoading(true);
    try {
      await api.put(`/tournaments/${tournamentId}/matches/${match._id}/result`, {
        homeScore: Number(home), 
        awayScore: Number(away), 
        events, 
        referee,
        status: customStatus || 'finished'
      });
      toast.success(customStatus === 'live' ? 'Live Atualizado! 📡' : 'Resultado e eventos guardados!');
      onSaved();
      if (!customStatus || customStatus === 'finished') onClose();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Erro ao guardar resultado.'); 
    }
    finally { setLoading(false); }
  };

  const eventIcons = { goal: '⚽', yellow_card: '🟨', red_card: '🟥' };
  const eventLabels = { goal: 'Golo', yellow_card: 'Cartão Amarelo', red_card: 'Cartão Vermelho' };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">Registo de Jogo</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div style={{ marginBottom: 24 }}>
          {/* Show warning if teams not yet assigned to this match */}
          {hasNoTeams && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
              ⚠️ As equipas para este jogo ainda não foram apuradas. Não é possível lançar resultado.
            </div>
          )}

          {/* Show warning if previous round has pending matches */}
          {!hasNoTeams && hasPendingPrevRound && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#f59e0b', textAlign: 'center', fontWeight: 600 }}>
              ⚠️ Não é possível lançar resultado. Ainda há {pendingInPrevRound.length} jogo(s) por disputar na ronda anterior ({prevRoundName}). Termina esses jogos primeiro.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>{match.homeTeam?.name || 'Casa'}</div>
              <input type="number" min="0" className="score-input" value={home} onChange={e => setHome(e.target.value)} disabled={isSubmissionBlocked} />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 20 }}>×</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>{match.awayTeam?.name || 'Fora'}</div>
              <input type="number" min="0" className="score-input" value={away} onChange={e => setAway(e.target.value)} disabled={isSubmissionBlocked} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Árbitro da Partida</label>
            <input className="form-input" placeholder="Nome do árbitro..." value={referee} onChange={e => setReferee(e.target.value)} disabled={isSubmissionBlocked} />
          </div>

          <div className="divider" style={{ margin: '24px 0' }} />

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Eventos da Partida (Golos e Cartões)</h3>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20, opacity: isSubmissionBlocked ? 0.6 : 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <select className="form-select" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} disabled={isSubmissionBlocked}>
                <option value="goal">⚽ Golo</option>
                <option value="yellow_card">🟨 Cartão Amarelo</option>
                <option value="red_card">🟥 Cartão Vermelho</option>
              </select>
              <select className="form-select" value={newEvent.team} onChange={e => setNewEvent({...newEvent, team: e.target.value})} disabled={isSubmissionBlocked}>
                {homeTeamId && <option value={homeTeamId}>{match.homeTeam?.name || 'Casa'}</option>}
                {awayTeamId && <option value={awayTeamId}>{match.awayTeam?.name || 'Fora'}</option>}
                {!homeTeamId && !awayTeamId && teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="number"
                className="form-input"
                style={{ width: 70 }}
                placeholder="Min"
                value={newEvent.minute}
                onChange={e => setNewEvent({...newEvent, minute: e.target.value})}
                disabled={isSubmissionBlocked}
              />
              <input 
                list="players-list"
                className="form-input" 
                placeholder="Nome do jogador..." 
                style={{ flex: 1 }}
                value={newEvent.playerName} 
                onChange={e => setNewEvent({...newEvent, playerName: e.target.value})}
                disabled={isSubmissionBlocked}
              />
              <datalist id="players-list">
                {currentTeamPlayers.map((p, i) => <option key={i} value={p.name} />)}
              </datalist>
              <button className="btn btn-primary btn-sm" onClick={handleAddEvent} disabled={isSubmissionBlocked}>Add</button>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
            {events.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>Nenhum evento registado.</p>
            ) : (
              events.map((e, i) => (
                <div key={e.id || e._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{eventIcons[e.type]}</span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{e.playerName}</span>
                      {e.minute && <span style={{ fontSize: 11, color: 'var(--green)', marginLeft: 6 }}>{e.minute}'</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>({e.team === homeTeamId ? (match.homeTeam?.name || 'Casa') : (match.awayTeam?.name || 'Fora')})</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveEvent(e.id || e._id)} style={{ background: 'none', color: 'var(--red)', opacity: 0.6 }} disabled={isSubmissionBlocked}><X size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1, height: 48, justifyContent: 'center', opacity: isSubmissionBlocked ? 0.5 : 1 }} 
            onClick={() => handleSave('live')}
            disabled={loading || isSubmissionBlocked}
          >
            {loading ? '...' : 'Actualizar Live'}
          </button>

          <button 
            className="btn btn-primary" 
            onClick={() => handleSave('finished')} 
            disabled={loading || isSubmissionBlocked} 
            style={{ flex: 2, justifyContent: 'center', height: 48, opacity: isSubmissionBlocked ? 0.5 : 1 }}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={16} /> Finalizar e Guardar Tudo</>}
          </button>
        </div>

      </div>
    </div>
  );
}
