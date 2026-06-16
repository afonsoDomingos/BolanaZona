import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function CommunityFAB() {
  const location = useLocation();

  // Não mostrar na própria página da comunidade ou em páginas de admin
  if (location.pathname === '/community' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Link 
      to="/community" 
      className="fab-item animate-fade-in"
      style={{ position: 'fixed', bottom: '96px', right: '20px', zIndex: 9998 }}
      title="Entrar na Comunidade"
    >
      <div className="fab-badge">LIVE</div>
      <MessageCircle size={18} />
      
      <style>{`
        .fab-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ff1744;
          color: white;
          font-size: 8px;
          font-weight: 900;
          padding: 2px 7px;
          border-radius: 100px;
          border: 2px solid #00C853;
          animation: pulse-red 2s infinite;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(255, 23, 68, 0.4);
        }

        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 23, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0); }
        }

      `}</style>
    </Link>
  );
}
