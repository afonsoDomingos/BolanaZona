import { useState, useEffect } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Download, Maximize2, Filter } from 'lucide-react';
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

export default function OrbitalGallerySection() {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
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

  const spotlightPhoto = filteredPhotos[selectedPhotoIndex] || filteredPhotos[0] || DEFAULT_PHOTOS[0];

  const handleCardClick = (index) => {
    setSelectedPhotoIndex(index);
  };

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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
            Momentos em <span style={{
              background: 'linear-gradient(135deg, #00C853 0%, #008a38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Destaque</span>
          </h2>

          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Selecione qualquer fotografia no estúdio para colocar em foco ou expandir em alta resolução.
          </p>
        </div>

        {/* MAIN STUDIO LAYOUT GRID (Inspired by Reference Image) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: 28,
          alignItems: 'start',
          maxWidth: '1240px',
          margin: '0 auto'
        }} className="studio-layout-grid">

          {/* LEFT COLUMN: HERO SPOTLIGHT CARD */}
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
            {/* Spotlight Image Container */}
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
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
              />

              {/* Category Badge */}
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
                letterSpacing: 0.5,
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                {spotlightPhoto.category}
              </div>

              {/* Expand Lightbox Button */}
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
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Spotlight Info */}
            <div style={{ padding: '18px 8px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                  {spotlightPhoto.title}
                </h3>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  flexShrink: 0
                }}>
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

          {/* RIGHT COLUMN: STUDIO CANVAS BOARD */}
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
            {/* Board Header Bar (Inspired by "Dashboard / 4MLA Project") */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 16,
              borderBottom: '1px solid #f1f5f9',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C853' }} />
                <span>Bola na Zona</span>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>Galeria Oficial</span>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedPhotoIndex(0); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 700,
                      border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                      background: activeCategory === cat ? '#0f172a' : '#f8fafc',
                      color: activeCategory === cat ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid (Studio Cards) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: 16
            }}>
              {filteredPhotos.map((photo, index) => {
                const isSelected = index === selectedPhotoIndex;
                return (
                  <div
                    key={photo._id || index}
                    onClick={() => handleCardClick(index)}
                    style={{
                      position: 'relative',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      border: isSelected ? '3px solid #00C853' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 8px 24px rgba(0,200,83,0.2)' : '0 4px 12px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                      }
                    }}
                  >
                    {/* Card Image Wrapper */}
                    <div style={{ width: '100%', height: 210, overflow: 'hidden', position: 'relative', background: '#000' }}>
                      <img
                        src={photo.image}
                        alt={photo.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />

                      {/* Top Action Icons (Inspired by trash/download circle buttons in reference) */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 6
                      }}>
                        <button
                          onClick={(e) => openLightbox(index, e)}
                          title="Expandir foto"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} />
                        </button>
                      </div>

                      {/* Bottom Category Pill inside image */}
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {photo.category}
                      </div>
                    </div>

                    {/* Card Footer Title */}
                    <div style={{ padding: '10px 12px', background: '#ffffff' }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {photo.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
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
            onClick={prevLightbox}
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

          {/* Content Box */}
          <div style={{
            maxWidth: '820px',
            width: '100%',
            background: '#0d1527',
            borderRadius: '28px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ height: '440px', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={lightboxPhoto.image}
                alt={lightboxPhoto.title}
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
                {lightboxPhoto.category}
              </div>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                {lightboxPhoto.title}
              </h3>
              {lightboxPhoto.caption && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6 }}>
                  {lightboxPhoto.caption}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Next */}
          <button
            onClick={nextLightbox}
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
        @media (max-width: 900px) {
          .studio-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .studio-layout-grid > div:first-child {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
