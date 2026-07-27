import { useState, useEffect } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const DEFAULT_PHOTOS = [
  {
    _id: '1',
    title: 'Grande Final de Bairro',
    caption: 'A festa do futebol comunitário na atribuição do troféu principal.',
    image: '/banner1.png',
    category: 'Torneios',
  },
  {
    _id: '2',
    title: 'Mambinhas no CAN Sub-17',
    caption: 'Momento histórico da qualificação inédita ao Mundial Qatar 2026.',
    image: '/banner4mabinhas.jpg',
    category: 'Comunidade',
  },
  {
    _id: '3',
    title: 'Ação em Campo',
    caption: 'Garra, talento e determinação a cada lance disputado.',
    image: '/banner2.png',
    category: 'Jogos',
  },
  {
    _id: '4',
    title: 'Emblema da Comunidade',
    caption: 'Paixão pelo desporto em todas as zonas e bairros.',
    image: '/bolanazonalgo.png',
    category: 'Troféus',
  },
  {
    _id: '5',
    title: 'Comunidade Bola na Zona',
    caption: 'Jovens talentos prontos para dar o salto.',
    image: '/vibe-avatar.png',
    category: 'Comunidade',
  },
  {
    _id: '6',
    title: 'Duelo Decisivo nas Penalidades',
    caption: 'Frieza e concentração nos momentos de máxima pressão.',
    image: '/banner1.png',
    category: 'Jogos',
  },
  {
    _id: '7',
    title: 'Cerimónia de Premiação',
    caption: 'Reconhecimento aos melhores marcadores e guarda-redes.',
    image: '/banner2.png',
    category: 'Troféus',
  },
  {
    _id: '8',
    title: 'Espírito Desportivo',
    caption: 'Respeito e fair-play entre todas as equipas participantes.',
    image: '/banner4mabinhas.jpg',
    category: 'Torneios',
  }
];

// Tilt & position parameters for the orbital layout (inspired by the design inspiration image)
const ORBIT_SLOTS = [
  { top: '2%', left: '42%', rotate: '-6deg', radius: '36px 16px 36px 16px' },
  { top: '10%', left: '72%', rotate: '12deg', radius: '20px 36px 20px 36px' },
  { top: '42%', left: '82%', rotate: '-10deg', radius: '36px 20px 36px 20px' },
  { top: '74%', left: '68%', rotate: '8deg', radius: '20px 36px 20px 36px' },
  { top: '78%', left: '34%', rotate: '-14deg', radius: '36px 20px 36px 20px' },
  { top: '64%', left: '6%', rotate: '10deg', radius: '20px 36px 20px 36px' },
  { top: '30%', left: '2%', rotate: '-8deg', radius: '36px 20px 36px 20px' },
  { top: '8%', left: '16%', rotate: '14deg', radius: '20px 36px 20px 36px' },
];

export default function OrbitalGallerySection() {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPhotos(res.data);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar galeria:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todas', 'Torneios', 'Jogos', 'Comunidade', 'Troféus'];

  const filteredPhotos = activeCategory === 'Todas'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  const displayPhotos = filteredPhotos.slice(0, 8);

  const openLightbox = (index) => {
    setActivePhotoIndex(index);
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
  };

  const nextPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex + 1) % displayPhotos.length);
  };

  const prevPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex - 1 + displayPhotos.length) % displayPhotos.length);
  };

  const currentPhoto = activePhotoIndex !== null ? displayPhotos[activePhotoIndex] : null;

  return (
    <section style={{
      padding: '100px 0',
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      color: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0'
    }}>
      {/* Background glow & subtle ambient shapes */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 200, 83, 0.06) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            borderRadius: 100,
            padding: '6px 18px',
            marginBottom: 16
          }}>
            <Camera size={15} color="#00C853" />
            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, letterSpacing: 0.3 }}>
              Galeria Oficial Bola na Zona
            </span>
          </div>

          <h2 className="font-syne scroll-reveal" style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 16,
            lineHeight: 1.15
          }}>
            Momentos que marcam a <span style={{
              background: 'linear-gradient(135deg, #00C853 0%, #008a38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Nossa História</span>
          </h2>

          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Explora os lances, comemorações e troféus registados pela nossa comunidade.
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 700,
                  border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                  background: activeCategory === cat ? '#0f172a' : '#ffffff',
                  color: activeCategory === cat ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeCategory === cat ? '0 8px 20px rgba(15,23,42,0.15)' : 'none',
                  transform: activeCategory === cat ? 'translateY(-2px)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ORBITAL LAYOUT CONTAINER (Desktop & Tablet) */}
        <div className="orbital-desktop-wrapper" style={{
          position: 'relative',
          width: '100%',
          maxWidth: '820px',
          height: '620px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* Center Hub Core (Inspired by "Upload or drop your assets" hub) */}
          <div style={{
            width: '180px',
            height: '180px',
            background: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            textAlign: 'center',
            zIndex: 10,
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              background: 'rgba(0, 200, 83, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00C853',
              marginBottom: 12
            }}>
              <Sparkles size={26} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Bola na Zona
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 4 }}>
              {displayPhotos.length} Momentos
            </div>
          </div>

          {/* Surrounding Orbital Photo Cards */}
          {displayPhotos.map((photo, index) => {
            const slot = ORBIT_SLOTS[index % ORBIT_SLOTS.length];
            return (
              <div
                key={photo._id || index}
                onClick={() => openLightbox(index)}
                className="orbital-card"
                style={{
                  position: 'absolute',
                  top: slot.top,
                  left: slot.left,
                  width: '135px',
                  height: '170px',
                  borderRadius: slot.radius,
                  overflow: 'hidden',
                  background: '#ffffff',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
                  border: '4px solid #ffffff',
                  transform: `rotate(${slot.rotate}) scale(1)`,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'pointer',
                  zIndex: 5
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = `rotate(0deg) scale(1.18)`;
                  e.currentTarget.style.zIndex = '20';
                  e.currentTarget.style.boxShadow = '0 24px 50px rgba(0,200,83,0.25), 0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `rotate(${slot.rotate}) scale(1)`;
                  e.currentTarget.style.zIndex = '5';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)';
                }}
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  opacity: 0.85,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '10px'
                }}>
                  <span style={{ color: '#ffffff', fontSize: 10, fontWeight: 700, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {photo.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE GRID VIEW (Clean Responsive Alternative) */}
        <div className="orbital-mobile-wrapper" style={{ display: 'none', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {displayPhotos.map((photo, index) => (
            <div
              key={photo._id || index}
              onClick={() => openLightbox(index)}
              style={{
                height: 180,
                borderRadius: '24px 12px 24px 12px',
                overflow: 'hidden',
                position: 'relative',
                background: '#ffffff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                border: '3px solid #ffffff',
                cursor: 'pointer'
              }}
            >
              <img src={photo.image} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)', padding: 10, display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{photo.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {currentPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.92)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
          onClick={e => e.target === e.currentTarget && closeLightbox()}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={20} />
          </button>

          {/* Navigation Prev */}
          <button
            onClick={prevPhoto}
            style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Main Content Box */}
          <div style={{
            maxWidth: '800px',
            width: '100%',
            background: '#0d1527',
            borderRadius: '28px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ height: '420px', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={currentPhoto.image}
                alt={currentPhoto.title}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(0, 200, 83, 0.9)',
                color: '#000000',
                padding: '4px 14px',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                {currentPhoto.category}
              </div>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                {currentPhoto.title}
              </h3>
              {currentPhoto.caption && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6 }}>
                  {currentPhoto.caption}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Next */}
          <button
            onClick={nextPhoto}
            style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Responsive Styles Injection */}
      <style>{`
        @media (max-width: 768px) {
          .orbital-desktop-wrapper {
            display: none !important;
          }
          .orbital-mobile-wrapper {
            display: grid !important;
          }
        }
      `}</style>
    </section>
  );
}
