import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Camera, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function ProductEditModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product || { name: '', price: 0, category: 'camisolas', description: '', image: '' });
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
      setForm({ ...form, image: res.data.url });
      toast.success('Imagem carregada!');
    } catch { toast.error('Erro no upload.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?._id) {
        await api.put(`/products/${product._id}`, form);
        toast.success('Produto atualizado!');
      } else {
        await api.post('/products', form);
        toast.success('Produto criado!');
      }
      onSaved();
    } catch { toast.error('Erro ao guardar produto.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Eliminar este produto permanentemente?')) return;
    setLoading(true);
    try {
      await api.delete(`/products/${product._id}`);
      toast.success('Produto eliminado.');
      onSaved();
    } catch { toast.error('Erro ao eliminar.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nome do Produto</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Preço (MT)</label>
              <input type="number" className="form-input" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="camisolas">Camisolas</option>
                <option value="personalizados">Personalizados</option>
                <option value="chuteiras">Chuteiras</option>
                <option value="meias">Meias</option>
                <option value="trofeus">Troféus</option>
                <option value="bolas">Bolas</option>
                <option value="treino">Equip. Treino</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Imagem (Upload ou Link)</label>
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
                placeholder="Ou cola o link da imagem aqui..." 
                value={form.image} 
                onChange={e => setForm({...form, image: e.target.value})} 
              />
            </div>
            {form.image && (
              <div style={{ marginTop: 12, width: '100%', height: 150, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Guardar Alterações</>}
            </button>
            {product && (
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
