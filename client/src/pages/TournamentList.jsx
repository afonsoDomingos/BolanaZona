import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, ArrowRight, Trophy, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


const statusLabel = { draft: 'Rascunho', registration: 'Inscrições', active: 'A decorrer', finished: 'Concluído' };
const statusBadge = { draft: 'badge-gray', registration: 'badge-blue', active: 'badge-green', finished: 'badge-yellow' };
const formatLabel = { groups: 'Fase de Grupos', knockout: 'Mata-mata', groups_knockout: 'Grupos + Mata-mata' };

export default function TournamentList() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');


  useEffect(() => {
    api.get('/tournaments').then(res => setTournaments(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.neighborhood.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!confirm(`Eliminar "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/tournaments/${id}`);
      setTournaments(prev => prev.filter(t => t._id !== id));
      toast.success('Torneio eliminado.');
    } catch { toast.error('Erro ao eliminar.'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800 }}>
              {user?.role === 'superadmin' ? 'Todos os Torneios' : 'Os Meus Torneios'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {user?.role === 'superadmin' ? `${tournaments.length} torneios na plataforma` : `${tournaments.length} torneio(s) criado(s)`}
            </p>
          </div>
          <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Novo Torneio</Link>
        </div>

        <div style={{ background: 'linear-gradient(to right, rgba(0,200,83,0.1), rgba(0,0,0,0))', borderLeft: '4px solid var(--green)', padding: '16px 20px', borderRadius: 8, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Primeira vez a organizar?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Vê o nosso guia passo-a-passo de como gerir o teu torneio como um profissional.</p>
          </div>
          <Link to="/como-criar-torneio" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Ler o Guia <ArrowRight size={14} />
          </Link>
        </div>

        {tournaments.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Pesquisar por nome ou bairro..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Trophy size={64} strokeWidth={1} /></div>
            <h3>{search ? 'Nenhum resultado' : 'Sem torneios ainda'}</h3>
            <p style={{ marginBottom: 24 }}>Cria o teu primeiro torneio agora!</p>
            {!search && <Link to="/dashboard/tournaments/new" className="btn btn-primary"><Plus size={16} /> Criar Torneio</Link>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {filtered.map(t => (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="spin-ball" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚽</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>📍 {t.neighborhood}</div>
                    </div>
                  </div>
                  <span className={`badge ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">👥 {t.maxTeams} equipas</span>
                  <span className="badge badge-gray">{formatLabel[t.format]}</span>
                  {t.createdBy && (
                    <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={10} /> {t.createdBy.name || 'Sistema'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link to={`/dashboard/tournaments/${t._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Gerir <ArrowRight size={14} />
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id, t.name)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
