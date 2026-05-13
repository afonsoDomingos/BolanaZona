import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, ArrowRight, User } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MySquads() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', neighborhood: '' });
  const [saving, setSaving] = useState(false);

  const fetchSquads = async () => {
    try {
      const res = await api.get('/squads/my-squads');
      setSquads(res.data);
    } catch {
      toast.error('Erro ao carregar as tuas equipas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('O nome é obrigatório.');
    setSaving(true);
    try {
      await api.post('/squads', formData);
      toast.success('Clube criado com sucesso! 🏆');
      setShowModal(false);
      setFormData({ name: '', neighborhood: '' });
      fetchSquads();
    } catch {
      toast.error('Erro ao criar clube.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Meus Clubes</h1>
            <p style={{ color: 'var(--text-secondary)' }}>A tua identidade no mundo do futebol.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '0 24px', height: 44 }}>
            <Plus size={18} /> Criar Clube
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : squads.length === 0 ? (
          <div className="empty-state card-glass">
            <Shield size={56} color="var(--green)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Ainda não tens um Clube</h3>
            <p style={{ maxWidth: 400, margin: '12px auto 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Cria o teu plantel principal uma única vez e inscreve-o facilmente em qualquer torneio no futuro com apenas um clique.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ height: 48, padding: '0 32px' }}>
              <Plus size={18} /> Criar o meu Clube
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {squads.map(squad => (
              <Link key={squad._id} to={`/dashboard/squads/${squad._id}`} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, transition: 'all 0.2s', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ 
                    width: 56, height: 56, borderRadius: 16, 
                    background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', border: `2px solid ${squad.color || 'var(--green)'}` 
                  }}>
                    {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : <Shield size={28} color={squad.color || 'var(--green)'} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>{squad.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                      {squad.neighborhood && <span>📍 {squad.neighborhood}</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> {squad.players?.length || 0} Jogadores</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="badge badge-green hide-mobile">Pronto a Jogar</span>
                  <ArrowRight color="var(--text-muted)" size={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card-glass animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Novo Clube</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Cria a tua lenda no Bola na Zona.</p>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="form-label">Nome da Equipa <span style={{color: 'var(--red)'}}>*</span></label>
                <input required className="form-input" placeholder="Ex: Galáticos FC" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Bairro / Comunidade (Opcional)</label>
                <input className="form-input" placeholder="Ex: Maxaquene" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, height: 48 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, height: 48 }}>
                  {saving ? <span className="spinner"/> : 'Criar Clube'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
