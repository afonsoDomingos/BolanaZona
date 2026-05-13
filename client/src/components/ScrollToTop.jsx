import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 300) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button 
      onClick={scrollToTop}
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '32px',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'var(--green)',
        color: '#000',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0,200,83,0.3)',
        zIndex: 1000,
        transition: 'transform 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <ChevronUp size={24} strokeWidth={3} />
    </button>
  );
}
