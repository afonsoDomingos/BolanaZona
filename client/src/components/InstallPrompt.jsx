import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [promptState, setPromptState] = useState('hidden'); // 'hidden', 'big', 'mini', 'manual'

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (!isStandalone && isMobile) {
      setTimeout(() => {
        setPromptState(prev => prev === 'hidden' ? 'big' : prev);
      }, 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Auto-esconder o banner grande após 10 segundos visível
  useEffect(() => {
    if (promptState === 'big') {
      const autoHide = setTimeout(() => {
        setPromptState('mini');
      }, 10000);
      return () => clearTimeout(autoHide);
    }
  }, [promptState]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setPromptState('hidden');
        setDeferredPrompt(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Manual instruction for iOS / unsupported browsers
      setPromptState('manual');
    }
  };

  if (promptState === 'hidden') return null;

  return (
    <>
      {promptState === 'big' || promptState === 'manual' ? (
        <div className="install-prompt animate-slide-up" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--green), #00e676)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#000',
              flexShrink: 0
            }}>
              <Smartphone size={24} />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#fff' }}>Instalar Bola na Zona</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Acede mais rápido e consome menos dados.</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {promptState !== 'manual' && (
                <button 
                  onClick={handleInstall}
                  className="btn btn-primary btn-sm"
                  style={{ height: '36px', padding: '0 16px', borderRadius: '10px', flexShrink: 0 }}
                >
                  <Download size={14} /> Instalar
                </button>
              )}
              <button 
                onClick={() => setPromptState('mini')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {promptState === 'manual' && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Para instalar, toca em <strong>Partilhar</strong> (ícone do meio na barra do navegador) e escolhe <strong>Adicionar ao Ecrã Principal</strong>.
            </div>
          )}
        </div>
      ) : (
        <div className="install-mini animate-fade-in" onClick={handleInstall} title="Instalar Bola na Zona">
          <Download size={22} color="#000" />
        </div>
      )}

      <style>{`
        .install-prompt {
          position: fixed;
          bottom: 24px;
          left: 24px;
          width: 400px;
          background: rgba(18, 18, 18, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          z-index: 1100;
        }

        .install-mini {
          display: none;
        }

        @media (max-width: 768px) {
          .install-prompt {
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 24px 24px 0 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
            padding: 16px 16px max(16px, env(safe-area-inset-bottom));
          }

          .install-mini {
            display: flex;
            position: fixed;
            bottom: 24px;
            left: 24px;
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, var(--green), #00e676);
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 200, 83, 0.4);
            z-index: 1100;
            cursor: pointer;
            border: 2px solid var(--bg-primary);
          }
        }
      `}</style>
    </>
  );
}
