import { useLocation } from 'react-router-dom';
import { Youtube } from 'lucide-react';

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
