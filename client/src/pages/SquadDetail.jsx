import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Save, Trash2, Plus, X, Pencil, Upload, Image, Camera } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '', photo: '' });
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file, type) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData);
      if (type === 'logo') {
        setSquad({ ...squad, logo: res.data.url });
      } else {
        setNewPlayer({ ...newPlayer, photo: res.data.url });
      }
      toast.success('Imagem carregada! 📸');
    } catch {
      toast.error('Erro no upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayer.name) return;
    
    if (editingPlayerIndex !== null) {
      const updatedPlayers = [...(squad.players || [])];
      updatedPlayers[editingPlayerIndex] = newPlayer;
      setSquad({ ...squad, players: updatedPlayers });
      setEditingPlayerIndex(null);
    } else {
      setSquad({ ...squad, players: [...(squad.players || []), newPlayer] });
    }
    setNewPlayer({ name: '', position: '', number: '', photo: '' });
  };

  const handleEditPlayer = (index) => {
    setNewPlayer(squad.players[index]);
    setEditingPlayerIndex(index);
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
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Cidade</label>
                  <input className="form-input" placeholder="Ex: Luanda" value={squad.city || ''} onChange={e => setSquad({...squad, city: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Bairro / Comunidade</label>
                  <input className="form-input" placeholder="Ex: Maianga" value={squad.neighborhood || ''} onChange={e => setSquad({...squad, neighborhood: e.target.value})} />
                </div>
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
                  <label className="form-label">Símbolo do Clube</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" placeholder="Link da imagem..." value={squad.logo || ''} onChange={e => setSquad({...squad, logo: e.target.value})} style={{ flex: 1 }} />
                    <label className="btn btn-secondary" style={{ width: 44, height: 44, padding: 0, justifyContent: 'center', cursor: 'pointer', borderRadius: 12 }}>
                      <Upload size={18} />
                      <input type="file" hidden accept="image/*" onChange={e => uploadImage(e.target.files[0], 'logo')} />
                    </label>
                  </div>
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
                <option value="">Posição (Opc.)</option>
                <option value="Guarda-Redes">Guarda-Redes</option>
                <option value="Defesa Central">Defesa Central</option>
                <option value="Lateral">Lateral</option>
                <option value="Trinco">Trinco / Defensivo</option>
                <option value="Médio Centro">Médio Centro</option>
                <option value="Extremo">Extremo / Ala</option>
                <option value="Ponta de Lança">Ponta de Lança</option>
              </select>
              <input type="number" className="form-input" placeholder="Nº" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} style={{ width: 60, height: 40 }} />
              <label className="btn btn-secondary" style={{ height: 40, width: 40, padding: 0, justifyContent: 'center', cursor: 'pointer', borderRadius: 10, background: newPlayer.photo ? 'rgba(0,200,83,0.1)' : 'transparent', border: newPlayer.photo ? '1px solid var(--green)' : '1px solid rgba(255,255,255,0.1)' }}>
                {uploading ? <span className="spinner-xs" /> : newPlayer.photo ? <Image size={18} color="var(--green)" /> : <Camera size={18} />}
                <input type="file" hidden accept="image/*" onChange={e => uploadImage(e.target.files[0], 'player')} />
              </label>
              <button type="submit" className="btn btn-primary" style={{ height: 40, width: 40, padding: 0, justifyContent: 'center', background: editingPlayerIndex !== null ? 'var(--yellow)' : 'var(--green)', color: '#000', border: 'none' }}>
                {editingPlayerIndex !== null ? <Save size={18} /> : <Plus size={18} />}
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
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} color="var(--text-muted)" />}
                      </div>
                      {p.number && <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', background: 'rgba(0,200,83,0.1)', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>{p.number}</span>}
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                      {p.position && <span style={{ fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>{p.position === 'GK' ? 'Guarda-Redes' : p.position === 'DEF' ? 'Defesa' : p.position === 'MID' ? 'Médio' : p.position === 'FWD' ? 'Avançado' : p.position}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => handleEditPlayer(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleRemovePlayer(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={handleUpdate} 
              className="btn btn-primary" 
              disabled={saving} 
              style={{ marginTop: 24, width: '100%', justifyContent: 'center', height: 48, background: 'var(--green)', color: '#000', border: 'none' }}
            >
              {saving ? <span className="spinner-xs"/> : <><Save size={18}/> Guardar Plantel Oficial</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
