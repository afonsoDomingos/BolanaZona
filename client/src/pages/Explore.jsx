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

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments/public/all'),
      api.get('/tournaments/public/matches/live')
    ])
      .then(([tournamentsRes, matchesRes]) => {
        setTournaments(tournamentsRes.data);
        setMatches(matchesRes.data);
      })
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
    <div className="page animate-fade-in" style={{ padding: 0 }}>
      {/* Hero Section com Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(8, 13, 26, 0.85), rgba(8, 13, 26, 0.7)), url(/banner3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '80px 0 60px',
        marginBottom: 48,
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, marginBottom: 16 }}>
              <span className="typewriter">Explorar</span> <span className="gradient-text">Torneios</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px', fontSize: 18 }}>
              Descobre os melhores torneios de futebol na tua zona. Acompanha classificações, jogos e resultados em tempo real.
            </p>
            
            <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Pesquisar por nome do torneio..." 
                  style={{ paddingLeft: 56, height: 60, borderRadius: 100, fontSize: 16, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <select className="form-select" style={{ borderRadius: 100, height: 50, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }} value={cityFilter} onChange={e => { setCityFilter(e.target.value); setNeighborhoodFilter(''); }}>
                  <option value="">🌍 Todas as Cidades</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="form-select" style={{ borderRadius: 100, height: 50, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }} value={neighborhoodFilter} onChange={e => setNeighborhoodFilter(e.target.value)}>
                  <option value="">📍 Todos os Bairros</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                {(cityFilter || neighborhoodFilter || search) && (
                  <button className="btn btn-secondary" style={{ borderRadius: 100, color: '#ff8080', borderColor: 'rgba(255,68,68,0.2)' }} onClick={() => { setSearch(''); setCityFilter(''); setNeighborhoodFilter(''); }}>
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 100 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon spin-ball">⚽</div>
            <h3>Nenhum torneio encontrado</h3>
            <p style={{ marginBottom: 24 }}>{search || cityFilter || neighborhoodFilter ? 'Tenta ajustar os teus filtros ou pesquisa.' : 'Ainda não existem torneios ativos nesta zona.'}</p>
            {search || cityFilter || neighborhoodFilter ? (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setCityFilter(''); setNeighborhoodFilter(''); }}>
                Limpar Todos os Filtros
              </button>
            ) : (
              <Link to="/dashboard/tournaments/new" className="btn btn-primary">
                <Trophy size={16} /> Criar o Meu Torneio
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Live Matches Section */}
            {matches.length > 0 && (
              <div style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <h2 className="font-syne" style={{ fontSize: 24, fontWeight: 800 }}>Jogos em Destaque 🔴</h2>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--red), transparent)', opacity: 0.3 }} />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: 20, 
                  paddingBottom: 20, 
                  margin: '0 -20px', 
                  padding: '0 20px 20px',
                  scrollSnapType: 'x mandatory' 
                }}>
                  {matches.map(m => (
                    <Link key={m._id} to={`/t/${m.tournament?.shareCode}`} className="match-card" style={{ textDecoration: 'none', minWidth: 320, flexShrink: 0, scrollSnapAlign: 'start', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 12, right: 12, background: m.status === 'live' || m.status === 'active' ? 'rgba(255, 23, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: m.status === 'live' || m.status === 'active' ? '#ff1744' : 'var(--text-muted)', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {(m.status === 'live' || m.status === 'active') ? <><span className="pulse-dot" style={{ width: 6, height: 6, background: '#ff1744', borderRadius: '50%' }}></span> LIVE</> : 'A DECORRER'}
                      </div>
                      
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
                        {m.tournament?.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: m.homeTeam?.color || 'var(--green)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {m.homeTeam?.logo ? <img src={m.homeTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.homeTeam?.name}</div>
                        </div>

                        <div style={{ padding: '0 16px', textAlign: 'center' }}>
                          {(m.status === 'live' || m.status === 'active') && m.homeScore !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>
                              <span>{m.homeScore}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>-</span>
                              <span>{m.awayScore}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: 14, fontWeight: 800 }}>
                              {m.date ? new Date(m.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'VS'}
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: m.awayTeam?.color || 'var(--green)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {m.awayTeam?.logo ? <img src={m.awayTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.awayTeam?.name}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Torneios Grid */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <h2 className="font-syne" style={{ fontSize: 24, fontWeight: 800 }}>Ligas Disponíveis</h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '32px 24px',
              maxWidth: 1200, 
              margin: '0 auto' 
            }}>
              {filtered.map(t => (
                <Link key={t._id} to={`/t/${t.shareCode}`} className="card-premium" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="card-image-wrapper">
                    <div className="status-badge-wrapper">
                      <span className={`badge-premium ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
                    </div>
                    <div className="card-icon-main">⚽</div>
                  </div>
                  
                  <div className="card-body-premium" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 className="card-title-premium">{t.name}</h3>
                    
                    <div className="card-info-grid" style={{ flex: 1 }}>
                      <div className="info-item">
                        <MapPin size={16} className="text-green" />
                        <span>{t.neighborhood}</span>
                      </div>
                      <div className="info-item">
                        <Trophy size={16} className="text-yellow" />
                        <span>{t.prize || 'Troféu & Glória'}</span>
                      </div>
                      <div className="info-item">
                        <Users size={16} className="text-blue" />
                        <span>Máx. {t.maxTeams} equipas</span>
                      </div>
                    </div>

                    <div className="card-footer-premium" style={{ marginTop: 'auto' }}>
                      <div className="date-info">
                        <Calendar size={14} />
                        {new Date(t.startDate).toLocaleDateString()}
                      </div>
                      <div className="view-link">
                        Explorar <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
