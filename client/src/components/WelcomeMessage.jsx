import { useState, useEffect } from 'react';

export default function WelcomeMessage() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const fullTitle = 'Bem-vindo ao Bola na Zona!';
  const fullSubtitle = 'Prepara-te para o próximo fim de semana, vêm aí grandes jogos! 🔥';

  useEffect(() => {
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

    return () => clearInterval(titleInterval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.15rem', minHeight: '28px', color: '#00C853' }}>
        {title}
        {title.length < fullTitle.length && <span className="cursor-blink">|</span>}
      </span>
      <span style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.4', minHeight: '40px' }}>
        {subtitle}
        {title.length === fullTitle.length && subtitle.length < fullSubtitle.length && <span className="cursor-blink">|</span>}
      </span>
    </div>
  );
}
