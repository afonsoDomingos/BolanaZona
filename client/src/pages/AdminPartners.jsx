import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Handshake, Plus, Edit, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PartnerEditModal from '../components/PartnerEditModal';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPartner, setEditPartner] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadPartners = () => {
    setLoading(true);
    api.get('/partners/manage')
      .then(res => setPartners(res.data))
      .catch(() => toast.error('Erro ao carregar parceiros.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleSaved = () => {
    setEditPartner(null);
    setShowCreate(false);
    loadPartners();
  };

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
              <ArrowLeft size={14} /> Voltar
            </Link>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              Nossos Parceiros 🤝
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Gere os logos e links que aparecem na página inicial.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Novo Parceiro
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : partners.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon"><Handshake size={32} /></div>
            <h3>Sem parceiros</h3>
            <p>Adiciona o primeiro parceiro para aparecer na home.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {partners.map(partner => (
              <div key={partner._id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="partner-logo-card" style={{ height: 80, background: '#f5f5f7' }}>
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} className="partner-logo-img" />
                  ) : (
                    <span className="partner-logo-fallback" style={{ color: '#1a1a1a' }}>{partner.name}</span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{partner.name}</h3>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4, wordBreak: 'break-all' }}
                  >
                    {partner.url} <ExternalLink size={12} />
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                  <span className={`badge ${partner.active ? 'badge-green' : 'badge-blue'}`}>
                    {partner.active ? 'Visível' : 'Oculto'}
                  </span>
                  <span className="badge badge-blue">Ordem {partner.order}</span>
                </div>

                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditPartner(partner)} style={{ marginTop: 'auto' }}>
                  <Edit size={14} /> Editar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(editPartner || showCreate) && (
        <PartnerEditModal
          partner={editPartner}
          onClose={() => { setEditPartner(null); setShowCreate(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
