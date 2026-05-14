import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [promptState, setPromptState] = useState('hidden'); // 'hidden', 'big', 'mini', 'manual'

  useEffect(() => {
    let fallbackTimeout;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isStandalone) {
      setPromptState('hidden');
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar prompt imediatamente quando o navegador permitir
      setPromptState('big');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Fallback para quando o evento não dispara (incluindo iOS e Android/Safari/etc)
    if (isMobile && !isStandalone) {
      fallbackTimeout = setTimeout(() => {
        setPromptState(prev => prev === 'hidden' ? 'big' : prev);
      }, 3000); 
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, []);

  // Auto-esconder o banner grande após 15 segundos visível
  useEffect(() => {
    if (promptState === 'big' || promptState === 'manual') {
      const autoHide = setTimeout(() => {
        setPromptState('mini');
      }, 15000);
      return () => clearTimeout(autoHide);
    }
  }, [promptState]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        console.log('🚀 [PWA] A disparar prompt nativo...');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`✅ [PWA] Resultado da escolha: ${outcome}`);
        setPromptState('hidden');
        setDeferredPrompt(null);
      } catch (err) {
        console.error('❌ [PWA] Erro no prompt:', err);
        setPromptState('manual');
      }
    } else {
      // Manual instruction for iOS / unsupported browsers
      setPromptState('manual');
    }
  };

  if (promptState === 'hidden') return null;

  return (
    <>
      {(promptState === 'big' || promptState === 'manual') ? (
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
              {promptState === 'big' && (
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
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>📱 Instrução para iPhone:</span>
                  <span>Toca no ícone de <strong>Partilhar</strong> (o quadrado com uma seta para cima na barra de baixo) e depois escolhe <strong>"Adicionar ao Ecrã Principal"</strong>.</span>
                </div>
              ) : (
                <>Para instalar, clica nos três pontos do navegador e escolhe <strong>"Instalar Aplicação"</strong> ou <strong>"Adicionar ao Ecrã Principal"</strong>.</>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="install-mini animate-fade-in" onClick={() => setPromptState('big')} title="Instalar Bola na Zona">
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
          z-index: 9999;
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
            bottom: 20px;
            left: 20px;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--green), #00e676);
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 200, 83, 0.4);
            z-index: 9999;
            cursor: pointer;
            border: 2px solid var(--bg-primary);
          }
        }
      `}</style>
    </>
  );
}
