import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Send, User, Phone } from 'lucide-react';

export default function LeadCaptureModal({ product, onClose, onCaptured }) {
  const [form, setForm] = useState({ name: '', contact: '', size: '', color: '', province: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contact) return toast.error('Preenche pelo menos o Nome e Contacto.');

    setLoading(true);
    try {
      await api.post('/leads', {
        productId: product._id,
        name: form.name,
        contact: form.contact,
        size: form.size,
        color: form.color,
        province: form.province
      });
      
      await api.post('/analytics/track', {
        type: 'purchase_attempt',
        page: window.location.pathname,
        targetId: product._id,
        targetName: product.name
      }).catch(() => {});

      toast.success('Dados registados! Redirecionando...');
      onCaptured(form);
    } catch {
      toast.error('Erro ao registar interesse.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Tenho Interesse! 🛍️</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Deixa os teus dados para oficializarmos a tua encomenda.
          </p>

          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input className="form-input" placeholder="Ex: Afonso Domingos" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label">Contacto (WhatsApp)</label>
            <input className="form-input" placeholder="+258 8x xxx xxxx" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tamanho</label>
              <input className="form-input" placeholder="Ex: M, 42, etc." value={form.size} onChange={e => setForm({...form, size: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <input className="form-input" placeholder="Ex: Vermelho" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Província</label>
            <select className="form-select" value={form.province} onChange={e => setForm({...form, province: e.target.value})}>
              <option value="">Selecionar Província</option>
              <option value="Maputo Cidade">Maputo Cidade</option>
              <option value="Maputo Província">Maputo Província</option>
              <option value="Gaza">Gaza</option>
              <option value="Inhambane">Inhambane</option>
              <option value="Manica">Manica</option>
              <option value="Sofala">Sofala</option>
              <option value="Tete">Tete</option>
              <option value="Zambézia">Zambézia</option>
              <option value="Nampula">Nampula</option>
              <option value="Niassa">Niassa</option>
              <option value="Cabo Delgado">Cabo Delgado</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 8 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Send size={18} /> Continuar para WhatsApp</>}
          </button>
        </form>
      </div>
    </div>
  );
}
