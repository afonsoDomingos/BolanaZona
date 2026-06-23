import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const showRegisterAction = searchParams.get('reg') === 'true';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('calendar');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewMode, setViewMode] = useState('bracket');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');
  const bracketContainerRef = useRef(null); // inner bracket-container
  const bracketScrollRef = useRef(null);    // outer scroll container
  const [bracketZoom, setBracketZoom] = useState(1);
  const isFirstLoadRef = useRef(true);


  const loadData = () => {
    api.get(`/tournaments/public/${shareCode}`)
      .then(res => {
        setData(res.data);
        if (res.data.tournament.status === 'registration' && showRegisterAction && isFirstLoadRef.current) {
          setShowRegistrationModal(true);
          isFirstLoadRef.current = false;
        }
        if (res.data.tournament?.format === 'groups') {
          setViewMode('list');
        }
      })
      .catch(err => {
        setErrorStatus(err.response?.status || 404);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      if (data?.matches?.some(m => m.status === 'live' || m.status === 'active')) {
        console.log('📡 Atualizando dados em direto...');
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [shareCode, showRegisterAction, data?.matches?.length]);

  // Auto-zoom bracket — entire tree always fully visible
  useEffect(() => {
    const updateZoom = () => {
      const el = bracketContainerRef.current;
      if (!el) return;
      // Reset zoom to measure natural content width
      el.style.zoom = '1';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Double rAF ensures layout is fully recalculated after zoom reset
          const contentWidth = el.scrollWidth;
          const availableWidth = window.innerWidth;
          // If content wider than viewport: zoom to fit exactly
          // If content fits: max zoom of 0.75 to keep it compact
          const zoom = contentWidth > availableWidth
            ? availableWidth / contentWidth
            : Math.min(availableWidth / contentWidth, 0.75);
          setBracketZoom(zoom);
          el.style.zoom = String(zoom);
        });
      });
    };
    const t1 = setTimeout(updateZoom, 150);
    const t2 = setTimeout(updateZoom, 900);
    window.addEventListener('resize', updateZoom);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', updateZoom); };
  }, [data, viewMode]);



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

  if (errorStatus) {
    const isPrivate = errorStatus === 403;
    return (
      <div className="page animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <div className="spin-ball" style={{ fontSize: 80, marginBottom: 24 }}>{isPrivate ? '🔒' : '⚽'}</div>
        <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          {isPrivate ? 'Este torneio é privado' : 'Ups! Torneio não encontrado'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 32 }}>
          {isPrivate 
            ? 'O organizador configurou este torneio como privado. As informações e resultados não estão acessíveis publicamente.' 
            : 'Parece que este link já não é válido ou o torneio foi removido pelo organizador.'}
        </p>
        <Link to="/" className="btn btn-primary">Explorar outros torneios</Link>
      </div>
    );
  }

  const { tournament, teams, matches, standings } = data;

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
      
      {/* Dynamic Header / Hero - Compact */}
      <div style={{ 
        position: 'relative', 
        padding: '16px 0 12px',
        background: 'radial-gradient(circle at top right, rgba(0,200,83,0.10), transparent)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Link to="/explore" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', textDecoration: 'none', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                <ArrowLeft size={14} /> Voltar à Exploração
              </Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-subtle)', border: '2px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚽</div>
                <div>
                  <h1 className="font-syne" style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 900, lineHeight: 1.1, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {tournament.name}
                    {tournament.isOfficial && <Shield size={18} fill="var(--yellow)" color="var(--yellow)" />}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
                    <MapPin size={12} color="var(--green)" /> {tournament.location}, {tournament.neighborhood}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${tournament.status === 'active' ? 'badge-green' : tournament.status === 'registration' ? 'badge-blue' : 'badge-gray'}`} style={{ padding: '3px 10px', fontSize: 11 }}>
                  {statusLabel[tournament.status]}
                </span>
                <span className="badge badge-gray" style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 10px', fontSize: 11 }}>{formatLabel[tournament.format]}</span>
                {tournament.prize && <span className="badge badge-yellow" style={{ padding: '3px 10px', fontSize: 11 }}>🏆 {tournament.prize}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={copyLink} className="btn btn-secondary" style={{ borderRadius: 10, height: 36, fontSize: 13, padding: '0 14px' }}><Share2 size={15} /> Partilhar</button>
              <button onClick={() => setShowSubscribeModal(true)} className="btn btn-secondary" style={{ borderRadius: 10, height: 36, fontSize: 13, padding: '0 14px', borderColor: 'var(--green)', color: 'var(--green)' }}><Clock size={15} /> Seguir</button>
              <button onClick={() => setShowSponsorModal(true)} className="btn btn-secondary" style={{ borderRadius: 10, height: 36, fontSize: 13, padding: '0 14px', borderColor: 'var(--yellow)', color: 'var(--yellow)' }}>🤝 Apoiar</button>
              {tournament.status === 'registration' && tournament.allowPublicRegistration && showRegisterAction && (
                <button onClick={() => setShowRegistrationModal(true)} className="btn btn-primary" style={{ borderRadius: 10, height: 36, fontSize: 13, padding: '0 20px', fontWeight: 700 }}>Inscrever</button>
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
        <div className="tabs" style={{ marginBottom: 20, justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 100, maxWidth: 420, margin: '0 auto 20px' }}>
          {[
            ['standings', <BarChart2 size={14} />, 'Classificação'],
            ['calendar', <Calendar size={14} />, 'Jogos'],
            ['teams', <Users size={14} />, 'Equipas']
          ].map(([key, icon, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)} style={{ borderRadius: 100, flex: 1, height: 34, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <h3 className="font-syne" style={{ fontSize: 20, fontWeight: 800 }}>Classificação Oficial</h3>
                  <button onClick={() => captureImage('print-standings', `Classificacao_${tournament.name}`)} className="btn btn-secondary btn-sm" style={{ border: '1px solid var(--green)', color: 'var(--green)', fontSize: 12, padding: '6px 12px', height: 'auto', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Camera size={14} /> Screenshot
                  </button>
                </div>
                <div id="print-standings" className="table-wrapper card-glass" style={{ borderRadius: 24, padding: 20 }}>
                  <table>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th><th>Equipa</th>
                      <th title="Jogos disputados" style={{ cursor: 'help' }}>J</th>
                      <th title="Vitórias" style={{ cursor: 'help' }}>V</th>
                      <th title="Empates" style={{ cursor: 'help' }}>E</th>
                      <th title="Derrotas" style={{ cursor: 'help' }}>D</th>
                      <th title="Diferença de Golos" style={{ cursor: 'help' }}>DG</th>
                      <th title="Pontos" style={{ color: 'var(--green)', textAlign: 'center', cursor: 'help' }}>Pts</th>
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
                <div style={{ marginTop: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span><strong>J:</strong> Jogos</span>
                  <span><strong>V:</strong> Vitórias</span>
                  <span><strong>E:</strong> Empates</span>
                  <span><strong>D:</strong> Derrotas</span>
                  <span><strong>DG:</strong> Diferença Golos</span>
                  <span><strong>PTS:</strong> Pontos</span>
                </div>
              </div>
              </div>
            )
          )}

          {tab === 'calendar' && (
            matches.length === 0 ? (
              <div className="empty-state"><h3>Calendário em breve</h3><p>O organizador está a preparar as jornadas.</p></div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                  {matches.length > 0 && (
                    <div className="view-switcher" style={{ display: 'flex', gap: 4 }}>
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
                  {viewMode === 'bracket' && (
                    <button 
                      onClick={() => captureImage('print-bracket', `Arvore_${tournament.name}`)} 
                      className="btn btn-secondary btn-sm" 
                      style={{ border: '1px solid var(--green)', color: 'var(--green)', fontSize: 11, padding: '3px 10px', height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, width: 'auto', flex: 'none' }}
                    >
                      <Camera size={13} /> Screenshot
                    </button>
                  )}
                </div>
                {viewMode === 'bracket' ? (
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

                    <div
                      id="print-bracket"
                      ref={bracketScrollRef}
                      className="bracket-scroll-container full-width-bleed"
                    style={{
                      position: 'relative',
                      backgroundImage: 'url(/loginbg1.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      padding: '20px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    {/* Dark overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,36,0.85)', zIndex: 0 }} />
                    <div
                      ref={bracketContainerRef}
                      className="bracket-container"
                      style={{
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {(() => {
                      const knockoutMatches = matches.filter(m => m.phase === 'knockout');
                      const bracketMatches = knockoutMatches.length > 0 ? knockoutMatches : matches;

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

                      // Smart round name based on matches count and distance from final
                      const getRoundName = (round) => {
                        const matchesInRound = bracketMatches.filter(m => m.round === round).length;
                        const distFromFinal = maxRound - round; // 0 = final, 1 = semis, 2 = quarters, etc
                        // Check if this round has legs (2 matches for same pair = mão dupla)
                        const customName = bracketMatches.find(m => m.round === round)?.roundName;
                        if (customName) return customName;
                        if (distFromFinal === 0) return 'Final';
                        if (distFromFinal === 1) return matchesInRound <= 2 ? 'Meias-Finais' : 'Semifinal';
                        if (distFromFinal === 2) return 'Quartos de Final';
                        if (distFromFinal === 3) return 'Oitavos de Final';
                        if (distFromFinal === 4) return '1/16 de Final';
                        if (distFromFinal === 5) return '1/32 de Final';
                        return `Ronda ${round}`;
                      };

                      // Detect 2-legged rounds (same matchup appearing twice)
                      const isDoubleLegged = (round) => {
                        const rMatches = bracketMatches.filter(m => m.round === round);
                        // If roundLeg field exists, use it
                        return rMatches.some(m => m.leg === 2 || m.leg === '2');
                      };

                      const renderMatchCard = (m) => {
                        const homeWinner = m.status === 'finished' && m.homeScore > m.awayScore;
                        const awayWinner = m.status === 'finished' && m.awayScore > m.homeScore;
                        const legLabel = m.leg === 2 || m.leg === '2' ? ' · Volta' : m.leg === 1 || m.leg === '1' ? ' · Ida' : '';
                        return (
                          <div key={m._id} className="bracket-match-node">
                            <div className="bracket-match-card">
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

                              {/* Info */}
                              <div className="bracket-meta-bar">
                                <div className="bracket-meta-date">
                                  {m.status === 'live' || m.status === 'active' ? (
                                    <span style={{ color: 'var(--green)', fontWeight: 800 }}>● LIVE</span>
                                  ) : m.date ? (
                                    new Date(m.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) + ' ' +
                                    new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                                  ) : (
                                    'Agendado'
                                  )}
                                  {legLabel && <span style={{ color: '#aaa', fontSize: 9 }}>{legLabel}</span>}
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

                      const crownedChampion = tournament.winner || null;
                      const showFinal = selectedRoundFilter === 'all' || selectedRoundFilter === maxRound.toString();

                      return (
                        <>
                          <div className="bracket-left-wing">
                            {leftColumns}
                          </div>

                          {showFinal && finalMatches[0] && (() => {
                            const finalMatch = finalMatches[0];
                            return (
                              <div className="bracket-center-final">
                                <div className="bracket-header-title" style={{ textAlign: 'center', width: '100%', marginBottom: 10 }}>
                                  <div className="bracket-final-subtitle">ROAD TO</div>
                                  <div className="bracket-final-title">{tournament.name}</div>
                                </div>
                                
                                {/* Home Team (Top) */}
                                <div className="bracket-team-logo bracket-final-team-logo" style={{ borderColor: finalMatch?.homeTeam?.color || 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                  {finalMatch?.homeTeam?.logo ? <img src={finalMatch.homeTeam.logo} alt="" /> : (finalMatch?.homeTeam?.name ? finalMatch.homeTeam.name.charAt(0).toUpperCase() : '?')}
                                </div>
                                
                                <div className="bracket-trophy-column" style={{ margin: '10px 0' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src="/TACA.png" alt="Troféu" className="bracket-final-trophy-img" />
                                    <div className="bracket-final-title">{tournament.name}</div>
                                    <div className="bracket-final-subtitle">FINAL</div>
                                    {crownedChampion && (
                                      <div style={{ marginTop: 12, fontWeight: 900, color: crownedChampion.color || 'var(--yellow)', fontSize: 18 }}>
                                        {crownedChampion.name}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Away Team (Bottom) */}
                                <div className="bracket-team-logo bracket-final-team-logo" style={{ borderColor: finalMatch?.awayTeam?.color || 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                  {finalMatch?.awayTeam?.logo ? <img src={finalMatch.awayTeam.logo} alt="" /> : (finalMatch?.awayTeam?.name ? finalMatch.awayTeam.name.charAt(0).toUpperCase() : '?')}
                                </div>
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
                const rounds = [...new Set(matches.map(m => m.round))];
                return rounds.map(round => {
                  const roundMatches = matches.filter(m => m.round === round);
                  return (
                    <div key={round} style={{ marginBottom: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <h3 className="font-syne" style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>{roundMatches[0]?.roundName || `Ronda ${round}`}</h3>
                          {roundMatches.length > 0 && roundMatches.every(m => m.status === 'finished') && (
                            <span style={{ fontSize: 10, background: 'rgba(0,200,83,0.1)', color: 'var(--green)', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>Ronda Concluída ✓</span>
                          )}
                        </div>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--green), transparent)', opacity: 0.2, minWidth: 50 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {roundMatches.map(m => (
                          <div key={m._id} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                              {m.status === 'finished' && (
                                <button onClick={() => captureImage(`print-match-${m._id}`, `Jogo_${m.homeTeam?.name}_vs_${m.awayTeam?.name}`)} className="btn btn-secondary btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 4 }} title="Guardar Resultado">
                                  <Camera size={16} />
                                </button>
                              )}
                            </div>

                            <div id={`print-match-${m._id}`} className="match-card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                                <div style={{ display: 'flex', flex: '1 1 200px', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'nowrap' }}>
                                  <div style={{ flex: 1, textAlign: 'right', fontWeight: 800, fontSize: 13, minWidth: 0, wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.homeTeam?.name}</div>
                                  
                                  <div style={{ 
                                    background: m.status === 'active' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)', 
                                    padding: '6px 12px', 
                                    borderRadius: 10, 
                                    minWidth: 64, 
                                    textAlign: 'center',
                                    border: m.status === 'active' ? '1px solid var(--green)' : '1px solid var(--border)',
                                    flexShrink: 0
                                  }}>
                                    {m.status === 'finished' ? (
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>{m.homeScore}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>{m.awayScore}</span>
                                      </div>
                                    ) : m.status === 'cancelled' ? (
                                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--red)', letterSpacing: 1 }}>CANC.</div>
                                    ) : (
                                      <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-secondary)' }}>
                                        VS
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ flex: 1, textAlign: 'left', fontWeight: 800, fontSize: 13, minWidth: 0, wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.awayTeam?.name}</div>
                                </div>
                              </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                              {m.date && <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} color="var(--green)" /> {new Date(m.date).toLocaleDateString('pt-PT')} · {new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>}
                              {m.location && <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="var(--green)" /> {m.location}</div>}
                              {m.status === 'live' && <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} className="spin-slow" /> LIVE</div>}
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
              }
                </div>
              )}
            </div>
            )
          )}

          {tab === 'teams' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {teams.map(t => (
                <div key={t._id} className="card-glass" style={{ padding: '12px 16px', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div 
                      onClick={() => t.logo && setPreviewImage(t.logo)}
                      style={{ 
                        width: 38, height: 38, borderRadius: 10, background: t.color || 'var(--green)', 
                        border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', overflow: 'hidden',
                        cursor: t.logo ? 'pointer' : 'default', flexShrink: 0
                      }}
                    >
                      {t.logo ? <img src={t.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16 }}>👕</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{t.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        <Users size={11} /> {t.players?.length || 0} Atletas
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capitão:</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{t.captainName || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Treinador:</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{t.coachName || '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRegistrationModal && <TeamRegistrationModal tournament={tournament} onClose={() => setShowRegistrationModal(false)} />}
      {showSponsorModal && <SponsorProposalModal tournament={tournament} onClose={() => setShowSponsorModal(false)} />}
      

      {showSubscribeModal && <SubscribeModal tournament={tournament} onClose={() => setShowSubscribeModal(false)} />}
      
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
