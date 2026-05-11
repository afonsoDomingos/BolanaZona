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
      className="community-fab"
      title="Entrar na Comunidade"
    >
      <div className="fab-badge">LIVE</div>
      <MessageCircle size={28} />
      
      <style>{`
        .community-fab {
          position: fixed;
          bottom: 100px; /* Acima do botão de feedback se houver */
          right: 24px;
          width: 60px;
          height: 60px;
          background: var(--green);
          color: #000;
          border-radius: 50%;
          display: flex;
          alignItems: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0, 200, 83, 0.4);
          z-index: 9998;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .community-fab:hover {
          transform: scale(1.1) translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 200, 83, 0.6);
          background: #00e676;
        }

        .fab-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff1744;
          color: white;
          font-size: 9px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 100px;
          border: 2px solid var(--bg-main);
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 23, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0); }
        }

        @media (max-width: 768px) {
          .community-fab {
            bottom: 24px;
            right: 24px;
            width: 54px;
            height: 54px;
          }
        }
      `}</style>
    </Link>
  );
}
