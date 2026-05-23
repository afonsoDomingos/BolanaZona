import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Plus, Users, Shield, Phone, User, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TeamRegistrationModal({ tournament, onClose }) {
  const [form, setForm] = useState({ 
    name: '', 
    captainName: '', 
    coachName: '', 
    contact: '', 
    color: '#00C853', 
    players: [] 
  });
  const [step, setStep] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTournaments, setAvailableTournaments] = useState([tournament]);
  const [selectedTournament, setSelectedTournament] = useState(tournament._id);
  const { user } = useAuth();
  const [squads, setSquads] = useState([]);
  const [selectedSquadId, setSelectedSquadId] = useState('');

  const STEPS = ['Informações', 'Plantel'];

  useEffect(() => {
    if (user) {
      api.get('/squads/my-squads').then(res => setSquads(res.data)).catch(() => {});
    }
  }, [user]);

  const handleImportSquad = (e) => {
    const squadId = e.target.value;
    setSelectedSquadId(squadId);
    if (!squadId) return;
    
    const squad = squads.find(s => s._id === squadId);
    if (squad) {
      setForm(prev => ({
        ...prev,
        name: squad.name,
        color: squad.color || prev.color,
        logo: squad.logo || prev.logo,
        players: squad.players || []
      }));
      toast.success('Clube importado! Plantel carregado. 🪄');
    }
  };

  useEffect(() => {
    api.get('/tournaments/public/all').then(res => {
      const fetched = res.data;
      if (!fetched.find(t => t._id === tournament._id)) fetched.unshift(tournament);
      setAvailableTournaments(fetched);
    }).catch(console.error);
  }, [tournament]);

  const addPlayer = () => {
    if (!playerName.trim()) return;
    setForm(prev => ({ 
      ...prev, 
      players: [...prev.players, { 
        name: playerName.trim(), 
        number: playerNumber ? Number(playerNumber) : null,
        photo: playerPhoto
      }] 
    }));
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPhoto('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload/public', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPlayerPhoto(res.data.url);
      toast.success('Foto carregada!');
    } catch (err) {
      toast.error('Erro ao carregar foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePlayer = (i) => setForm(prev => ({ ...prev, players: prev.players.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Nome da equipa é obrigatório.');
    if (form.players.length < 5) return toast.error('Adiciona pelo menos 5 jogadores.');
    
    setLoading(true);
    try {
      await api.post(`/tournaments/${selectedTournament}/teams/public-register`, form);
      toast.success('Inscrição submetida! Aguarda o contacto do organizador. 🎉', { duration: 6000 });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao submeter inscrição.');
    } finally { setLoading(false); }
  };

  const captureLead = async () => {
    try {
      await api.post('/leads', {
        tournamentId: selectedTournament,
        name: form.captainName || 'Capitão Interessado',
        contact: form.contact,
        teamName: form.name,
        source: 'tournament_reg'
      });
    } catch (err) { console.error('Lead capture error:', err); }
  };

  const handleNext = () => {
    if(!form.name.trim() || !form.contact.trim()) return toast.error('Preenche o nome e o contacto.');
    captureLead();
    setStep(1);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500, padding: 0, overflow: 'hidden' }}>
        {/* Header com Progresso */}
        <div style={{ padding: '24px 24px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="modal-title" style={{ fontSize: 20 }}>Inscrever Equipa</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ height: 4, borderRadius: 4, background: i <= step ? 'var(--green)' : 'rgba(255,255,255,0.1)', transition: '0.3s' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: i === step ? 'var(--green)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {step === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!user ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 0 }}>
                    💡 <strong>Dica:</strong> Se já tens conta no Bola na Zona, faz login para importar o teu Clube guardado automaticamente!
                  </p>
                </div>
              ) : squads.length > 0 ? (
                <div style={{ background: 'rgba(0,200,83,0.1)', padding: 16, borderRadius: 12, marginBottom: 8, border: '1px solid rgba(0,200,83,0.2)' }}>
                  <label className="form-label" style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Shield size={16} /> Importar dos Meus Clubes
                  </label>
                  <select className="form-select" value={selectedSquadId} onChange={handleImportSquad}>
                    <option value="">Selecionar Clube Guardado...</option>
                    {squads.map(s => <option key={s._id} value={s._id}>{s.name} ({s.players?.length || 0} Jogadores)</option>)}
                  </select>
                </div>
              ) : null}

              <div className="form-group">
                <label className="form-label"><Trophy size={14} style={{ display: 'inline', marginRight: 4 }} /> Torneio</label>
                <select className="form-select" value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
                  {availableTournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label"><Shield size={14} style={{ display: 'inline', marginRight: 4 }} /> Nome da Equipa *</label>
                <input className="form-input" placeholder="Ex: Estrela do Bairro" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label"><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Capitão</label>
                  <input className="form-input" placeholder="Nome" value={form.captainName} onChange={e => setForm({...form, captainName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Telemóvel *</label>
                  <input className="form-input" placeholder="+258..." value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Treinador (Opcional)</label>
                <input className="form-input" placeholder="Nome do treinador" value={form.coachName} onChange={e => setForm({...form, coachName: e.target.value})} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label"><Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Adicionar Jogadores (Mín. 5)</label>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Identifica os teus craques para as estatísticas.</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, background: playerPhoto ? 'var(--green)' : 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }}>
                    {uploadingPhoto ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <User size={18} color={playerPhoto ? '#000' : 'var(--text-muted)'} />}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                  <input className="form-input" style={{ width: '70px', textAlign: 'center' }} placeholder="Nº" type="number" value={playerNumber} onChange={e => setPlayerNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
                  <input className="form-input" style={{ flex: 1 }} placeholder="Nome do craque..." value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
                  <button className="btn btn-secondary btn-sm" onClick={addPlayer} style={{ padding: 12 }}><Plus size={18} /></button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                  {form.players.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 800, marginRight: 6 }}>{p.number ? `#${p.number}` : '•'}</span> {p.name}
                      </div>
                      <button onClick={() => removePlayer(i)} style={{ background: 'none', color: 'var(--red)', opacity: 0.6 }}><X size={14} /></button>
                    </div>
                  ))}
                  {form.players.length === 0 && <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: 20, fontSize: 13, color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 12 }}>Ainda não adicionaste jogadores.</p>}
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: form.players.length >= 5 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {form.players.length} / 5 jogadores (mínimo)
                </div>
              </div>
            </div>
          )}

          {/* Navegação entre Etapas */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            {step > 0 && (
              <button className="btn btn-secondary" onClick={() => setStep(0)} style={{ flex: 1, justifyContent: 'center' }}>Voltar</button>
            )}
            {step === 0 ? (
              <button 
                className="btn btn-primary" 
                onClick={handleNext} 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Próximo: Plantel
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || form.players.length < 5} style={{ flex: 2, justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Submeter Inscrição'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
