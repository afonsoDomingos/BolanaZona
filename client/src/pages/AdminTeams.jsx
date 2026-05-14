import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, Search, Trash2, Users, Trophy, ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTeams() {
  const [data, setData] = useState({ squads: [], teams: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('squads');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/admin/central-equipas');
      setData(res.data);
    } catch (err) {
      toast.error('Erro ao carregar equipas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSquad = async (id, name) => {
    if (!window.confirm(`Eliminar clube "${name}" permanentemente?`)) return;
    try {
      await api.delete(`/admin/squads/${id}`);
      toast.success('Clube eliminado.');
      loadData();
    } catch { toast.error('Erro ao eliminar.'); }
  };

  const handleDeleteTeam = async (id, name) => {
    if (!window.confirm(`Eliminar equipa "${name}" do torneio?`)) return;
    try {
      await api.delete(`/admin/teams/${id}`);
      toast.success('Equipa eliminada do torneio.');
      loadData();
    } catch { toast.error('Erro ao eliminar.'); }
  };

  const filteredSquads = data.squads.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.manager?.name && s.manager.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredTeams = data.teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.tournament?.name && t.tournament.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Central de Equipas 🛡️</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Visão global de todos os clubes e equipas da plataforma</p>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 32 }}>
          <button className={`tab ${tab === 'squads' ? 'active' : ''}`} onClick={() => setTab('squads')}>
            <Shield size={16} /> Clubes Autónomos ({data.squads.length})
          </button>
          <button className={`tab ${tab === 'teams' ? 'active' : ''}`} onClick={() => setTab('teams')}>
            <Trophy size={16} /> Equipas em Torneios ({data.teams.length})
          </button>
        </div>

        <div className="card-glass" style={{ padding: 20, marginBottom: 32 }}>
          <div className="input-wrapper">
            <Search size={18} />
            <input 
              className="form-input" 
              placeholder="Pesquisar por nome da equipa, gestor ou torneio..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tab === 'squads' ? (
          <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filteredSquads.map(s => (
              <div key={s._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color || 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {s.logo ? <img src={s.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {s.neighborhood || 'Bairro indefinido'}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSquad(s._id, s.name)} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', padding: 8 }}><Trash2 size={14} /></button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> Gestor: {s.manager?.name || 'Sistema'}</div>
                  {s.manager?.phone && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 20 }}>📞 {s.manager.phone}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-gray">{s.players?.length || 0} Atletas</span>
                  <span className="badge badge-blue">{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper card-glass" style={{ padding: 0, borderRadius: 20, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Equipa</th>
                  <th>Torneio Relacionado</th>
                  <th>Capitão</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.color || 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {t.logo ? <img src={t.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                        </div>
                        <div style={{ fontWeight: 700 }}>{t.name}</div>
                      </div>
                    </td>
                    <td>
                      {t.tournament ? (
                        <Link to={`/t/${t.tournament.shareCode}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                          {t.tournament.name} <ExternalLink size={12} />
                        </Link>
                      ) : <span style={{ color: 'var(--text-muted)' }}>Órfã (Torneio Apagado)</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{t.captainName || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.contact}</div>
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'approved' ? 'badge-green' : 'badge-yellow'}`}>
                        {t.status === 'approved' ? 'Confirmada' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteTeam(t._id, t.name)} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
