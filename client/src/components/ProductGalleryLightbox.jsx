import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGalleryLightbox({ images = [], initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    // Add escape key and arrow key listeners
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, images]);

  if (!images.length) return null;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="lightbox-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'lightboxFadeIn 0.25s ease-out'
      }}
    >
      {/* Close button */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: 'none',
          color: '#fff',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <X size={20} />
      </button>

      {/* Main content slider container */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        {images.length > 1 && (
          <button 
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '-10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Image */}
        <img 
          src={images[index]} 
          alt={`Product view ${index + 1}`} 
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            animation: 'lightboxZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />

        {/* Right Arrow */}
        {images.length > 1 && (
          <button 
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '-10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateX(3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnails row / status dots indicator */}
      <div 
        style={{ 
          marginTop: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '12px',
          zIndex: 10
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px' }}>
            {images.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setIndex(idx)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: index === idx ? '2px solid var(--green)' : '2px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  background: '#1a1a1c',
                  transform: index === idx ? 'scale(1.1)' : 'none',
                  boxShadow: index === idx ? '0 0 15px rgba(0,200,83,0.3)' : 'none'
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
        
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>
          {index + 1} de {images.length}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lightboxZoomIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        /* Mobile adjust overlay arrows styling */
        @media (max-width: 600px) {
          .lightbox-overlay button {
            width: 40px !important;
            height: 40px !important;
          }
          .lightbox-overlay button svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
