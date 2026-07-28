import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Camera, Link as LinkIcon, Trash2, CheckCircle2 } from 'lucide-react';

// Helper para comprimir imagens automaticamente no browser antes do envio
function compressImage(file, maxWidth = 1600, maxHeight = 1600, quality = 0.78) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export default function GalleryEditModal({ photo, onClose, onSaved }) {
  const [form, setForm] = useState(
    photo || { title: '', caption: '', image: '', category: 'Torneios', order: 0, active: true }
  );
  const [imagesList, setImagesList] = useState(photo?.image ? [photo.image] : []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState('');

  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setCompressionInfo('A optimizar e comprimir fotografias...');

    const uploadedUrls = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalOriginalSize += file.size;

        const compressedFile = await compressImage(file);
        totalCompressedSize += compressedFile.size;

        const formData = new FormData();
        formData.append('image', compressedFile);

        const res = await api.post('/upload', formData);
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      const origMB = (totalOriginalSize / (1024 * 1024)).toFixed(1);
      const compMB = (totalCompressedSize / (1024 * 1024)).toFixed(1);

      setImagesList(prev => [...prev, ...uploadedUrls]);
      if (uploadedUrls.length > 0 && !form.image) {
        setForm(prev => ({ ...prev, image: uploadedUrls[0] }));
      }

      toast.success(
        files.length === 1
          ? `Foto optimizada e carregada! (${origMB}MB → ${compMB}MB)`
          : `${uploadedUrls.length} Fotos optimizadas e carregadas! (${origMB}MB → ${compMB}MB)`
      );
      setCompressionInfo(`Optimizado: ${origMB}MB ➔ ${compMB}MB (super leve)`);
    } catch {
      toast.error('Erro ao efetuar upload das fotografias.');
    } finally {
      setUploading(false);
    }
  };

  const removeImageFromList = (indexToRemove) => {
    const updated = imagesList.filter((_, idx) => idx !== indexToRemove);
    setImagesList(updated);
    if (form.image === imagesList[indexToRemove]) {
      setForm(prev => ({ ...prev, image: updated[0] || '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalImages = imagesList.length > 0 ? imagesList : (form.image ? [form.image] : []);

    if (finalImages.length === 0) {
      return toast.error('Por favor, adicione pelo menos uma fotografia.');
    }

    setLoading(true);
    try {
      if (photo?._id) {
        const payload = {
          ...form,
          image: finalImages[0],
          order: Number(form.order) || 0,
          title: form.title.trim() || 'Fotografia da Comunidade',
          caption: form.caption.trim(),
        };
        await api.put(`/gallery/${photo._id}`, payload);
        toast.success('Fotografia atualizada!');
      } else {
        for (let i = 0; i < finalImages.length; i++) {
          const imgUrl = finalImages[i];
          const autoTitle = finalImages.length > 1 && i > 0
            ? `${form.title.trim() || 'Fotografia'} (${i + 1})`
            : (form.title.trim() || 'Fotografia da Comunidade');

          await api.post('/gallery', {
            ...form,
            image: imgUrl,
            title: autoTitle,
            caption: form.caption.trim(),
            order: (Number(form.order) || 0) + i
          });
        }
        toast.success(
          finalImages.length === 1
            ? 'Fotografia adicionada à galeria!'
            : `${finalImages.length} Fotografias adicionadas à galeria com sucesso!`
        );
      }
      onSaved();
    } catch {
      toast.error('Erro ao guardar fotografia(s).');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Eliminar esta fotografia permanentemente da galeria?')) return;
    setLoading(true);
    try {
      await api.delete(`/gallery/${photo._id}`);
      toast.success('Fotografia eliminada.');
      onSaved();
    } catch {
      toast.error('Erro ao eliminar fotografia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="modal animate-fade-in"
        style={{
          maxWidth: 540,
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          padding: 24
        }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
          <div>
            <h2 className="modal-title font-syne" style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {photo ? 'Editar Foto da Galeria' : 'Nova Foto na Galeria'}
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Upload de múltiplas fotos com compressão e optimização automática
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} style={{ color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div className="form-group">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
              Título da Fotografia
            </label>
            <input
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 600
              }}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Comunidade Bola na Zona"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                Categoria
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 600
                }}
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="Torneios">Torneios</option>
                <option value="Jogos">Jogos</option>
                <option value="Comunidade">Comunidade</option>
                <option value="Troféus">Troféus</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                Visível na Home
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 600
                }}
                value={form.active ? 'true' : 'false'}
                onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
              >
                <option value="true">Sim (Ativa)</option>
                <option value="false">Não (Oculta)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
              Descrição / Legenda
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 600,
                minHeight: 70,
                resize: 'vertical'
              }}
              value={form.caption}
              onChange={e => setForm({ ...form, caption: e.target.value })}
              placeholder="Ex: Jovens talentos prontos para dar o salto..."
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
              Fotografias (Upload Múltiplo ou Link Directo)
            </label>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <label
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #00C853 0%, #00a843 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 13,
                  padding: '11px 16px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(0,200,83,0.25)'
                }}
              >
                {uploading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Camera size={16} /> Fazer Upload (Múltiplas Fotos)</>}
                <input type="file" hidden multiple onChange={handleMultipleUpload} accept="image/*" />
              </label>
            </div>

            {compressionInfo && (
              <div style={{ fontSize: 11, color: '#008a38', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> {compressionInfo}
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <LinkIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 600
                }}
                placeholder="Ou cole o link direto da imagem..."
                value={form.image}
                onChange={e => {
                  setForm({ ...form, image: e.target.value });
                  if (e.target.value && !imagesList.includes(e.target.value)) {
                    setImagesList(prev => [...prev, e.target.value]);
                  }
                }}
              />
            </div>

            {imagesList.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                  Fotografias Carregadas ({imagesList.length}):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, maxHeight: 180, overflowY: 'auto', padding: 4 }}>
                  {imagesList.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', height: 80, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                      <img src={imgUrl} alt={`Uploaded ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImageFromList(idx)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(255, 68, 68, 0.85)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 22,
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
              Ordem de Exibição
            </label>
            <input
              type="number"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 600
              }}
              value={form.order}
              onChange={e => setForm({ ...form, order: e.target.value })}
              min={0}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading || uploading}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00C853 0%, #00a843 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 20px rgba(0,200,83,0.25)'
              }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> {imagesList.length > 1 ? `Guardar ${imagesList.length} Fotografias` : 'Guardar Fotografia'}</>}
            </button>
            {photo && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: 'rgba(255,68,68,0.1)',
                  color: '#ff1744',
                  border: '1px solid rgba(255,68,68,0.3)',
                  borderRadius: 12,
                  padding: '0 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
