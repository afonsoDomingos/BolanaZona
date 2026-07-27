import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Camera, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function GalleryEditModal({ photo, onClose, onSaved }) {
  const [form, setForm] = useState(
    photo || { title: '', caption: '', image: '', category: 'Torneios', order: 0, active: true }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData);
      setForm(prev => ({ ...prev, image: res.data.url }));
      toast.success('Fotografia carregada com sucesso!');
    } catch {
      toast.error('Erro ao efetuar upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      return toast.error('Por favor, adicione uma fotografia ou cole o link da imagem.');
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        title: form.title.trim(),
        caption: form.caption.trim(),
      };
      if (photo?._id) {
        await api.put(`/gallery/${photo._id}`, payload);
        toast.success('Fotografia atualizada!');
      } else {
        await api.post('/gallery', payload);
        toast.success('Fotografia adicionada à galeria!');
      }
      onSaved();
    } catch {
      toast.error('Erro ao guardar fotografia.');
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
      <div className="modal" style={{ maxWidth: 520, borderRadius: 24 }}>
        <div className="modal-header" style={{ paddingBottom: 16 }}>
          <h2 className="modal-title font-syne" style={{ fontSize: 20, fontWeight: 800 }}>
            {photo ? 'Editar Foto da Galeria' : 'Nova Foto na Galeria'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Título da Fotografia</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Grande Final de Bairro"
              required
            />
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
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
              <label className="form-label">Visível na Home</label>
              <select
                className="form-select"
                value={form.active ? 'true' : 'false'}
                onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
              >
                <option value="true">Sim (Ativa)</option>
                <option value="false">Não (Oculta)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição / Legenda</label>
            <textarea
              className="form-input"
              style={{ minHeight: 70, resize: 'vertical' }}
              value={form.caption}
              onChange={e => setForm({ ...form, caption: e.target.value })}
              placeholder="Ex: A festa do futebol comunitário na atribuição do troféu..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Imagem (Upload ou URL)</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <label className="btn btn-secondary btn-sm" style={{ flex: 1, cursor: 'pointer', justifyContent: 'center' }}>
                {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Camera size={14} /> Fazer Upload Foto</>}
                <input type="file" hidden onChange={handleUpload} accept="image/*" />
              </label>
            </div>

            <div style={{ position: 'relative' }}>
              <LinkIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Ou cole o link direto da imagem..."
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
              />
            </div>

            {form.image ? (
              <div style={{ marginTop: 12, height: 140, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : null}
          </div>

          <div className="form-group">
            <label className="form-label">Ordem de Exibição</label>
            <input
              type="number"
              className="form-input"
              value={form.order}
              onChange={e => setForm({ ...form, order: e.target.value })}
              min={0}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading} style={{ flex: 1, justifyContent: 'center', borderRadius: 14 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Guardar Foto</>}
            </button>
            {photo && (
              <button type="button" className="btn btn-secondary" onClick={handleDelete} disabled={loading} style={{ color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)', borderRadius: 14 }}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
