import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  
  const fullTitle = 'Bem-vindo ao Bola na Zona!';
  const fullSubtitle = 'Prepara-te para o próximo fim de semana, vêm aí grandes jogos! 🔥';

  useEffect(() => {
    const hasSeenGreeting = sessionStorage.getItem('hasSeenGreeting');
    if (!hasSeenGreeting) {
      sessionStorage.setItem('hasSeenGreeting', 'true');
      
      // Pequeno delay antes de mostrar (para dar tempo de a página carregar)
      setTimeout(() => {
        setIsVisible(true);
        
        // Iniciar animação de máquina de escrever
        let titleIndex = 0;
        let subtitleIndex = 0;
        
        const titleInterval = setInterval(() => {
          if (titleIndex <= fullTitle.length) {
            setTitle(fullTitle.slice(0, titleIndex));
            titleIndex++;
          } else {
            clearInterval(titleInterval);
            
            const subtitleInterval = setInterval(() => {
              if (subtitleIndex <= fullSubtitle.length) {
                setSubtitle(fullSubtitle.slice(0, subtitleIndex));
                subtitleIndex++;
              } else {
                clearInterval(subtitleInterval);
              }
            }, 30);
          }
        }, 40);

        // Auto-esconder após 10 segundos
        setTimeout(() => setIsVisible(false), 10000);

      }, 1000);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="welcome-prompt animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '12px' }}>
            <span style={{ fontWeight: '800', fontSize: '15px', color: '#00C853', minHeight: '22px' }}>
              {title}
              {title.length < fullTitle.length && <span className="cursor-blink">|</span>}
            </span>
            <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4', minHeight: '36px', fontWeight: '500' }}>
              {subtitle}
              {title.length === fullTitle.length && subtitle.length < fullSubtitle.length && <span className="cursor-blink">|</span>}
            </span>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            style={{ 
              background: 'rgba(0,0,0,0.05)', 
              border: 'none', 
              color: '#64748b', 
              cursor: 'pointer', 
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .welcome-prompt {
          position: fixed;
          bottom: 24px;
          left: 24px;
          width: 380px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          z-index: 9998; /* Logo abaixo do InstallPrompt se ambos aparecerem */
        }

        @media (max-width: 768px) {
          .welcome-prompt {
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 24px 24px 0 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
            padding: 20px 20px max(20px, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}
