import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Camera, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function ProductEditModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const base = product || { name: '', price: 0, category: 'camisolas', description: '', image: '' };
    return {
      ...base,
      images: base.images || []
    };
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

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

  const handleAdditionalUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAdditional(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData);
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), res.data.url]
      }));
      toast.success('Imagem adicional adicionada!');
    } catch { toast.error('Erro no upload.'); }
    finally { setUploadingAdditional(false); }
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
      <div className="modal" style={{ 
        maxWidth: 500,
        background: '#0a0f14', 
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        padding: '24px',
        borderRadius: '16px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Sticky Header */}
        <div className="modal-header" style={{ marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
          <h2 className="modal-title" style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button className="modal-close" onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 6, margin: '4px 0 16px' }} className="custom-modal-scrollbar">
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Nome do Produto</label>
              <input 
                className="form-input" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>

            <div className="form-grid form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Preço (MT)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}
                  value={form.price} 
                  onChange={e => setForm({...form, price: Number(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Categoria</label>
                <select 
                  className="form-select" 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 13, height: '40px', outline: 'none' }}
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="camisolas" style={{ background: '#0a0f14', color: '#fff' }}>Camisolas</option>
                  <option value="personalizados" style={{ background: '#0a0f14', color: '#fff' }}>Personalizados</option>
                  <option value="chuteiras" style={{ background: '#0a0f14', color: '#fff' }}>Chuteiras</option>
                  <option value="meias" style={{ background: '#0a0f14', color: '#fff' }}>Meias</option>
                  <option value="trofeus" style={{ background: '#0a0f14', color: '#fff' }}>Troféus</option>
                  <option value="bolas" style={{ background: '#0a0f14', color: '#fff' }}>Bolas</option>
                  <option value="treino" style={{ background: '#0a0f14', color: '#fff' }}>Equip. Treino</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Descrição</label>
              <textarea 
                className="form-input" 
                rows={2} 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 13, resize: 'none' }}
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
              />
            </div>

            <div className="form-group" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
              <label className="form-label" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Imagem Principal (Upload ou Link)</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <label className="btn btn-secondary btn-sm" style={{ flex: 1, cursor: 'pointer', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, padding: '8px 12px', borderRadius: 8 }}>
                  {uploading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <><Camera size={12} /> Fazer Upload</>}
                  <input type="file" hidden onChange={handleUpload} accept="image/*" />
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <LinkIcon size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 34, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, paddingY: 10, fontSize: 12 }} 
                  placeholder="Ou cola o link da imagem aqui..." 
                  value={form.image} 
                  onChange={e => setForm({...form, image: e.target.value})} 
                />
              </div>
              {form.image && (
                <div style={{ marginTop: 10, width: '100%', height: 110, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="form-group" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
              <label className="form-label" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Imagens Adicionais (Upload ou Links)</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                {(form.images || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 56, height: 56, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.images.filter((_, i) => i !== idx);
                        setForm({ ...form, images: updated });
                      }}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(255, 68, 68, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                
                <label className="btn btn-secondary" style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 8, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  padding: 0,
                  border: '1px dashed rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 9,
                  flexShrink: 0
                }}>
                  {uploadingAdditional ? (
                    <span className="spinner" style={{ width: 12, height: 12 }} />
                  ) : (
                    <>
                      <Camera size={14} style={{ marginBottom: 2 }} />
                      <span>+ Imagem</span>
                    </>
                  )}
                  <input type="file" hidden onChange={handleAdditionalUpload} accept="image/*" />
                </label>
              </div>
              
              <div style={{ position: 'relative' }}>
                <LinkIcon size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 34, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, paddingY: 10, fontSize: 12 }} 
                  placeholder="Ou cola o link de imagem adicional e prime Enter..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        setForm(prev => ({
                          ...prev,
                          images: [...(prev.images || []), val]
                        }));
                        e.target.value = '';
                        toast.success('Imagem adicional adicionada!');
                      }
                    }
                  }}
                />
              </div>
            </div>

          </div>

          {/* Sticky Footer */}
          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', borderRadius: 8, height: 40, fontSize: 13 }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Save size={16} /> Guardar Alterações</>}
            </button>
            {product && (
              <button type="button" className="btn btn-secondary" onClick={handleDelete} disabled={loading} style={{ color: 'var(--red)', borderColor: 'rgba(255,68,68,0.25)', borderRadius: 8, width: 40, height: 40, padding: 0, justifyContent: 'center' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </form>

        {/* Custom scrollbar style */}
        <style>{`
          .custom-modal-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-modal-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-modal-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
          }
          .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>

      </div>
    </div>
  );
}
