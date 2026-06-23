import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Youtube, ShoppingBag, Download, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const TiktokIcon = ({ size = 18 }) => (
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

export default function SocialFAB() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('social-fab-collapsed') === 'true';
  });

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Se já estiver instalado no ecrã principal, não há necessidade de mostrar o botão de download
    if (isStandalone) {
      setShowDownload(false);
      return;
    }

    // Mostrar se for telemóvel por padrão (como fallback de instalação manual)
    if (isMobile) {
      setShowDownload(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowDownload(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem('social-fab-collapsed') === 'true');
    };
    window.addEventListener('social-fab-toggle', handleToggle);
    return () => {
      window.removeEventListener('social-fab-toggle', handleToggle);
    };
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('social-fab-collapsed', String(newState));
    window.dispatchEvent(new Event('social-fab-toggle'));
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowDownload(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('PWA Install Error:', err);
      }
    } else {
      // Manual fallback instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast((t) => (
          <span style={{ fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: 'var(--yellow)' }}>📱 Instalar no iPhone:</span><br />
            Toca no botão de <strong>Partilhar</strong> (quadrado com seta para cima) e escolhe <strong>"Adicionar ao Ecrã Principal"</strong>.
          </span>
        ), { duration: 6000, position: 'bottom-left' });
      } else {
        toast((t) => (
          <span style={{ fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>📱 Instalar App:</span><br />
            Clica nos três pontos do navegador e escolhe <strong>"Instalar"</strong> ou <strong>"Adicionar ao Ecrã Principal"</strong>.
          </span>
        ), { duration: 6000, position: 'bottom-left' });
      }
    }
  };

  // Não mostrar em páginas de admin ou de community
  if (location.pathname === '/community' || location.pathname.startsWith('/admin')) {
    return null;
  }

  if (isCollapsed) {
    return (
      <button 
        onClick={toggleCollapsed}
        className="social-fab-toggle-show"
        title="Mostrar links de redes"
        style={{
          position: 'fixed',
          left: '20px',
          bottom: '20px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 11, 92, 0.65)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          zIndex: 9998,
          transition: 'all 0.3s'
        }}
      >
        <Eye size={16} strokeWidth={2.2} />
        <style>{`
          .social-fab-toggle-show:hover {
            transform: scale(1.1);
            background: rgba(10, 11, 92, 0.8) !important;
            box-shadow: 0 6px 16px rgba(0, 200, 83, 0.4) !important;
          }
          @media (max-width: 768px) {
            .social-fab-toggle-show {
              left: 16px !important;
              bottom: 16px !important;
              width: 32px !important;
              height: 32px !important;
            }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div 
      className="social-fab-container animate-fade-in"
      style={{
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9998
      }}
    >
      {/* YouTube Button */}
      <a 
        href="https://www.youtube.com/@bolanazonamz" 
        target="_blank" 
        rel="noopener noreferrer"
        className="social-fab-item social-fab-youtube"
        title="Siga-nos no YouTube"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FF0000',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(255, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <Youtube size={15} strokeWidth={2} />
      </a>

      {/* TikTok Button */}
      <a 
        href="https://www.tiktok.com/@bolanazonamz" 
        target="_blank" 
        rel="noopener noreferrer"
        className="social-fab-item social-fab-tiktok"
        title="Siga-nos no TikTok"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <TiktokIcon size={14} />
      </a>

      {/* Loja / Shop Button */}
      <Link 
        to="/shop"
        className="social-fab-item social-fab-shop"
        title="Visitar Loja Oficial"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#000000',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: 'pointer'
        }}
      >
        <ShoppingBag size={14} strokeWidth={2.2} />
      </Link>

      {/* PWA Download Button */}
      {showDownload && (
        <button 
          onClick={handleInstallClick}
          className="social-fab-item social-fab-download"
          title="Instalar App"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a1c',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Download size={14} strokeWidth={2.5} />
        </button>
      )}

      {/* Toggle Hide Button */}
      <button 
        onClick={toggleCollapsed}
        className="social-fab-item social-fab-close"
        title="Ocultar links"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: 'pointer'
        }}
      >
        <EyeOff size={14} strokeWidth={2.2} />
      </button>

      <style>{`
        .social-fab-youtube:hover {
          transform: scale(1.1) translateY(-3px);
          background: #cc0000 !important;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 8px 20px rgba(255, 0, 0, 0.4) !important;
        }

        .social-fab-tiktok:hover {
          transform: scale(1.1) translateY(-3px);
          background: #111111 !important;
          box-shadow: -3px -3px 12px #00f2fe, 3px 3px 12px #fe0979, 0 8px 20px rgba(0, 0, 0, 0.5) !important;
        }

        .social-fab-shop:hover {
          transform: scale(1.1) translateY(-3px);
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35) !important;
        }

        .social-fab-download:hover {
          transform: scale(1.1) translateY(-3px);
          background: #000000 !important;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2), 0 8px 20px rgba(0, 0, 0, 0.5) !important;
        }

        .social-fab-close:hover {
          transform: scale(1.1) translateY(-3px);
          background: rgba(255, 68, 68, 0.8) !important;
          border-color: rgba(255, 68, 68, 0.9) !important;
          box-shadow: 0 8px 20px rgba(255, 68, 68, 0.4) !important;
        }

        @media (max-width: 768px) {
          .social-fab-container {
            left: 50% !important;
            transform: translateX(-50%);
            bottom: 16px !important;
            flex-direction: row !important;
            gap: 12px !important;
            background: rgba(10, 11, 92, 0.4);
            backdrop-filter: blur(12px);
            padding: 8px 16px;
            border-radius: 100px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .social-fab-item {
            width: 32px !important;
            height: 32px !important;
          }
          .social-fab-item svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
