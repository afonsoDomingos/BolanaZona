import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

export default function LandingBracketPreview() {
  const [matches, setMatches] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [titleText, setTitleText] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const titleFull = 'A Emoção do Mata-Mata';

  useEffect(() => {
    async function loadLatestBracket() {
      try {
        const allRes = await api.get('/tournaments/public/all');
        const tournaments = allRes.data;
        if (tournaments.length > 0) {
          const latest = tournaments[0];
          setTournament(latest);
          const tRes = await api.get(`/tournaments/public/${latest.shareCode}`);
          const knockoutMatches = tRes.data.matches.filter(m => m.phase === 'knockout');
          setMatches(knockoutMatches);
        }
      } catch (err) {
        console.error("Erro ao carregar bracket para landing page", err);
      } finally {
        setLoading(false);
      }
    }
    loadLatestBracket();
  }, []);

  // Typewriter: starts after data loads
  useEffect(() => {
    if (!tournament) return;
    setTitleText('');
    setBadgeText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTitleText(titleFull.slice(0, i));
      if (i >= titleFull.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, [tournament]);

  if (loading || matches.length === 0) {
    return null; 
  }

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = Math.max(...rounds);
  const finalMatches = matches.filter(m => m.round === maxRound);

  const getRoundName = (round) => {
    const matchesInRound = matches.filter(m => m.round === round).length;
    const distFromFinal = maxRound - round; 
    const customName = matches.find(m => m.round === round)?.roundName;
    if (customName) return customName;
    if (distFromFinal === 0) return 'Final';
    if (distFromFinal === 1) return matchesInRound <= 2 ? 'Meias-Finais' : 'Semifinal';
    if (distFromFinal === 2) return 'Quartos de Final';
    if (distFromFinal === 3) return 'Oitavos de Final';
    if (distFromFinal === 4) return '1/16 de Final';
    return `Fase ${round}`;
  };

  const isDoubleLegged = (round) => {
    const rMatches = matches.filter(m => m.round === round);
    return rMatches.some(m => m.leg === 2 || m.leg === '2');
  };

  const renderMatchCard = (m) => {
    const homeWinner = m.status === 'finished' && m.homeScore > m.awayScore;
    const awayWinner = m.status === 'finished' && m.awayScore > m.homeScore;
    return (
      <div key={m._id} className="bracket-match-node">
        <div className="bracket-match-card" style={{ position: 'relative', opacity: m.status === 'finished' ? 0.65 : 1 }}>
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
          </div>
        </div>
      </div>
    );
  };

  const nonFinalRounds = rounds.filter(r => r !== maxRound);
  
  const leftColumns = nonFinalRounds.map((round) => {
    const roundMatches = matches.filter(m => m.round === round);
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

  const rightColumns = nonFinalRounds.map((round) => {
    const roundMatches = matches.filter(m => m.round === round);
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

  return (
    <section style={{ padding: '100px 0', background: 'var(--bg-main)' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 className="font-syne" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
          <span>{titleText}</span>
          <span style={{
            display: 'inline-block',
            width: '3px',
            height: '0.85em',
            background: 'var(--green)',
            marginLeft: 4,
            verticalAlign: 'middle',
            animation: titleText.length >= titleFull.length ? 'blink-cursor 1s step-end infinite' : 'none',
            opacity: titleText.length >= titleFull.length ? 1 : 1
          }} />
        </h2>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0, 200, 83, 0.1)',
          border: '1px solid rgba(0, 200, 83, 0.3)',
          padding: '10px 24px',
          borderRadius: '50px',
          color: 'var(--green)',
          fontWeight: 800,
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          boxShadow: '0 0 20px rgba(0,200,83,0.15)',
          opacity: titleText.length >= titleFull.length ? 1 : 0,
          transition: 'opacity 0.6s ease'
        }}>
          TORNEIO EM DESTAQUE : <span style={{ color: '#fff' }}>{tournament?.name}</span>
        </div>
        <style>{`
          @keyframes blink-cursor {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>

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
        
        <div className="bracket-container" style={{ position: 'relative', zIndex: 1, transform: 'scale(0.85)', transformOrigin: 'center center' }}>
          <div className="bracket-left-wing">
            {leftColumns}
          </div>

          {(() => {
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
                      <div style={{ marginTop: 12, fontWeight: 900, color: crownedChampion.color || 'var(--yellow)', fontSize: 16 }}>
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
        </div>
      </div>
    </section>
  );
}
