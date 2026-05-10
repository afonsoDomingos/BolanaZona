import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Users, MapPin, Calendar, ArrowRight, Search } from 'lucide-react';

export default function Explore() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('');

  useEffect(() => {
    api.get('/tournaments/public/all')
      .then(res => setTournaments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !cityFilter || t.city === cityFilter;
    const matchesNeighborhood = !neighborhoodFilter || t.neighborhood === neighborhoodFilter;
    return matchesSearch && matchesCity && matchesNeighborhood;
  });

  const cities = [...new Set(tournaments.map(t => t.city))].filter(Boolean);
  const neighborhoods = [...new Set(tournaments.filter(t => !cityFilter || t.city === cityFilter).map(t => t.neighborhood))].filter(Boolean);

  const statusLabel = { registration: 'Inscrições Abertas', active: 'A Decorrer' };
  const statusBadge = { registration: 'badge-blue', active: 'badge-green' };

  return (
    <div className="page animate-fade-in">
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16 }}>
            Explorar <span className="gradient-text">Torneios</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px' }}>
            Descobre os melhores torneios de futebol na tua zona. Acompanha classificações, jogos e resultados em tempo real.
          </p>
          
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Pesquisar por nome do torneio..." 
                style={{ paddingLeft: 48, height: 56, borderRadius: 100, fontSize: 16 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <select className="form-select" style={{ borderRadius: 100, height: 48 }} value={cityFilter} onChange={e => { setCityFilter(e.target.value); setNeighborhoodFilter(''); }}>
                <option value="">🌍 Todas as Cidades</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="form-select" style={{ borderRadius: 100, height: 48 }} value={neighborhoodFilter} onChange={e => setNeighborhoodFilter(e.target.value)}>
                <option value="">📍 Todos os Bairros</option>
                {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              {(cityFilter || neighborhoodFilter || search) && (
                <button className="btn btn-secondary" style={{ borderRadius: 100, color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)' }} onClick={() => { setSearch(''); setCityFilter(''); setNeighborhoodFilter(''); }}>
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚽</div>
            <h3>Nenhum torneio encontrado</h3>
            <p>Tenta pesquisar por outro nome ou bairro.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map(t => (
              <Link key={t._id} to={`/t/${t.shareCode}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: 'var(--green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    <span className="spin-ball">⚽</span>
                  </div>
                  <span className={`badge ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
                </div>
                
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t.name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <MapPin size={14} color="var(--green)" /> {t.location} · {t.neighborhood}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Trophy size={14} color="var(--yellow)" /> {t.prize || 'Troféu & Glória'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Users size={14} color="var(--blue)" /> Máx. {t.maxTeams} equipas
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Inicia em {new Date(t.startDate).toLocaleDateString()}
                  </div>
                  <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver Detalhes <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
