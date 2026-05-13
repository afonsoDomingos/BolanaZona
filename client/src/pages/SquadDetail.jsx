import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Save, Trash2, Plus, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '' });

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayer.name) return;
    setSquad({ ...squad, players: [...(squad.players || []), newPlayer] });
    setNewPlayer({ name: '', position: '', number: '' });
  };

  const handleRemovePlayer = (index) => {
    const updatedPlayers = [...(squad.players || [])];
    updatedPlayers.splice(index, 1);
    setSquad({ ...squad, players: updatedPlayers });
  };

  useEffect(() => {
    fetchSquad();
  }, [id]);

  const fetchSquad = async () => {
    try {
      // Usamos a rota pública por agora, ou podemos criar um GET /squads/:id protegido
      const res = await api.get(`/squads/public/${id}`);
      setSquad(res.data);
    } catch {
      toast.error('Erro ao carregar o Clube.');
      navigate('/dashboard/squads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/squads/${id}`, squad);
      toast.success('Clube atualizado! ✨');
      fetchSquad();
    } catch {
      toast.error('Erro ao atualizar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Queres mesmo eliminar este Clube para sempre?')) return;
    try {
      await api.delete(`/squads/${id}`);
      toast.success('Clube eliminado.');
      navigate('/dashboard/squads');
    } catch {
      toast.error('Erro ao eliminar.');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!squad) return null;

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link to="/dashboard/squads" className="btn btn-secondary" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', borderRadius: 12 }}>
            <ArrowLeft size={20} />
          </Link>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${squad.color || 'var(--green)'}` }}>
              {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : <Shield size={32} color={squad.color || 'var(--green)'} />}
            </div>
            <div>
              <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{squad.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Gestão do Plantel</p>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* DEFINIÇÕES */}
          <div className="card-glass" style={{ padding: 24 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 18, fontWeight: 800 }}>
              <Shield size={20} color="var(--green)" /> Definições do Clube
            </h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Nome da Equipa</label>
                <input required className="form-input" value={squad.name} onChange={e => setSquad({...squad, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Bairro / Comunidade</label>
                <input className="form-input" value={squad.neighborhood || ''} onChange={e => setSquad({...squad, neighborhood: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Contacto WhatsApp (número internacional, sem +) </label>
                <input className="form-input" placeholder="Ex: 258842123456" value={squad.contact || ''} onChange={e => setSquad({...squad, contact: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Cor Principal</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={squad.color || '#00C853'} onChange={e => setSquad({...squad, color: e.target.value})} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{squad.color || '#00C853'}</span>
                  </div>
                </div>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Link do Símbolo (URL)</label>
                  <input className="form-input" placeholder="https://..." value={squad.logo || ''} onChange={e => setSquad({...squad, logo: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
                <button type="button" onClick={handleDelete} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}>
                  <Trash2 size={14} /> Eliminar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner"/> : <><Save size={16}/> Guardar</>}
                </button>
              </div>
            </form>
          </div>

          {/* JOGADORES (BREVEMENTE) */}
          <div className="card-glass" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 18, fontWeight: 800 }}>
              <Users size={20} color="var(--green)" /> Plantel Oficial
            </h3>
            
            <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="form-input" placeholder="Nome do Jogador" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} style={{ flex: 2, height: 40 }} />
              <select className="form-select" value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} style={{ flex: 1, height: 40 }}>
                <option value="">Pos.</option>
                <option value="GK">Guarda-Redes</option>
                <option value="DEF">Defesa</option>
                <option value="MID">Médio</option>
                <option value="FWD">Avançado</option>
              </select>
              <input type="number" className="form-input" placeholder="Nº" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} style={{ width: 60, height: 40 }} />
              <button type="submit" className="btn btn-primary" style={{ height: 40, width: 40, padding: 0, justifyContent: 'center' }}>
                <Plus size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 300, paddingRight: 8 }}>
              {(!squad.players || squad.players.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  Sem jogadores no plantel.
                </div>
              ) : (
                squad.players.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.number && <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', background: 'rgba(0,200,83,0.1)', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>{p.number}</span>}
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                      {p.position && <span style={{ fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>{p.position === 'GK' ? 'Guarda-Redes' : p.position === 'DEF' ? 'Defesa' : p.position === 'MID' ? 'Médio' : p.position === 'FWD' ? 'Avançado' : p.position}</span>}
                    </div>
                    <button type="button" onClick={() => handleRemovePlayer(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <p style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 16, textAlign: 'center' }}>
              ⚠️ Clica em "Guardar" no final para gravar as alterações.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
