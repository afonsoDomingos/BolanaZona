import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Camera, Plus, Edit, ArrowLeft, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import GalleryEditModal from '../components/GalleryEditModal';

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPhoto, setEditPhoto] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');

  const loadPhotos = () => {
    setLoading(true);
    api.get('/gallery/manage')
      .then(res => setPhotos(res.data))
      .catch(() => toast.error('Erro ao carregar fotografias da galeria.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleSaved = () => {
    setEditPhoto(null);
    setShowCreate(false);
    loadPhotos();
  };

  const categories = ['Todas', 'Torneios', 'Jogos', 'Comunidade', 'Troféus'];

  const filteredPhotos = activeCategory === 'Todas'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 60 }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
              <ArrowLeft size={14} /> Voltar ao Dashboard
            </Link>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              Galeria de Fotos da Plataforma 📸
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Adicione e gira as fotografias oficiais que alimentam a galeria orbital na página inicial.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ borderRadius: 14 }}>
            <Plus size={16} /> Nova Fotografia
          </button>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="btn btn-sm"
              style={{
                borderRadius: 100,
                background: activeCategory === cat ? 'var(--green)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? '#000' : '#fff',
                borderColor: activeCategory === cat ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                fontWeight: activeCategory === cat ? 800 : 500,
                padding: '8px 18px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filteredPhotos.length === 0 ? (
          <div className="empty-state card" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 24 }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 16px' }}><ImageIcon size={48} strokeWidth={1.5} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '16px 0 8px' }}>Sem fotografias nesta categoria</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Adicione fotografias da comunidade, jogos e torneios para exibir na galeria interativa da Home.
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} style={{ margin: '0 auto', borderRadius: 12 }}>
              <Plus size={16} /> Adicionar Primeira Foto
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredPhotos.map(photo => (
              <div
                key={photo._id}
                className="card"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15, 23, 36, 0.6)'
                }}
              >
                {/* Photo Preview */}
                <div style={{ height: 180, borderRadius: 14, overflow: 'hidden', position: 'relative', background: '#070a0f' }}>
                  <img src={photo.image} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'var(--green)', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
                    {photo.category}
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10, background: photo.active ? 'rgba(0,200,83,0.9)' : 'rgba(255,68,68,0.9)', color: '#000', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {photo.active ? <Eye size={12} /> : <EyeOff size={12} />}
                    {photo.active ? 'Visível' : 'Oculta'}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                    {photo.title}
                  </h3>
                  {photo.caption ? (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {photo.caption}
                    </p>
                  ) : null}
                </div>

                {/* Footer info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ordem: {photo.order}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditPhoto(photo)}
                    style={{ borderRadius: 10, fontSize: 12 }}
                  >
                    <Edit size={13} /> Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(editPhoto || showCreate) && (
        <GalleryEditModal
          photo={editPhoto}
          onClose={() => { setEditPhoto(null); setShowCreate(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
