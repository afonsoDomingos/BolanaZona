import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, Plus, Users, Shield, Phone, User, Trophy } from 'lucide-react';

export default function TeamRegistrationModal({ tournament, onClose }) {
  const [form, setForm] = useState({ 
    name: '', 
    captainName: '', 
    coachName: '', 
    contact: '', 
    color: '#00C853', 
    players: [] 
  });
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTournaments, setAvailableTournaments] = useState([tournament]);
  const [selectedTournament, setSelectedTournament] = useState(tournament._id);

  useEffect(() => {
    api.get('/tournaments/public/all').then(res => {
      // Garantir que o torneio atual está sempre na lista
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
        number: playerNumber ? Number(playerNumber) : null 
      }] 
    }));
    setPlayerName('');
    setPlayerNumber('');
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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Inscrever Equipa</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tournament.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label"><Trophy size={14} style={{ display: 'inline', marginRight: 4 }} /> Torneio a Inscrever</label>
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
              <input className="form-input" placeholder="Nome do capitão" value={form.captainName} onChange={e => setForm({...form, captainName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Contacto *</label>
              <input className="form-input" placeholder="Telemóvel" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Treinador</label>
            <input className="form-input" placeholder="Nome do treinador" value={form.coachName} onChange={e => setForm({...form, coachName: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label"><Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Lista de Jogadores (Mín. 5)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="form-input" style={{ width: '80px', textAlign: 'center' }} placeholder="Nº (Opc)" type="number" value={playerNumber} onChange={e => setPlayerNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <input className="form-input" style={{ flex: 1 }} placeholder="Nome do jogador..." value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
              <button className="btn btn-secondary btn-sm" onClick={addPlayer}><Plus size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
              {form.players.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 100, padding: '4px 12px', fontSize: 12 }}>
                  {p.number && <span style={{ color: 'var(--green)', fontWeight: 800 }}>#{p.number}</span>} {p.name}
                  <button onClick={() => removePlayer(i)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={10} /></button>
                </div>
              ))}
              {form.players.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum jogador adicionado</p>}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 48, marginTop: 12 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Submeter Inscrição</>}
          </button>
        </div>
      </div>
    </div>
  );
}
