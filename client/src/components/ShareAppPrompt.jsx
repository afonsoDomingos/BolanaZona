import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Share2, X, Users } from 'lucide-react';
import ShareModal from './ShareModal';
import { buildAppShareText } from '../utils/shareUtils';

const STORAGE_KEY = 'bnz_share_app_v1';
const SESSION_KEY = 'bnz_share_app_session';
const DELAY_MS = 60000;

const ALLOWED_PATHS = ['/', '/explore'];

function isAllowedPath(pathname) {
  if (ALLOWED_PATHS.includes(pathname)) return true;
  if (/^\/t\/[^/]+$/.test(pathname)) return true;
  return false;
}

export default function ShareAppPrompt() {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bolanazona.com';

  useEffect(() => {
    setShowBanner(false);

    if (!isAllowedPath(location.pathname)) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      setShowBanner(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const dismissSession = () => {
    sessionStorage.setItem(SESSION_KEY, 'dismissed');
    setShowBanner(false);
  };

  const dismissForever = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    sessionStorage.setItem(SESSION_KEY, 'dismissed');
    setShowBanner(false);
    setShowModal(false);
  };

  const handleShare = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  const handleShared = () => {
    localStorage.setItem(STORAGE_KEY, 'shared');
    sessionStorage.setItem(SESSION_KEY, 'shared');
    setShowModal(false);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {showBanner && (
        <div className="share-app-prompt animate-slide-up">
          <button type="button" className="share-app-prompt-close" onClick={dismissForever} aria-label="Fechar">
            <X size={18} />
          </button>

          <div className="share-app-prompt-icon">
            <Users size={22} />
          </div>

          <div className="share-app-prompt-body">
            <h4>Gostaste? Partilha com a malta!</h4>
            <p>Convida os teus amigos a descobrirem torneios e resultados no Bola na Zona.</p>
          </div>

          <div className="share-app-prompt-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleShare}>
              <Share2 size={14} /> Partilhar
            </button>
            <button type="button" className="share-app-prompt-later" onClick={dismissSession}>
              Agora não
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <ShareModal
          onClose={() => setShowModal(false)}
          onShared={handleShared}
          url={appUrl}
          title="Partilhar Bola na Zona"
          subtitle="Convida amigos para a plataforma"
          shareText={buildAppShareText(appUrl)}
        />
      )}

      <style>{`
        .share-app-prompt {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9998;
          width: clamp(290px, 88vw, 360px);
          background: rgba(13, 21, 41, 0.97);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(41, 121, 255, 0.35);
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          padding: 16px;
        }

        .share-app-prompt-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }

        .share-app-prompt-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(41, 121, 255, 0.15);
          color: #60a5fa;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .share-app-prompt-body h4 {
          font-size: 15px;
          font-weight: 800;
          margin: 0 0 6px;
          color: #fff;
          padding-right: 24px;
        }

        .share-app-prompt-body p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0 0 14px;
          line-height: 1.45;
        }

        .share-app-prompt-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .share-app-prompt-later {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }

        .share-app-prompt-later:hover {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .share-app-prompt {
            bottom: max(16px, env(safe-area-inset-bottom));
            right: 16px;
            left: 16px;
            width: auto;
          }
        }
      `}</style>
    </>
  );
}
