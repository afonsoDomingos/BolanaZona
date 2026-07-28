import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Camera, Link as LinkIcon, Trash2 } from 'lucide-react';
import compressImage from '../services/compressImage';

export default function PartnerEditModal({ partner, onClose, onSaved }) {
  const [form, setForm] = useState(
    partner || { name: '', url: '', logo: '', order: 0, active: true }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file, 800, 0.85);
      const formData = new FormData();
      formData.append('image', compressed);

      const res = await api.post('/upload', formData);
      setForm({ ...form, logo: res.data.url });
      toast.success('Logo carregado!');
    } catch {
      toast.error('Erro no upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        url: form.url.trim(),
      };
      if (partner?._id) {
        await api.put(`/partners/${partner._id}`, payload);
        toast.success('Parceiro atualizado!');
      } else {
        await api.post('/partners', payload);
        toast.success('Parceiro criado!');
      }
      onSaved();
    } catch {
      toast.error('Erro ao guardar parceiro.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Eliminar este parceiro permanentemente?')) return;
    setLoading(true);
    try {
      await api.delete(`/partners/${partner._id}`);
      toast.success('Parceiro eliminado.');
      onSaved();
    } catch {
      toast.error('Erro ao eliminar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">{partner ? 'Editar Parceiro' : 'Novo Parceiro'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: INSCREVA'SE"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Link (URL)</label>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="url"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="https://exemplo.com"
                required
              />
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Ordem</label>
              <input
                type="number"
                className="form-input"
                value={form.order}
                onChange={e => setForm({ ...form, order: e.target.value })}
                min={0}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Visível na home</label>
              <select
                className="form-select"
                value={form.active ? 'true' : 'false'}
                onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Logo (Upload ou Link)</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <label className="btn btn-secondary btn-sm" style={{ flex: 1, cursor: 'pointer', justifyContent: 'center' }}>
                {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Camera size={14} /> Fazer Upload</>}
                <input type="file" hidden onChange={handleUpload} accept="image/*" />
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Ou cola o link do logo aqui..."
                value={form.logo}
                onChange={e => setForm({ ...form, logo: e.target.value })}
              />
            </div>
            {form.logo ? (
              <div className="partner-logo-card" style={{ marginTop: 12, height: 72 }}>
                <img src={form.logo} alt="Preview" className="partner-logo-img" />
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Sem logo, o nome do parceiro aparece na home.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Guardar</>}
            </button>
            {partner && (
              <button type="button" className="btn btn-secondary" onClick={handleDelete} disabled={loading} style={{ color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)' }}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
