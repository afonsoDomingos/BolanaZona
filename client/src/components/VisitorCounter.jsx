import { useState, useEffect } from 'react';
import { Eye, Youtube } from 'lucide-react';
import api from '../services/api';

const Confetti = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, overflow: 'hidden' }}>
      {[...Array(60)].map((_, i) => {
        const left = Math.random() * 100;
        const animDuration = 2 + Math.random() * 3;
        const delay = Math.random() * 0.5;
        const colors = ['#00C853', '#FFD600', '#FF3D00', '#2979FF', '#AA00FF', '#00f2ea', '#ff0050'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div key={i} style={{
            position: 'absolute',
            top: '-20px',
            left: `${left}%`,
            width: '8px',
            height: '8px',
            background: color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${animDuration}s linear ${delay}s forwards`,
          }} />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const TiktokIcon = ({ size = 14 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const CountUp = ({ end }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5s para contar
    const steps = 60;
    const increment = end / steps;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}</span>;
};

export default function VisitorCounter({ variant = 'fixed' }) {
  const [count, setCount] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState('visits'); // 'visits' | 'youtube' | 'tiktok'
  const [isFading, setIsFading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneVisitor, setMilestoneVisitor] = useState(null);

  useEffect(() => {
    // 1. Carregar contagem inicial de visitas
    api.get('/analytics/total-visits')
      .then(res => {
        if (res.data && typeof res.data.totalVisits === 'number') {
          setCount(res.data.totalVisits);
        }
      })
      .catch(err => {
        console.error('Erro ao buscar total de visitas:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Ouvir atualizações em tempo real do tracking
    const handleVisitTracked = (e) => {
      const { visitorNumber } = e.detail || {};
      if (visitorNumber && visitorNumber > 0) {
        setCount(visitorNumber);
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2000);

        // Se for um múltiplo de 10, celebrar!
        if (visitorNumber % 10 === 0) {
          setMilestoneVisitor(visitorNumber);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 6000);
        }
      }
    };

    window.addEventListener('bnz-visit-tracked', handleVisitTracked);
    return () => {
      window.removeEventListener('bnz-visit-tracked', handleVisitTracked);
    };
  }, []);

  // 3. Alternar entre número de visitas, YouTube e TikTok
  useEffect(() => {
    const slideOrder = {
      visits: 'youtube',
      youtube: 'tiktok',
      tiktok: 'visits'
    };

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setSlide(prev => slideOrder[prev] || 'visits');
        setIsFading(false);
      }, 300); // 300ms de fade-out
    }, 6000); // muda a cada 6 segundos

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (slide === 'youtube') {
      window.open('https://www.youtube.com/@bolanazonamz', '_blank', 'noopener,noreferrer');
    } else if (slide === 'tiktok') {
      window.open('https://vm.tiktok.com/ZS9McknUUSCBY-Jd9qr/', '_blank', 'noopener,noreferrer');
    }
  };

  const getContainerStyle = () => {
    const isInline = variant === 'inline';
    
    const base = {
      position: isInline ? 'relative' : 'fixed',
      right: isInline ? 'auto' : '20px',
      bottom: isInline ? 'auto' : '162px',
      zIndex: isInline ? 'auto' : 9997,
      display: isInline ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: isInline ? 'center' : 'flex-start',
      gap: '8px',
      padding: isInline ? '16px 24px' : '8px 16px',
      borderRadius: isInline ? '12px' : '100px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: isInline ? '15px' : '13px',
      fontWeight: '700',
      transition: 'all 0.5s ease',
      userSelect: 'none',
      pointerEvents: 'auto',
      margin: isInline ? '0 auto' : '0',
      width: isInline ? 'min(300px, 100%)' : 'auto',
      minWidth: isInline ? 'min(300px, 100%)' : 'auto',
      boxSizing: 'border-box'
    };

    if (highlight) {
      return {
        ...base,
        background: 'rgba(10, 15, 20, 0.85)',
        border: '1px solid rgba(0, 200, 83, 0.8)',
        boxShadow: '0 0 25px rgba(0, 200, 83, 0.6), inset 0 0 8px rgba(0, 200, 83, 0.4)',
        cursor: 'default'
      };
    }

    switch (slide) {
      case 'youtube':
        return {
          ...base,
          background: 'rgba(15, 10, 12, 0.85)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 0, 0, 0.1)',
          cursor: 'pointer'
        };
      case 'tiktok':
        return {
          ...base,
          background: 'rgba(10, 12, 15, 0.85)',
          border: '1px solid rgba(0, 242, 234, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 242, 234, 0.1)',
          cursor: 'pointer'
        };
      case 'visits':
      default:
        return {
          ...base,
          background: 'rgba(10, 15, 20, 0.85)',
          border: '1px solid rgba(0, 200, 83, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 200, 83, 0.1)',
          cursor: 'default'
        };
    }
  };

  if (loading && count === 0) return null;

  return (
    <>
      {showConfetti && (
        <>
          <Confetti />
          <div style={{ position: 'fixed', inset: 0, zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
            <div className="wave-border-card" style={{
              background: '#ffffff', 
              padding: '40px 24px', 
              borderRadius: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              gap: '12px',
              maxWidth: '340px',
              position: 'relative',
              zIndex: 1,
              animation: 'slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}>
               <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '120px', height: '120px', background: 'var(--green)', opacity: '0.1', borderRadius: '50%', filter: 'blur(25px)', zIndex: -1 }}></div>
               <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', background: '#FFD600', opacity: '0.1', borderRadius: '50%', filter: 'blur(25px)', zIndex: -1 }}></div>
               
               <div style={{ fontSize: '56px', animation: 'bounce 2s infinite', marginBottom: '8px' }}>🎉</div>
               <div style={{ fontWeight: '900', color: 'var(--green)', fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Parabéns!</div>
               
               <div style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '600', margin: '4px 0' }}>
                 És o <strong style={{ color: 'var(--green)', fontSize: '22px', background: 'rgba(0,200,83,0.1)', padding: '4px 12px', borderRadius: '10px', display: 'inline-block', margin: '0 4px' }}>{milestoneVisitor}º</strong> visitante!
               </div>
               
               <div style={{ color: '#666666', fontSize: '14px', marginTop: '4px', fontWeight: '500', lineHeight: '1.5' }}>
                 A nossa comunidade não para de crescer.<br/>Obrigado por fazeres parte disto! 🚀⚽
               </div>
            </div>
          </div>
        </>
      )}
      <div 
        className={`visitor-badge-container ${variant === 'inline' ? 'visitor-badge-container--inline' : 'visitor-badge-container--fixed'} ${highlight ? 'sparkle-highlight' : ''} ${slide === 'youtube' ? 'clickable-youtube' : ''} ${slide === 'tiktok' ? 'clickable-tiktok' : ''}`}
        onClick={handleClick}
      style={getContainerStyle()}
      title={
        slide === 'youtube' 
          ? "Visitar o nosso Canal de YouTube" 
          : slide === 'tiktok' 
            ? "Seguir no TikTok" 
            : "Total de visitas à plataforma Bola na Zona"
      }
    >
      <div 
        className="slide-content-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: isFading ? 0 : 1,
          transform: isFading ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
      >
        {slide === 'visits' && (
          <>
            <div 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00C853',
                animation: 'pulse-dot 2s infinite',
                boxShadow: '0 0 8px #00C853'
              }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
              <Eye size={13} style={{ color: 'var(--green)', minWidth: '13px' }} />
              <span>Visitas:</span>
            </span>
            <span 
              style={{ 
                color: 'var(--green)', 
                fontWeight: '800',
                fontSize: '14px',
                textShadow: '0 0 10px rgba(0, 200, 83, 0.3)',
                display: 'inline-block',
                minWidth: '20px'
              }}
            >
              <CountUp end={count} />
            </span>
          </>
        )}

        {slide === 'youtube' && (
          <>
            <div 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FF0000',
                animation: 'pulse-dot-red 2s infinite',
                boxShadow: '0 0 8px #FF0000'
              }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.9 }}>
              <Youtube size={14} style={{ color: '#FF0000', minWidth: '14px' }} />
              <span style={{ color: '#ffffff' }}>Canal de YouTube</span>
            </span>
            <span style={{ color: 'var(--yellow)', fontWeight: '800', fontSize: '11px', letterSpacing: '0.5px' }}>
              ⚽ VER
            </span>
          </>
        )}

        {slide === 'tiktok' && (
          <>
            <div 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00f2ea',
                animation: 'pulse-dot-tiktok 2s infinite',
                boxShadow: '0 0 8px #00f2ea'
              }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.9 }}>
              <span style={{ color: '#00f2ea', display: 'flex', alignItems: 'center' }}>
                <TiktokIcon size={13} />
              </span>
              <span style={{ color: '#ffffff' }}>Siga no TikTok</span>
            </span>
            <span style={{ color: '#ff0050', fontWeight: '800', fontSize: '11px', letterSpacing: '0.5px' }}>
              ⚽ IR
            </span>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 12px #00C853; }
          100% { transform: scale(1); opacity: 0.4; }
        }

        @keyframes pulse-dot-red {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 12px #FF0000; }
          100% { transform: scale(1); opacity: 0.4; }
        }

        @keyframes pulse-dot-tiktok {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 12px #00f2ea; }
          100% { transform: scale(1); opacity: 0.4; }
        }
        
        .visitor-badge-container {
          animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .visitor-badge-container.clickable-youtube:hover {
          transform: translateY(-3px) scale(1.03);
          border-color: rgba(255, 0, 0, 0.6) !important;
          box-shadow: 0 10px 30px rgba(255, 0, 0, 0.25), 0 0 15px rgba(255, 0, 0, 0.15) !important;
          background: rgba(25, 12, 14, 0.9) !important;
        }

        .visitor-badge-container.clickable-tiktok:hover {
          transform: translateY(-3px) scale(1.03);
          border-color: rgba(0, 242, 234, 0.6) !important;
          box-shadow: 0 10px 30px rgba(0, 242, 234, 0.25), 0 0 15px rgba(255, 0, 80, 0.2) !important;
          background: rgba(12, 14, 25, 0.9) !important;
        }

        .sparkle-highlight {
          transform: scale(1.05);
          border-color: rgba(0, 200, 83, 0.8) !important;
        }

        .wave-border-card {
          border: 3px solid var(--green);
        }

        .wave-border-card::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 28px;
          border: 2px solid var(--green);
          animation: wave-ripple 2s linear infinite;
          z-index: -2;
        }

        .wave-border-card::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 28px;
          border: 2px solid var(--green);
          animation: wave-ripple 2s linear infinite;
          animation-delay: 1s;
          z-index: -2;
        }

        @keyframes wave-ripple {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }

        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .visitor-badge-container--fixed {
            right: auto !important;
            bottom: auto !important;
            padding: 8px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
      </div>
    </>
  );
}
