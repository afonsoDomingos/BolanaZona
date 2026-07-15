import { useState, useEffect } from 'react';
import { Eye, Youtube } from 'lucide-react';
import api from '../services/api';

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

export default function VisitorCounter() {
  const [count, setCount] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState('visits'); // 'visits' | 'youtube' | 'tiktok'
  const [isFading, setIsFading] = useState(false);

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
    const base = {
      position: 'fixed',
      right: '20px',
      bottom: '162px',
      zIndex: 9997,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '100px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.5s ease',
      userSelect: 'none',
      pointerEvents: 'auto'
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
    <div 
      className={`visitor-badge-container ${highlight ? 'sparkle-highlight' : ''} ${slide === 'youtube' ? 'clickable-youtube' : ''} ${slide === 'tiktok' ? 'clickable-tiktok' : ''}`}
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
          .visitor-badge-container {
            right: 16px !important;
            bottom: 156px !important;
            padding: 6px 12px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
