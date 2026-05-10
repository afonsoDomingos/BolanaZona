import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Send, User, Phone } from 'lucide-react';

export default function LeadCaptureModal({ product, onClose, onCaptured }) {
  const [form, setForm] = useState({ name: '', contact: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contact) return toast.error('Preenche todos os campos.');

    setLoading(true);
    try {
      await api.post('/leads', {
        productId: product._id,
        name: form.name,
        contact: form.contact
      });
      
      // Registar clique no analytics também
      await api.post('/analytics/track', {
        type: 'purchase_attempt',
        page: '/shop',
        targetId: product._id,
        targetName: product.name
      }).catch(() => {});

      toast.success('Interesse registado! Redirecionando para o WhatsApp...');
      
      // Chamar callback para abrir o WhatsApp
      onCaptured(form);
    } catch {
      toast.error('Erro ao registar interesse.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Tenho Interesse! 🛍️</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Deixa os teus dados para que possamos oficializar a tua encomenda.
          </p>

          <div className="form-group">
            <label className="form-label"><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Nome Completo</label>
            <input className="form-input" placeholder="Ex: Afonso Domingos" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Contacto (WhatsApp ou Telemóvel)</label>
            <input className="form-input" placeholder="Ex: 9xx xxx xxx" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 8 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Send size={18} /> Continuar para WhatsApp</>}
          </button>
        </form>
      </div>
    </div>
  );
}
