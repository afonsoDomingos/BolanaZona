import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Save, Trash2, Plus, X, Pencil, Upload, Image, Camera, PieChart, MessageSquare, Phone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SummonsWhatsAppModal from '../components/SummonsWhatsAppModal';

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '', photo: '', contact: '', notes: '' });
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSummonsModal, setShowSummonsModal] = useState(false);
  const playerFormRef = useRef(null);

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

  const saveSquad = async (dataToSave, showSuccessMsg = true) => {
    setSaving(true);
    try {
      await api.put(`/squads/${id}`, dataToSave);
      if (showSuccessMsg) toast.success('Plantel atualizado! ✨');
      setSquad(dataToSave);
    } catch {
      toast.error('Erro ao atualizar.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    await saveSquad(squad, true);
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name) return;
    
    let updatedPlayers;
    if (editingPlayerIndex !== null) {
      updatedPlayers = [...(squad.players || [])];
      updatedPlayers[editingPlayerIndex] = newPlayer;
      setEditingPlayerIndex(null);
    } else {
      updatedPlayers = [...(squad.players || []), newPlayer];
    }
    
    const updatedSquad = { ...squad, players: updatedPlayers };
    setNewPlayer({ name: '', position: '', number: '', photo: '' });
    
    // Auto-save
    await saveSquad(updatedSquad, true);
  };

  const handleEditPlayer = (index) => {
    setNewPlayer(squad.players[index]);
    setEditingPlayerIndex(index);
    if (playerFormRef.current) {
      playerFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cancelEdit = () => {
    setEditingPlayerIndex(null);
    setNewPlayer({ name: '', position: '', number: '', photo: '' });
  };

  const handleRemovePlayer = async (index) => {
    if (!window.confirm('Queres mesmo remover este jogador?')) return;
    const updatedPlayers = [...(squad.players || [])];
    updatedPlayers.splice(index, 1);
    
    const updatedSquad = { ...squad, players: updatedPlayers };
    await saveSquad(updatedSquad, false);
  };

  useEffect(() => {
    fetchSquad();
  }, [id]);

  const fetchSquad = async () => {
    try {
      const res = await api.get(`/squads/public/${id}`);
      setSquad(res.data);
    } catch {
      toast.error('Erro ao carregar o Clube.');
      navigate('/dashboard/squads');
    } finally {
      setLoading(false);
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
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleDelete} className="btn btn-secondary" style={{ color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)' }}>
              <Trash2 size={16} /> Eliminar
            </button>
            <button onClick={handleUpdate} className="btn btn-primary" disabled={saving} style={{ minWidth: 140, justifyContent: 'center' }}>
              {saving ? <span className="spinner-xs" /> : <><Save size={18} /> Guardar</>}
            </button>
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
                  <label className="form-label">Província / Cidade</label>
                  <select className="form-select" value={squad.city || 'Maputo (Cidade)'} onChange={e => setSquad({...squad, city: e.target.value})}>
                    <option value="Cabo Delgado">Cabo Delgado</option>
                    <option value="Gaza">Gaza</option>
                    <option value="Inhambane">Inhambane</option>
                    <option value="Manica">Manica</option>
                    <option value="Maputo (Cidade)">Maputo (Cidade)</option>
                    <option value="Maputo (Província)">Maputo (Província)</option>
                    <option value="Nampula">Nampula</option>
                    <option value="Niassa">Niassa</option>
                    <option value="Sofala">Sofala</option>
                    <option value="Tete">Tete</option>
                    <option value="Zambézia">Zambézia</option>
                  </select>
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
              <div>
                <label className="form-label">Escalão / Categoria</label>
                <select className="form-select" value={squad.category || 'Senior'} onChange={e => setSquad({...squad, category: e.target.value})}>
                  <option value="Senior">Sénior (Livre) ⚽</option>
                  <option value="Sub-20">Sub-20 (Juniores) 🏃</option>
                  <option value="Sub-17">Sub-17 (Juvenis) 👦</option>
                  <option value="Sub-15">Sub-15 (Iniciados) 🧒</option>
                  <option value="Veteranos">Veteranos (+35) 👴</option>
                  <option value="Feminino">Feminino ♀️</option>
                </select>
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

          {/* JOGADORES */}
          <div className="card-glass" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 800, margin: 0 }}>
                <Users size={20} color="var(--green)" /> Plantel Oficial ({squad?.players?.length || 0})
              </h3>
              {squad?.players?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSummonsModal(true)}
                  className="btn"
                  style={{ background: '#25D366', color: '#000', fontWeight: 800, fontSize: 12, padding: '6px 14px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <MessageSquare size={14} /> Convocar via WhatsApp
                </button>
              )}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Regista os jogadores da equipa com o número de WhatsApp para poderes enviar convocatórias com 1 clique!
            </p>
            
            <form ref={playerFormRef} onSubmit={handleAddPlayer} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                <input className="form-input" placeholder="Nome Completo *" value={newPlayer.name || ''} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} style={{ height: 38, fontSize: 13 }} required />
                <input className="form-input" placeholder="WhatsApp (ex: 841234567)" value={newPlayer.contact || ''} onChange={e => setNewPlayer({...newPlayer, contact: e.target.value})} style={{ height: 38, fontSize: 13 }} />
                <select className="form-select" value={newPlayer.position || ''} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} style={{ height: 38, fontSize: 13 }}>
                  <option value="">Posição (Opc.)</option>
                  <option value="Guarda-Redes">Guarda-Redes</option>
                  <option value="Defesa Central">Defesa Central</option>
                  <option value="Lateral">Lateral</option>
                  <option value="Trinco">Trinco / Defensivo</option>
                  <option value="Médio Centro">Médio Centro</option>
                  <option value="Extremo">Extremo / Ala</option>
                  <option value="Ponta de Lança">Ponta de Lança</option>
                </select>
                <input type="number" className="form-input" placeholder="Nº Camisola" value={newPlayer.number || ''} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} style={{ height: 38, fontSize: 13 }} />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="form-input" placeholder="Observações / Outras informações relevantes (Opcional)" value={newPlayer.notes || ''} onChange={e => setNewPlayer({...newPlayer, notes: e.target.value})} style={{ flex: 1, height: 38, fontSize: 12 }} />
                
                <label className="btn btn-secondary" style={{ height: 38, width: 38, padding: 0, justifyContent: 'center', cursor: 'pointer', borderRadius: 8, background: newPlayer.photo ? 'rgba(0,200,83,0.1)' : 'transparent', border: newPlayer.photo ? '1px solid var(--green)' : '1px solid rgba(255,255,255,0.1)' }} title="Carregar Foto">
                  {uploading ? <span className="spinner-xs" /> : newPlayer.photo ? <Image size={16} color="var(--green)" /> : <Camera size={16} />}
                  <input type="file" hidden accept="image/*" onChange={e => uploadImage(e.target.files[0], 'player')} />
                </label>

                <button type="submit" className="btn btn-primary" title="Adicionar / Guardar Jogador" style={{ height: 38, padding: '0 16px', justifyContent: 'center', background: editingPlayerIndex !== null ? 'var(--yellow)' : 'var(--green)', color: '#000', fontWeight: 800, border: 'none', fontSize: 12 }}>
                  {editingPlayerIndex !== null ? <><Save size={14} /> Guardar</> : <><Plus size={14} /> Adicionar</>}
                </button>
                {editingPlayerIndex !== null && (
                  <button type="button" onClick={cancelEdit} className="btn btn-secondary" style={{ height: 38, width: 38, padding: 0, justifyContent: 'center', borderRadius: 8 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 320, paddingRight: 4 }}>
              {(!squad.players || squad.players.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  Ainda não adicionaste nenhum jogador a este plantel.
                </div>
              ) : (
                squad.players.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} color="var(--text-muted)" />}
                      </div>
                      {p.number && <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--green)', background: 'rgba(0,200,83,0.1)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>#{p.number}</span>}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.name}</span>
                          {p.position && <span style={{ fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 4, fontWeight: 400 }}>{p.position}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {p.contact ? (
                            <span style={{ color: '#25D366', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Phone size={10} /> {p.contact}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Sem WhatsApp</span>
                          )}
                          {p.notes && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>· {p.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button type="button" onClick={() => handleEditPlayer(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleRemovePlayer(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Remover">
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
              style={{ marginTop: 20, width: '100%', justifyContent: 'center', height: 44, background: 'var(--green)', color: '#000', fontWeight: 800, border: 'none' }}
            >
              {saving ? <span className="spinner-xs"/> : <><Save size={16}/> Guardar Alterações no Plantel</>}
            </button>
          </div>
        </div>

        {/* ESTATÍSTICAS DO PLANTEL */}
        <div className="card-glass" style={{ marginTop: 24, padding: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 18, fontWeight: 800 }}>
            <PieChart size={20} color="var(--green)" /> Análise do Plantel
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            {['Guarda-Redes', 'Defesa Central', 'Lateral', 'Trinco', 'Médio Centro', 'Extremo', 'Ponta de Lança'].map(pos => {
              const count = (squad.players || []).filter(p => p.position === pos).length;
              const total = (squad.players || []).length || 1;
              const percent = (count / total) * 100;
              
              return (
                <div key={pos} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{pos}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>jogadores</div>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'var(--green)', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {showSummonsModal && (
        <SummonsWhatsAppModal
          squadName={squad?.name}
          players={squad?.players || []}
          onClose={() => setShowSummonsModal(false)}
        />
      )}
    </div>
  );
}
