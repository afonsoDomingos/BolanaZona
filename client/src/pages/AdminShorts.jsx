import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Plus, Edit, Trash2, ArrowUp, ArrowDown, ArrowLeft, Save, Play } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DEFAULT_SHORTS = [
  { id: 'ISre7YeuMIg', title: 'QUEM VENCE ESSAS SEMIFINAIS? Inglaterra Vs Argentina' },
  { id: 'HtoUaLcAPTc', title: 'QUEM VENCE ESSAS SEMIFINAIS? Espanha Vs Franca' },
  { id: 'L89dhZnJ0H0', title: 'Chi conquisterà la Coppa del Mondo 2026? Mbappé o Yamal?' },
  { id: 'ptNBfKfWvSE', title: 'QUEM VENCE ESSE JOGO ? Argentina VS Suiça' },
  { id: 'zR5uhBrJxVU', title: 'QUEM VENCE ESSE JOGO ? INGLATERA VS NORUEGA' },
  { id: 'LobN4wGuhvk', title: 'QUEM VENCE ESSE JOGO ?  ESPANHA VS BELGICA' }
];

const extractYouTubeId = (urlOrId) => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (!trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  const shortsRegex = /\/shorts\/([a-zA-Z0-9_-]{11})/;
  const shortsMatch = trimmed.match(shortsRegex);
  if (shortsMatch) return shortsMatch[1];

  const youtubeBeRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const youtubBeMatch = trimmed.match(youtubeBeRegex);
  if (youtubBeMatch) return youtubBeMatch[1];

  const watchRegex = /[?&]v=([a-zA-Z0-9_-]{11})/;
  const watchMatch = trimmed.match(watchRegex);
  if (watchMatch) return watchMatch[1];

  const generalRegex = /([a-zA-Z0-9_-]{11})/;
  const generalMatch = trimmed.match(generalRegex);
  if (generalMatch) return generalMatch[1];

  return trimmed;
};

export default function AdminShorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/settings/youtube_shorts')
      .then(res => {
        if (res.data && Array.isArray(res.data.value)) {
          setShorts(res.data.value);
        } else {
          setShorts(DEFAULT_SHORTS);
        }
      })
      .catch(err => {
        // Se ainda não existir na BD, usamos a lista por defeito
        if (err.response?.status === 404) {
          setShorts(DEFAULT_SHORTS);
        } else {
          toast.error('Erro ao carregar os Shorts do servidor.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openAddModal = () => {
    setEditingIndex(null);
    setTitleInput('');
    setUrlInput('');
    setShowModal(true);
  };

  const openEditModal = (index) => {
    const item = shorts[index];
    setEditingIndex(index);
    setTitleInput(item.title);
    setUrlInput(item.id ? `https://www.youtube.com/shorts/${item.id}` : '');
    setShowModal(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const videoId = extractYouTubeId(urlInput);

    if (!videoId || videoId.length !== 11) {
      toast.error('ID do vídeo inválido. Deve ter exatamente 11 caracteres.');
      return;
    }

    if (!titleInput.trim()) {
      toast.error('O título do Short é obrigatório.');
      return;
    }

    const updated = [...shorts];
    const newItem = { id: videoId, title: titleInput.trim() };

    if (editingIndex !== null) {
      updated[editingIndex] = newItem;
      toast.success('Short editado localmente.');
    } else {
      updated.push(newItem);
      toast.success('Short adicionado localmente.');
    }

    setShorts(updated);
    setShowModal(false);
  };

  const handleDelete = (index) => {
    if (!window.confirm('Tens a certeza que desejas remover este Short?')) return;
    const updated = shorts.filter((_, i) => i !== index);
    setShorts(updated);
    toast.success('Short removido localmente.');
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...shorts];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setShorts(updated);
  };

  const moveDown = (index) => {
    if (index === shorts.length - 1) return;
    const updated = [...shorts];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setShorts(updated);
  };

  const saveToBackend = async () => {
    setSaving(true);
    try {
      await api.put('/settings/youtube_shorts', { value: shorts });
      toast.success('Alterações guardadas e publicadas com sucesso! 🚀');
    } catch (err) {
      toast.error('Erro ao guardar as alterações no servidor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
              <ArrowLeft size={14} /> Voltar
            </Link>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              Configurar YouTube Shorts <Youtube size={32} color="#ff0000" />
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Gere os Shorts e Reels do YouTube que aparecem em destaque na página inicial da plataforma.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={openAddModal}>
              <Plus size={16} /> Adicionar Short
            </button>
            <button type="button" className="btn btn-primary" onClick={saveToBackend} disabled={saving || loading}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Save size={16} /> Guardar na Nuvem</>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : shorts.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon"><Youtube size={32} /></div>
            <h3>Nenhum Short configurado</h3>
            <p>Adiciona um short clicando no botão no topo direito.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shorts.map((item, index) => (
              <div key={index} className="card" style={{ 
                padding: 16, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  {/* Thumb / Video Preview Box */}
                  <div style={{ 
                    width: 70, 
                    height: 90, 
                    borderRadius: 8, 
                    background: '#000', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    position: 'relative',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <img 
                      src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ 
                      position: 'absolute', 
                      background: 'rgba(0,0,0,0.5)', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Play size={10} color="#fff" />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#fff' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>ID: {item.id}</span>
                      <a 
                        href={`https://www.youtube.com/shorts/${item.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'underline' }}
                      >
                        Ver no YouTube
                      </a>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Ordenação */}
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: 8 }} 
                    disabled={index === 0} 
                    onClick={() => moveUp(index)}
                    title="Mover para Cima"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: 8 }} 
                    disabled={index === shorts.length - 1} 
                    onClick={() => moveDown(index)}
                    title="Mover para Baixo"
                  >
                    <ArrowDown size={14} />
                  </button>
                  
                  {/* Editar / Excluir */}
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }} 
                    onClick={() => openEditModal(index)}
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: 8, color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)' }} 
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Adicionar / Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-slide-up" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingIndex !== null ? 'Editar Short' : 'Adicionar Novo Short'}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Título do Vídeo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={titleInput} 
                  onChange={e => setTitleInput(e.target.value)} 
                  placeholder="Ex: QUEM VENCE ESSA SEMIFINAL?"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link ou ID do YouTube</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={urlInput} 
                  onChange={e => setUrlInput(e.target.value)} 
                  placeholder="Ex: https://www.youtube.com/shorts/ISre7YeuMIg ou ISre7YeuMIg"
                  required 
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Podes colar o link completo do YouTube Shorts ou apenas o ID de 11 caracteres.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Guardar
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
