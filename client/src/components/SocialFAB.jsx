import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Youtube, ShoppingBag, Download } from 'lucide-react';
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

  return (
    <div 
      className="social-fab-container animate-fade-in"
      style={{
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
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
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FF0000',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <Youtube size={20} strokeWidth={2} />
      </a>

      {/* TikTok Button */}
      <a 
        href="https://www.tiktok.com/@bolanazonamz" 
        target="_blank" 
        rel="noopener noreferrer"
        className="social-fab-item social-fab-tiktok"
        title="Siga-nos no TikTok"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <TiktokIcon size={18} />
      </a>

      {/* Loja / Shop Button */}
      <Link 
        to="/shop"
        className="social-fab-item social-fab-shop"
        title="Visitar Loja Oficial"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#00C853',
          color: '#000000',
          boxShadow: '0 4px 12px rgba(0, 200, 83, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <ShoppingBag size={18} strokeWidth={2.2} />
      </Link>

      {/* PWA Download Button */}
      {showDownload && (
        <button 
          onClick={handleInstallClick}
          className="social-fab-item social-fab-download"
          title="Instalar App"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a1c',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Download size={18} strokeWidth={2.5} />
        </button>
      )}

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
          background: #00e676 !important;
          box-shadow: 0 0 15px rgba(0, 200, 83, 0.8), 0 8px 20px rgba(0, 200, 83, 0.4) !important;
        }

        .social-fab-download:hover {
          transform: scale(1.1) translateY(-3px);
          background: #000000 !important;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2), 0 8px 20px rgba(0, 0, 0, 0.5) !important;
        }

        @media (max-width: 768px) {
          .social-fab-container {
            left: 16px;
            bottom: 16px;
            gap: 10px;
          }
          .social-fab-item {
            width: 40px !important;
            height: 40px !important;
          }
          .social-fab-item svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
