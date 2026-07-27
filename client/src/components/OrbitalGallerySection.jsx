import { useState, useEffect } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Maximize2 } from 'lucide-react';
import api from '../services/api';

const DEFAULT_PHOTOS = [
  {
    _id: '1',
    title: 'Grande Final de Bairro',
    caption: 'A festa do futebol comunitário na atribuição do troféu principal aos novos campeões.',
    image: '/banner1.png',
    category: 'Torneios',
  },
  {
    _id: '2',
    title: 'Mambinhas no CAN Sub-17',
    caption: 'Momento histórico da qualificação inédita ao Campeonato do Mundo Qatar 2026.',
    image: '/banner4mabinhas.jpg',
    category: 'Comunidade',
  },
  {
    _id: '3',
    title: 'Ação & Garra em Campo',
    caption: 'Talento, velocidade e determinação a cada lance disputado na nossa liga.',
    image: '/banner2.png',
    category: 'Jogos',
  },
  {
    _id: '4',
    title: 'Troféu Oficial Bola na Zona',
    caption: 'A máxima glória disputada com paixão em todas as zonas e bairros.',
    image: '/bolanazonalgo.png',
    category: 'Troféus',
  },
  {
    _id: '5',
    title: 'Comunidade & Atletas',
    caption: 'Jovens promessas do futebol preparadas para o próximo grande salto profissional.',
    image: '/vibe-avatar.png',
    category: 'Comunidade',
  },
  {
    _id: '6',
    title: 'Duelo nas Penalidades',
    caption: 'Frieza, técnica e máxima concentração no apuramento do vencedor.',
    image: '/banner1.png',
    category: 'Jogos',
  },
  {
    _id: '7',
    title: 'Cerimónia de Premiação',
    caption: 'Homenagem aos melhores marcadores, guarda-redes e equipas fair-play.',
    image: '/banner2.png',
    category: 'Troféus',
  },
  {
    _id: '8',
    title: 'Espírito Desportivo',
    caption: 'União, respeito e companheirismo entre todas as comitivas participantes.',
    image: '/banner4mabinhas.jpg',
    category: 'Torneios',
  }
];

// Tilt & position parameters for the original Mobile Orbital Layout
const ORBIT_SLOTS = [
  { rotate: '-6deg', radius: '36px 16px 36px 16px' },
  { rotate: '12deg', radius: '20px 36px 20px 36px' },
  { rotate: '-10deg', radius: '36px 20px 36px 20px' },
  { rotate: '8deg', radius: '20px 36px 20px 36px' },
  { rotate: '-14deg', radius: '36px 20px 36px 20px' },
  { rotate: '10deg', radius: '20px 36px 20px 36px' },
  { rotate: '-8deg', radius: '36px 20px 36px 20px' },
  { rotate: '14deg', radius: '20px 36px 20px 36px' },
];

export default function OrbitalGallerySection() {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    api.get('/gallery')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPhotos(res.data);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar galeria:', err);
      });
  }, []);

  const categories = ['Todas', 'Torneios', 'Jogos', 'Comunidade', 'Troféus'];

  const filteredPhotos = activeCategory === 'Todas'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  const spotlightPhoto = filteredPhotos[selectedPhotoIndex] || filteredPhotos[0] || DEFAULT_PHOTOS[0];

  const openLightbox = (index, e) => {
    if (e) e.stopPropagation();
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
  };

  const prevLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const lightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section style={{
      padding: '90px 0',
      background: '#f8fafc',
      color: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0'
    }}>
      {/* Background ambient pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.35,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            borderRadius: 100,
            padding: '6px 18px',
            marginBottom: 14
          }}>
            <Camera size={15} color="#00C853" />
            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, letterSpacing: 0.4 }}>
              Galeria da Comunidade
            </span>
          </div>

          <h2 className="font-syne scroll-reveal" style={{
            fontSize: 'clamp(26px, 4.5vw, 42px)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 12,
            lineHeight: 1.15
          }}>
            Momentos que Marcam a <span style={{
              background: 'linear-gradient(135deg, #00C853 0%, #008a38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Nossa História</span>
          </h2>

          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Explora os lances, comemorações e troféus registados pela nossa comunidade.
          </p>

          {/* Category Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSelectedPhotoIndex(0); }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 700,
                  border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                  background: activeCategory === cat ? '#0f172a' : '#ffffff',
                  color: activeCategory === cat ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === cat ? '0 6px 16px rgba(15,23,42,0.12)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 1. DESKTOP STUDIO LAYOUT (> 768px) */}
        <div className="gallery-desktop-view" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: 28,
          alignItems: 'start',
          maxWidth: '1240px',
          margin: '0 auto'
        }}>
          {/* LEFT SPOTLIGHT CARD */}
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: '84px',
            zIndex: 5
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '3/4',
              borderRadius: '22px',
              overflow: 'hidden',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0'
            }}>
              <img
                src={spotlightPhoto.image}
                alt={spotlightPhoto.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              />

              <div style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                color: '#00C853',
                fontSize: 11,
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: 100,
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                {spotlightPhoto.category}
              </div>

              <button
                onClick={(e) => openLightbox(selectedPhotoIndex, e)}
                title="Ver em ecrã inteiro"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Maximize2 size={16} />
              </button>
            </div>

            <div style={{ padding: '18px 8px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                  {spotlightPhoto.title}
                </h3>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <ArrowRight size={16} />
                </div>
              </div>
              {spotlightPhoto.caption && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
                  {spotlightPhoto.caption}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT CANVAS BOARD */}
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C853' }} />
                <span>Bola na Zona</span>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>Galeria Oficial</span>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{filteredPhotos.length} Momentos</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
              {filteredPhotos.map((photo, index) => {
                const isSelected = index === selectedPhotoIndex;
                return (
                  <div
                    key={photo._id || index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    style={{
                      position: 'relative',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      border: isSelected ? '3px solid #00C853' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 8px 24px rgba(0,200,83,0.2)' : '0 4px 12px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ width: '100%', height: 210, overflow: 'hidden', position: 'relative', background: '#000' }}>
                      <img src={photo.image} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <button
                          onClick={(e) => openLightbox(index, e)}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                        {photo.category}
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px', background: '#ffffff' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {photo.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. ORIGINAL MOBILE ORBITAL LAYOUT (<= 768px) */}
        <div className="gallery-mobile-view" style={{ display: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
            {filteredPhotos.map((photo, index) => {
              const slot = ORBIT_SLOTS[index % ORBIT_SLOTS.length];
              return (
                <div
                  key={photo._id || index}
                  onClick={() => openLightbox(index)}
                  style={{
                    height: 195,
                    borderRadius: slot.radius,
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#ffffff',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
                    border: '4px solid #ffffff',
                    transform: `rotate(${slot.rotate})`,
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <img src={photo.image} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                  }}>
                    <span style={{ color: 'var(--green)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
                      {photo.category}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 800, lineHeight: 1.25 }}>
                      {photo.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL (Universal) */}
      {lightboxPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.94)',
            backdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
          onClick={e => e.target === e.currentTarget && closeLightbox()}
        >
          <button
            onClick={closeLightbox}
            style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <X size={20} />
          </button>

          <button
            onClick={prevLightbox}
            style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <ChevronLeft size={24} />
          </button>

          <div style={{ maxWidth: '820px', width: '100%', background: '#0d1527', borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ height: '420px', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={lightboxPhoto.image} alt={lightboxPhoto.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0, 200, 83, 0.9)', color: '#000000', padding: '4px 14px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                {lightboxPhoto.category}
              </div>
            </div>
            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>{lightboxPhoto.title}</h3>
              {lightboxPhoto.caption && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6 }}>{lightboxPhoto.caption}</p>}
            </div>
          </div>

          <button
            onClick={nextLightbox}
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Media Queries toggle for Desktop vs Mobile */}
      <style>{`
        @media (max-width: 768px) {
          .gallery-desktop-view {
            display: none !important;
          }
          .gallery-mobile-view {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .gallery-desktop-view {
            display: grid !important;
          }
          .gallery-mobile-view {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
