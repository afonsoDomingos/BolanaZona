import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Plus, ArrowRight, User, Swords, Check, X, Calendar, MapPin } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SquadDetailsModal from '../components/SquadDetailsModal';
import ChallengeMap from '../components/ChallengeMap';
import ChallengeModal from '../components/ChallengeModal';

export default function MySquads() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', neighborhood: '', city: 'Maputo (Cidade)', category: 'Senior' });
  const [saving, setSaving] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [tab, setTab] = useState('squads');
  const [updating, setUpdating] = useState(false);
  const [showSquadDetails, setShowSquadDetails] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();

  const fetchSquads = async () => {
    try {
      const [sqRes, chRes] = await Promise.all([
        api.get('/squads/my-squads'),
        api.get('/challenges/my-challenges')
      ]);
      setSquads(sqRes.data);
      setChallenges(chRes.data);
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
      const res = await api.post('/squads', formData);
      toast.success('Clube criado! Agora adiciona os teus jogadores. ⚽', { duration: 5000 });
      setShowModal(false);
      setFormData({ name: '', neighborhood: '', city: 'Maputo (Cidade)' });
      navigate(`/dashboard/squads/${res.data._id}`);
    } catch {
      toast.error('Erro ao criar clube.');
    } finally {
      setSaving(false);
    }
  };

  const updateChallengeStatus = async (id, status, reason = '') => {
    setUpdating(true);
    try {
      const res = await api.put(`/challenges/${id}/status`, { status, rejectionReason: reason });
      toast.success(status === 'accepted' ? 'Desafio Aceite! 🔥' : 'Desafio Recusado.');
      
      if (res.data.whatsappLink) {
        toast.success('O WhatsApp vai abrir para avisares o adversário!', { duration: 4000 });
        setTimeout(() => window.open(res.data.whatsappLink, '_blank'), 500);
      }
      
      fetchSquads();
      setShowRejectionModal(null);
      setRejectionReason('');
    } catch {
      toast.error('Erro ao atualizar estado.');
    } finally {
      setUpdating(false);
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

        <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setTab('squads')} style={{ padding: '12px 0', background: 'none', border: 'none', color: tab === 'squads' ? 'var(--green)' : 'var(--text-muted)', borderBottom: tab === 'squads' ? '2px solid var(--green)' : '2px solid transparent', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: '0.2s' }}>
            A Minha Garagem
          </button>
          <button onClick={() => setTab('challenges')} style={{ padding: '12px 0', background: 'none', border: 'none', color: tab === 'challenges' ? 'var(--green)' : 'var(--text-muted)', borderBottom: tab === 'challenges' ? '2px solid var(--green)' : '2px solid transparent', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            Desafios ⚔️
            {challenges.filter(c => c.status === 'pending').length > 0 && <span style={{ background: 'var(--red)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 100 }}>{challenges.filter(c => c.status === 'pending').length}</span>}
          </button>
          <button onClick={() => setTab('matches')} style={{ padding: '12px 0', background: 'none', border: 'none', color: tab === 'matches' ? 'var(--green)' : 'var(--text-muted)', borderBottom: tab === 'matches' ? '2px solid var(--green)' : '2px solid transparent', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            Próximos Jogos ⚽
            {challenges.filter(c => c.status === 'accepted' && new Date(c.date) >= new Date().setHours(0,0,0,0)).length > 0 && <span style={{ background: 'var(--green)', color: '#000', fontSize: 10, padding: '2px 6px', borderRadius: 100 }}>{challenges.filter(c => c.status === 'accepted' && new Date(c.date) >= new Date().setHours(0,0,0,0)).length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tab === 'squads' ? (
          squads.length === 0 ? (
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
        ) : tab === 'challenges' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {challenges.filter(c => c.status !== 'accepted').length === 0 ? (
              <div className="empty-state card-glass">
                <Swords size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <p>Ainda não tens desafios pendentes ou recusados.</p>
              </div>
            ) : (
              challenges.filter(c => c.status !== 'accepted').map(c => {
                const isChallenger = squads.some(s => s._id === c.challengerSquad?._id);
                const mySquad = isChallenger ? c.challengerSquad : c.challengedSquad;
                const opponentSquad = isChallenger ? c.challengedSquad : c.challengerSquad;
                
                return (
                  <div key={c._id} className="card-glass" style={{ padding: 24, borderRadius: 20, borderLeft: c.status === 'pending' ? '4px solid var(--yellow)' : c.status === 'rejected' ? '1px solid var(--border)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>
                          {isChallenger ? 'Desafio Enviado ↗️' : 'Desafio Recebido ↙️'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 18, fontWeight: 800 }}>{mySquad?.name}</span>
                          <Swords size={16} color="var(--red)" />
                          <button 
                            onClick={() => setShowSquadDetails(opponentSquad)}
                            style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 18, fontWeight: 800, cursor: 'pointer', color: 'var(--green)', textDecoration: 'underline', textAlign: 'left' }}
                          >
                            {opponentSquad?.name}
                          </button>
                        </div>
                      </div>
                      <div className={`badge ${c.status === 'pending' ? 'badge-yellow' : 'badge-gray'}`}>
                        {c.status === 'pending' ? 'Pendente' : 'Recusado'}
                      </div>
                    </div>
                    {c.message && <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 12 }}>"{c.message}"</p>}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                      {c.date && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={14}/> {new Date(c.date).toLocaleDateString()}</span>}
                      {c.location && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={14}/> {c.location}</span>}
                      <span style={{ fontWeight: 800, color: c.type === 'wager' ? 'var(--yellow)' : 'var(--green)' }}>{c.type === 'wager' ? `💰 ${c.wagerValue}` : '🤝 Amigável'}</span>
                    </div>
                    {c.status === 'pending' && !isChallenger && (
                      <div className="btn-group-responsive">
                        <button className="btn btn-primary" disabled={updating} onClick={() => updateChallengeStatus(c._id, 'accepted')} style={{ flex: 1, justifyContent: 'center' }}><Check size={16}/> Aceitar Desafio</button>
                        <button className="btn btn-secondary" disabled={updating} onClick={() => setShowRejectionModal(c._id)} style={{ flex: 1, justifyContent: 'center', color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}><X size={16}/> Recusar</button>
                      </div>
                    )}
                    {c.status === 'pending' && isChallenger && (
                      <div className="btn-group-responsive">
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setEditingChallenge(c)}
                          style={{ flex: 1, justifyContent: 'center', color: 'var(--yellow)', borderColor: 'rgba(255,193,7,0.2)' }}
                        >
                          <Calendar size={16}/> Editar Desafio
                        </button>
                      </div>
                    )}
                    {c.status === 'rejected' && c.rejectionReason && (
                      <div style={{ width: '100%', marginTop: 8, padding: '8px 12px', background: 'rgba(255,0,0,0.05)', borderRadius: 8, fontSize: 11, color: 'var(--red)', border: '1px solid rgba(255,0,0,0.1)' }}>
                        <strong>Motivo da recusa:</strong> {c.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {challenges.filter(c => c.status === 'accepted').length === 0 ? (
              <div className="empty-state card-glass">
                <Swords size={56} color="var(--text-muted)" style={{ marginBottom: 20 }} />
                <h3 style={{ fontSize: 24, fontWeight: 800 }}>Sem jogos agendados</h3>
                <p style={{ maxWidth: 400, margin: '12px auto 24px', color: 'var(--text-secondary)' }}>
                  Aceita desafios na aba "Desafios" para veres aqui os teus próximos confrontos!
                </p>
              </div>
            ) : (
              challenges.filter(c => c.status === 'accepted').map(c => {
                const isChallenger = squads.some(s => s._id === c.challengerSquad?._id);
                const mySquad = isChallenger ? c.challengerSquad : c.challengedSquad;
                const opponentSquad = isChallenger ? c.challengedSquad : c.challengerSquad;
                
                return (
                  <div key={c._id} className="card-glass" style={{ padding: 24, borderRadius: 20, borderLeft: c.status === 'pending' ? '4px solid var(--yellow)' : c.status === 'accepted' ? '4px solid var(--green)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>
                          {isChallenger ? 'Desafio Enviado ↗️' : 'Desafio Recebido ↙️'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 18, fontWeight: 800 }}>{mySquad?.name}</span>
                          <Swords size={16} color="var(--red)" />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button 
                              onClick={() => setShowSquadDetails(opponentSquad)}
                              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 18, fontWeight: 800, cursor: 'pointer', color: 'var(--green)', textDecoration: 'underline', textAlign: 'left' }}
                            >
                              {opponentSquad?.name}
                            </button>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Ver plantel e estatísticas</span>
                          </div>
                        </div>
                      </div>
                      <div className={`badge ${c.status === 'pending' ? 'badge-yellow' : c.status === 'accepted' ? 'badge-green' : 'badge-gray'}`}>
                        {c.status === 'pending' ? 'Pendente' : c.status === 'accepted' ? 'Aceite' : c.status === 'rejected' ? 'Recusado' : c.status}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                      {c.message && <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 12 }}>"{c.message}"</p>}
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                        {c.date && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={14}/> {new Date(c.date).toLocaleDateString()}</span>}
                        {c.location && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={14}/> {c.location}</span>}
                        {c.mapsLink && (
                          <button 
                            onClick={() => setExpandedMap(expandedMap === c._id ? null : c._id)}
                            style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--green)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            <MapPin size={14}/> {expandedMap === c._id ? 'Fechar Mapa' : 'Ver no Mapa'}
                          </button>
                        )}
                        <span style={{ display: 'flex', gap: 6, alignItems: 'center', color: c.type === 'wager' ? 'var(--yellow)' : 'var(--green)', fontWeight: 800 }}>
                          {c.type === 'wager' ? `💰 Aposta: ${c.wagerValue || 'Sim'}` : '🤝 Amigável'}
                        </span>
                        {c.status === 'rejected' && c.rejectionReason && (
                          <div style={{ width: '100%', marginTop: 8, padding: '8px 12px', background: 'rgba(255,0,0,0.05)', borderRadius: 8, fontSize: 11, color: 'var(--red)', border: '1px solid rgba(255,0,0,0.1)' }}>
                            <strong>Motivo da recusa:</strong> {c.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {c.mapsLink && expandedMap === c._id && (
                      <ChallengeMap 
                        location={c.location} 
                        mapsLink={c.mapsLink} 
                        city={opponentSquad?.city} 
                      />
                    )}

                      {c.status === 'pending' && !isChallenger && (
                        <div className="btn-group-responsive">
                          <button className="btn btn-primary" disabled={updating} onClick={() => updateChallengeStatus(c._id, 'accepted')} style={{ flex: 1, justifyContent: 'center' }}><Check size={16}/> Aceitar Desafio</button>
                          <button className="btn btn-secondary" disabled={updating} onClick={() => setShowRejectionModal(c._id)} style={{ flex: 1, justifyContent: 'center', color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}><X size={16}/> Recusar</button>
                        </div>
                      )}
                      {c.status === 'pending' && isChallenger && (
                        <div className="btn-group-responsive">
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setEditingChallenge(c)}
                            style={{ flex: 1, justifyContent: 'center', color: 'var(--yellow)', borderColor: 'rgba(255,193,7,0.2)' }}
                          >
                            <Calendar size={16}/> Editar Desafio
                          </button>
                        </div>
                      )}
                    {c.status === 'pending' && isChallenger && (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>A aguardar resposta do {opponentSquad?.name}...</div>
                    )}
                  </div>
                );
              })
            )}
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
                <label className="form-label">Província / Cidade <span style={{color: 'var(--red)'}}>*</span></label>
                <select required className="form-select" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
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

              <div className="form-group">
                <label className="form-label">Escalão / Categoria</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Senior">Sénior (Livre) ⚽</option>
                  <option value="Sub-20">Sub-20 (Juniores) 🏃</option>
                  <option value="Sub-17">Sub-17 (Juvenis) 👦</option>
                  <option value="Sub-15">Sub-15 (Iniciados) 🧒</option>
                  <option value="Veteranos">Veteranos (+35) 👴</option>
                  <option value="Feminino">Feminino ♀️</option>
                </select>
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
      {showSquadDetails && (
        <SquadDetailsModal 
          squad={showSquadDetails} 
          onClose={() => setShowSquadDetails(null)} 
        />
      )}
      {editingChallenge && (
        <ChallengeModal 
          initialData={editingChallenge}
          mySquads={squads}
          onClose={() => setEditingChallenge(null)}
          onSuccess={fetchSquads}
        />
      )}
      {showRejectionModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRejectionModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, maxWidth: 400, padding: 32, width: '100%' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Recusar Desafio ❌</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Diz-nos o motivo (opcional) para informarmos a equipa adversária:</p>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <select 
                className="form-select" 
                onChange={e => setRejectionReason(e.target.value)}
                defaultValue=""
              >
                <option value="">Sem motivo específico</option>
                <option value="Distância muito grande">Distância muito grande 🗺️</option>
                <option value="Valor da aposta muito alto">Valor da aposta muito alto 💰</option>
                <option value="Já temos jogo agendado">Já temos jogo agendado 🗓️</option>
                <option value="Plantel incompleto nesta data">Plantel incompleto nesta data 👥</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowRejectionModal(null)} style={{ flex: 1 }}>Cancelar</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  updateChallengeStatus(showRejectionModal, 'rejected', rejectionReason);
                }}
                style={{ flex: 1, background: 'var(--red)', border: 'none', color: '#fff', justifyContent: 'center' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
