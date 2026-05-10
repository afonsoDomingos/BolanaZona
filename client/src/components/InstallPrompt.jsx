import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar após 5 segundos para não ser intrusivo
      setTimeout(() => setVisible(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div 
      className="animate-slide-up"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        maxWidth: '400px',
        margin: '0 auto',
        background: 'rgba(18,18,18,0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        zIndex: 1100
      }}
    >
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        background: 'linear-gradient(135deg, var(--green), #00e676)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#000'
      }}>
        <Smartphone size={24} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#fff' }}>Instalar Bola na Zona</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Acede mais rápido e consome menos dados.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleInstall}
          className="btn btn-primary btn-sm"
          style={{ height: '36px', padding: '0 16px', borderRadius: '10px' }}
        >
          <Download size={14} /> Instalar
        </button>
        <button 
          onClick={() => setVisible(false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
