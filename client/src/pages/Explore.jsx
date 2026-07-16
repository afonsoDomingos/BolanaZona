import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Users, MapPin, Calendar, ArrowRight, Search, X, Share2, ShoppingBag } from 'lucide-react';
import MatchLikeButton from '../components/MatchLikeButton';
import ScheduledBadge from '../components/ScheduledBadge';
import ShareModal from '../components/ShareModal';
import { buildMatchShareText } from '../utils/shareUtils';


const WhatsAppIcon = ({ size = 11 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-11.758c.159.354.316.596.53.954.214.358.143.763.07 1.121-.07.358-.502 2.222-.502 2.222s-.229.832.32 1.282c.551.451 1.22.18 1.22.18s1.65-.89 2.222-1.222c.515-.315.654-.268.966-.027.311.242 1.341 1.056 1.341 1.056s.31.258.629.138c.32-.12.443-.654.443-.654s.517-2.03.654-2.502c.137-.472.072-.83-.143-1.056-.215-.226-1.12-1.121-1.12-1.121s-.317-.308-.093-.574c.224-.266.856-.913 1.173-1.24.317-.327.387-.454.492-.68.106-.226.035-.55-.072-.693-.106-.143-.889-2.062-.889-2.062s-.234-.515-.654-.42c-.42.096-.957.513-.957.513s-.654.673-.62 1.08c.033.407.228.983.228.983s-.502-.07-1.11-.34c-.608-.27-1.233-.794-1.233-.794s-.383-.346-.575-.152c-.191.194-.502.996-.502.996zm12.333-6.529C17.062 3.824 14.652 2.7 12.008 2.7 6.877 2.7 2.709 6.87 2.706 12c-.001 1.705.446 3.371 1.293 4.838L2.946 20.5l3.822-1.002c1.417.773 3.013 1.182 4.636 1.183h.005c5.13 0 9.297-4.17 9.301-9.3.002-2.486-.963-4.823-2.73-6.59z" />
  </svg>
);

export default function Explore() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('');

  const [matches, setMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [shareModal, setShareModal] = useState(null);

  const openMatchShare = (match) => {
    const tournament = match.tournament;
    const url = `${window.location.origin}/t/${tournament?.shareCode}`;
    setShareModal({
      url,
      shareText: buildMatchShareText(match, tournament, url),
      title: 'Partilhar jogo',
      subtitle: `${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
    });
  };

  const handleMatchLike = (match) => {
    const tournamentId = match.tournament?._id || match.tournament;

    setMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: (m.likes || 0) + 1 } : m));
    setRecentMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: (m.likes || 0) + 1 } : m));

    api.post(`/tournaments/${tournamentId}/matches/${match._id}/like`)
      .then(res => {
        setMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: res.data.likes ?? 0 } : m));
        setRecentMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: res.data.likes ?? 0 } : m));
      })
      .catch(() => {
        setMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: Math.max(0, (m.likes || 0) - 1) } : m));
        setRecentMatches(prev => prev.map(m => m._id === match._id ? { ...m, likes: Math.max(0, (m.likes || 0) - 1) } : m));
      });
  };

  useEffect(() => {
    Promise.all([
      api.get('/tournaments/public/all'),
      api.get('/tournaments/public/matches/live'),
      api.get('/tournaments/public/matches/recent')
    ])
      .then(([tournamentsRes, matchesRes, recentRes]) => {
        setTournaments(tournamentsRes.data);
        setMatches(matchesRes.data);
        setRecentMatches(recentRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Track match views (once per session per match)
  useEffect(() => {
    const allMatches = [...matches, ...recentMatches];
    if (allMatches.length === 0) return;
    allMatches.forEach(m => {
      const sessionKey = `viewed_m_${m._id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        api.post(`/tournaments/${m.tournament._id || m.tournament}/matches/${m._id}/view`)
          .then(res => {
            setMatches(prev => prev.map(item => item._id === m._id ? { ...item, views: res.data.views ?? 0 } : item));
            setRecentMatches(prev => prev.map(item => item._id === m._id ? { ...item, views: res.data.views ?? 0 } : item));
          })
          .catch(() => {});
      }
    });
  }, [matches.length, recentMatches.length]);

  const filtered = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !cityFilter || t.city === cityFilter;
    const matchesNeighborhood = !neighborhoodFilter || t.neighborhood === neighborhoodFilter;
    return matchesSearch && matchesCity && matchesNeighborhood;
  });

  const cities = [...new Set(tournaments.map(t => t.city))].filter(Boolean);
  const neighborhoods = [...new Set(tournaments.filter(t => !cityFilter || t.city === cityFilter).map(t => t.neighborhood))].filter(Boolean);

  const statusLabel = { registration: 'Inscrições Abertas', active: 'A Decorrer' };
  const statusBadge = { registration: 'badge-blue', active: 'badge-green' };

  return (
    <div className="page animate-fade-in" style={{ padding: 0 }}>
      {/* Hero Section com Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(8, 13, 26, 0.85), rgba(8, 13, 26, 0.7)), url(/banner3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '80px 0 60px',
        marginBottom: 48,
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, marginBottom: 16 }}>
              <span className="typewriter">Explorar</span> <span className="gradient-text">Torneios</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px', fontSize: 18 }}>
              Descobre os melhores torneios de futebol na tua zona. Acompanha classificações, jogos e resultados em tempo real.
            </p>
            
            <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Pesquisar por nome do torneio..." 
                  style={{ paddingLeft: 56, height: 60, borderRadius: 100, fontSize: 16, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <select className="form-select" style={{ borderRadius: 100, height: 50, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }} value={cityFilter} onChange={e => { setCityFilter(e.target.value); setNeighborhoodFilter(''); }}>
                  <option value="">🌍 Todas as Cidades</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="form-select" style={{ borderRadius: 100, height: 50, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }} value={neighborhoodFilter} onChange={e => setNeighborhoodFilter(e.target.value)}>
                  <option value="">📍 Todos os Bairros</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                {(cityFilter || neighborhoodFilter || search) && (
                  <button className="btn btn-secondary" style={{ borderRadius: 100, color: '#ff8080', borderColor: 'rgba(255,68,68,0.2)' }} onClick={() => { setSearch(''); setCityFilter(''); setNeighborhoodFilter(''); }}>
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 100 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon spin-ball">⚽</div>
            <h3>Nenhum torneio encontrado</h3>
            <p style={{ marginBottom: 24 }}>{search || cityFilter || neighborhoodFilter ? 'Tenta ajustar os teus filtros ou pesquisa.' : 'Ainda não existem torneios ativos nesta zona.'}</p>
            {search || cityFilter || neighborhoodFilter ? (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setCityFilter(''); setNeighborhoodFilter(''); }}>
                Limpar Todos os Filtros
              </button>
            ) : (
              <Link to="/dashboard/tournaments/new" className="btn btn-primary">
                <Trophy size={16} /> Criar o Meu Torneio
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Live Matches Section */}
            {matches.length > 0 && (
              <div style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <h2 className="font-syne" style={{ fontSize: 24, fontWeight: 800 }}>Jogos em Destaque 🔴</h2>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--red), transparent)', opacity: 0.3 }} />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: 20, 
                  paddingBottom: 20, 
                  margin: '0 -20px', 
                  padding: '0 20px 20px',
                  scrollSnapType: 'x mandatory' 
                }}>
                  {matches.reduce((acc, m, idx) => {
                    acc.push(
                      <Link key={m._id} to={`/t/${m.tournament?.shareCode}`} className="match-card hover-scale" style={{ textDecoration: 'none', minWidth: 280, flexShrink: 0, scrollSnapAlign: 'start', position: 'relative', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '18px 16px 12px' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          background: m.status === 'live' ? 'rgba(255, 23, 68, 0.12)' : m.status === 'finished' ? 'rgba(0, 200, 83, 0.12)' : 'rgba(0, 210, 255, 0.12)', 
                          color: m.status === 'live' ? '#ff1744' : m.status === 'finished' ? 'var(--green)' : '#00d2ff', 
                          border: '1px solid ' + (m.status === 'live' ? 'rgba(255, 23, 68, 0.25)' : m.status === 'finished' ? 'rgba(0, 200, 83, 0.25)' : 'rgba(0, 210, 255, 0.25)'),
                          padding: '1px 3px', 
                          borderRadius: 3, 
                          fontSize: 6, 
                          fontWeight: 800, 
                          textTransform: 'uppercase', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 3 
                        }}>
                          {m.status === 'live' ? (
                            <><span className="pulse-dot" style={{ width: 5, height: 5, background: '#ff1744', borderRadius: '50%' }}></span> LIVE</>
                          ) : m.status === 'finished' ? (
                            'CONCLUÍDO'
                          ) : (
                            <ScheduledBadge size="xs" />
                          )}
                        </div>
                        
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                          {m.tournament?.name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                          {/* Home Team */}
                          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                            <div 
                              onClick={(e) => { e.preventDefault(); m.homeTeam?.logo && setPreviewImage(m.homeTeam.logo); }}
                              style={{ 
                                width: 36, height: 36, borderRadius: 10, background: m.homeTeam?.color || 'var(--green)', 
                                margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                overflow: 'hidden', cursor: m.homeTeam?.logo ? 'pointer' : 'default', border: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              {m.homeTeam?.logo ? <img src={m.homeTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{m.homeTeam?.name}</div>
                          </div>

                          {/* Mid Section */}
                          <div style={{ padding: '0 8px', textAlign: 'center', flexShrink: 0 }}>
                            {m.status === 'live' && m.homeScore !== null ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>
                                <span>{m.homeScore}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>
                                <span>{m.awayScore}</span>
                              </div>
                            ) : m.status === 'finished' && m.homeScore !== null ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 18, fontWeight: 900, color: 'var(--text-muted)' }}>
                                <span>{m.homeScore}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>
                                <span>{m.awayScore}</span>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 6 }}>
                                VS
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                            <div 
                              onClick={(e) => { e.preventDefault(); m.awayTeam?.logo && setPreviewImage(m.awayTeam.logo); }}
                              style={{ 
                                width: 36, height: 36, borderRadius: 10, background: m.awayTeam?.color || 'var(--green)', 
                                margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                overflow: 'hidden', cursor: m.awayTeam?.logo ? 'pointer' : 'default', border: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              {m.awayTeam?.logo ? <img src={m.awayTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{m.awayTeam?.name}</div>
                          </div>
                        </div>

                        {/* Match Details Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-secondary)', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minWidth: 0, overflow: 'hidden' }}>
                            {m.date && (
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                📅 {new Date(m.date).toLocaleDateString('pt-PT')}
                              </span>
                            )}
                            {m.location && <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>🏟️ {m.location}</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              className="match-share-btn"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openMatchShare(m); }}
                              title="Partilhar jogo"
                            >
                              <Share2 size={11} />
                            </button>
                            <button
                              type="button"
                              className="match-share-btn"
                              style={{ 
                                color: '#25D366', 
                                background: 'rgba(37, 211, 102, 0.06)', 
                                borderColor: 'rgba(37, 211, 102, 0.15)' 
                              }}
                              onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                const shareText = buildMatchShareText(m, m.tournament, `${window.location.origin}/t/${m.tournament?.shareCode}`);
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                              }}
                              title="Partilhar no WhatsApp"
                            >
                              <WhatsAppIcon size={11} />
                            </button>
                            <MatchLikeButton
                              likes={m.likes || 0}
                              views={m.views || 0}
                              onLike={() => handleMatchLike(m)}
                            />
                          </div>
                        </div>
                      </Link>
                    );

                    // Inject store promo card right after the first match card
                    if (idx === 0) {
                      acc.push(
                        <Link key="store-promo" to="/shop" className="match-card hover-scale" style={{ 
                          textDecoration: 'none', 
                          width: 220,
                          minWidth: 220, 
                          maxWidth: 220,
                          flexShrink: 0, 
                          scrollSnapAlign: 'start', 
                          position: 'relative', 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(0, 200, 83, 0.12)', 
                          borderRadius: 16, 
                          padding: '14px 12px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: 135,
                          overflow: 'hidden'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <ShoppingBag size={12} color="var(--green)" />
                              <span style={{ fontSize: 8, color: 'var(--green)', fontWeight: 800, letterSpacing: 0.5 }}>LOJA OFICIAL</span>
                            </div>
                            
                            <h3 className="font-syne" style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                              Equipa o teu Clube! 👕
                            </h3>
                            <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3, margin: 0 }}>
                              Equipamentos completos, chuteiras e acessórios personalizados.
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 10, fontWeight: 700, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
                            <span>Visitar Loja</span>
                            <span style={{ fontSize: 11 }}>🛒</span>
                          </div>
                        </Link>
                      );
                    }

                    return acc;
                  }, [])}
                </div>
              </div>
            )}

            {/* Recent Results Section */}
            {recentMatches.length > 0 && (
              <div style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <h2 className="font-syne" style={{ fontSize: 24, fontWeight: 800 }}>Resultados Recentes ✅</h2>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--green), transparent)', opacity: 0.3 }} />
                </div>
                <div style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 16, margin: '0 -20px', padding: '0 20px 16px', scrollSnapType: 'x mandatory' }}>
                  {recentMatches.map(m => (
                    <Link key={m._id} to={`/t/${m.tournament?.shareCode}`} style={{ textDecoration: 'none', minWidth: 240, maxWidth: 260, flexShrink: 0, scrollSnapAlign: 'start', background: 'rgba(0,200,83,0.04)', border: '1px solid rgba(0,200,83,0.12)', borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.tournament?.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: m.homeTeam?.color || 'var(--green)', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {m.homeTeam?.logo ? <img src={m.homeTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>{m.homeTeam?.name}</div>
                        </div>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)', letterSpacing: 2 }}>{m.homeScore} - {m.awayScore}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>FINAL</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: m.awayTeam?.color || 'rgba(255,255,255,0.1)', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {m.awayTeam?.logo ? <img src={m.awayTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>{m.awayTeam?.name}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, paddingTop: 4, borderTop: '1px solid rgba(0,200,83,0.08)', marginTop: 4 }}>
                        {m.date && <span style={{ color: 'var(--text-muted)' }}>📅 {new Date(m.date).toLocaleDateString('pt-PT')}</span>}
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                           <button
                             type="button"
                             className="match-share-btn"
                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); openMatchShare(m); }}
                             title="Partilhar jogo"
                           >
                             <Share2 size={11} />
                           </button>
                           <button
                             type="button"
                             className="match-share-btn"
                             style={{ 
                               color: '#25D366', 
                               background: 'rgba(37, 211, 102, 0.06)', 
                               borderColor: 'rgba(37, 211, 102, 0.15)' 
                             }}
                             onClick={(e) => { 
                               e.preventDefault(); 
                               e.stopPropagation(); 
                               const shareText = buildMatchShareText(m, m.tournament, `${window.location.origin}/t/${m.tournament?.shareCode}`);
                               window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                             }}
                             title="Partilhar no WhatsApp"
                           >
                             <WhatsAppIcon size={11} />
                           </button>
                           <MatchLikeButton
                             likes={m.likes || 0}
                             views={m.views || 0}
                             onLike={() => handleMatchLike(m)}
                           />
                         </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Torneios Grid */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <h2 className="font-syne" style={{ fontSize: 24, fontWeight: 800 }}>Ligas Disponíveis</h2>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px',
              maxWidth: 1200, 
              margin: '0 auto' 
            }}>
              {filtered.map((t, idx) => (
                <Link key={t._id} to={`/t/${t.shareCode}`} className="hover-scale" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 20,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  
                  {/* Icon/Avatar */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 24 }}>⚽</div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.name}
                      </h3>
                      {t.isOfficial && <span title="Oficial" style={{ fontSize: 14 }}>🛡️</span>}
                      <span className={`badge-premium ${statusBadge[t.status]}`} style={{ padding: '2px 8px', fontSize: 10 }}>{statusLabel[t.status]}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px 20px', fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} className="text-green" /> {t.neighborhood}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} className="text-blue" /> Máx. {t.maxTeams} equipas</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={12} className="text-yellow" /> {t.prize || 'Troféu'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(t.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0, 200, 83, 0.1)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      
      {shareModal && (
        <ShareModal
          {...shareModal}
          onClose={() => setShareModal(null)}
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
