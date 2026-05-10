import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';

export default function SponsorProposalModal({ tournament, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', contact: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Preenche os campos obrigatórios.');

    setLoading(true);
    try {
      await api.post(`/tournaments/${tournament._id}/sponsor-proposals`, form);
      toast.success('Proposta enviada! O organizador entrará em contacto em breve. 🤝', { duration: 6000 });
      onClose();
    } catch (err) {
      toast.error('Erro ao enviar proposta. Tenta novamente.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Apoiar Torneio 🤝</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tournament.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Envia a tua proposta de patrocínio ou apoio. O organizador será notificado imediatamente.
          </p>

          <div className="form-group">
            <label className="form-label"><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Nome / Empresa *</label>
            <input className="form-input" placeholder="Ex: Coca-Cola Angola" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label"><Mail size={14} style={{ display: 'inline', marginRight: 4 }} /> Email *</label>
              <input type="email" className="form-input" placeholder="contato@empresa.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Contacto</label>
              <input className="form-input" placeholder="9xx xxx xxx" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><MessageSquare size={14} style={{ display: 'inline', marginRight: 4 }} /> Proposta / Mensagem *</label>
            <textarea className="form-input" placeholder="Como pretendes apoiar este torneio?" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required style={{ resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 8 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Send size={18} /> Enviar Proposta</>}
          </button>
        </form>
      </div>
    </div>
  );
}
