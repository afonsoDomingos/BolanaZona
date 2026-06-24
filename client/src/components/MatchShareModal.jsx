import { forwardRef, useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ShareModal from './ShareModal';
import { buildMatchShareText, dataUrlToBlob } from '../utils/shareUtils';

export default function MatchShareModal({ match, tournament, onClose }) {
  const cardRef = useRef(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [generating, setGenerating] = useState(true);

  const url = `${window.location.origin}/t/${tournament.shareCode}`;
  const shareText = buildMatchShareText(match, tournament, url);
  const fileName = `jogo-${match.homeTeam?.name || 'casa'}-vs-${match.awayTeam?.name || 'fora'}.png`;

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      if (!cardRef.current) return;
      try {
        await new Promise((r) => setTimeout(r, 120));
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
        if (cancelled) return;
        const blob = await dataUrlToBlob(dataUrl);
        setImageBlob(blob);
        setImagePreviewUrl(dataUrl);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setGenerating(false);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, []);

  if (generating) {
    return (
      <>
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="modal share-modal" style={{ padding: 32, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>A preparar imagem de partilha…</p>
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
          <MatchShareCard ref={cardRef} match={match} tournament={tournament} />
        </div>
      </>
    );
  }

  if (!imageBlob) {
    return (
      <ShareModal
        onClose={onClose}
        url={url}
        title="Partilhar jogo"
        subtitle={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
        shareText={shareText}
      />
    );
  }

  return (
    <ShareModal
      onClose={onClose}
      url={url}
      title="Partilhar jogo"
      subtitle={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
      shareText={shareText}
      imageBlob={imageBlob}
      imagePreviewUrl={imagePreviewUrl}
      imageFileName={fileName}
    />
  );
}

const MatchShareCard = forwardRef(function MatchShareCard({ match, tournament }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: 400,
        height: 400,
        background: 'linear-gradient(135deg, #080d1a 0%, #0d1529 100%)',
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(0,200,83,0.3)',
      }}
    >
    <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.1) 0%, transparent 70%)' }} />
    <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(41,121,255,0.05) 0%, transparent 70%)' }} />

    <div style={{ fontSize: 12, fontWeight: 800, color: '#00C853', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>{tournament.name}</div>
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>📍 {tournament.neighborhood}</div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', justifyContent: 'center' }}>
      <TeamBlock team={match.homeTeam} highlight={match.status === 'finished' && match.homeScore > match.awayScore} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
        {match.status === 'finished' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{match.homeScore}</span>
            <span style={{ fontSize: 24, fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>-</span>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{match.awayScore}</span>
          </div>
        ) : (
          <div style={{ fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.1)', fontStyle: 'italic', letterSpacing: 4 }}>VS</div>
        )}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#00C853', marginTop: 4, letterSpacing: 2 }}>{match.status === 'finished' ? 'FINAL' : 'BREVEMENTE'}</div>
      </div>
      <TeamBlock team={match.awayTeam} highlight={match.status === 'finished' && match.awayScore > match.homeScore} />
    </div>

    <div style={{ marginTop: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '4px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)' }}>{match.roundName}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12, fontWeight: 500 }}>
        {match.date ? new Date(match.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data a anunciar'}
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 16, height: 16, background: '#00C853', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>⚽</div>
      <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>BOLANAZONA</span>
    </div>
  </div>
  );
});

function TeamBlock({ team, highlight }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: 'rgba(255,255,255,0.05)',
          border: '2px solid ' + (highlight ? '#00C853' : 'rgba(255,255,255,0.1)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          overflow: 'hidden',
          boxShadow: highlight ? '0 0 20px rgba(0,200,83,0.3)' : 'none',
        }}
      >
        {team?.logo ? <img src={team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" /> : <span style={{ fontSize: 32 }}>👕</span>}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', maxWidth: 120, margin: '0 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team?.name}</div>
    </div>
  );
}
