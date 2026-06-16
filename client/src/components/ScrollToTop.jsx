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
      className="fab-item animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
    >
      <ChevronUp size={16} strokeWidth={3} />
    </button>
  );
}
