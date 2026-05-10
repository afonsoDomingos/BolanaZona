import { useEffect, useState } from 'react';
import { Trophy, Star, Target, Search, MapPin, Users, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Talents() {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/players/ranking')
      .then(res => setTalents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = talents.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page animate-fade-in">
      <div className="container">
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,214,0,0.1)', border: '1px solid rgba(255,214,0,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
            <Star size={14} color="var(--yellow)" fill="var(--yellow)" />
            <span style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 600 }}>Montra de Talentos</span>
          </div>
          <h1 className="font-syne" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16 }}>
            Diamantes <span className="gradient-text">Brutos</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px' }}>
            Descobre os melhores jogadores da plataforma. Golos, prémios e desempenho analisados para olheiros profissionais.
          </p>
          
          <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Pesquisar jogador por nome..." 
              style={{ paddingLeft: 48, height: 56, borderRadius: 100, fontSize: 16 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💎</div>
            <h3>Nenhum talento encontrado</h3>
            <p>Tenta pesquisar por outro nome.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((p, i) => (
              <div key={p.name} className="card animate-slide-up" style={{ padding: '16px 24px', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ 
                    width: 50, height: 50, borderRadius: 12, 
                    background: i === 0 ? 'var(--yellow)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900, color: i < 3 ? '#000' : 'var(--text-muted)'
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</h3>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Target size={14} color="var(--green)" /> <strong>{p.goals}</strong> Golos
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Trophy size={14} color="var(--yellow)" /> <strong>{p.mvps || 0}</strong> MVPs
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Users size={14} color="var(--blue)" /> <strong>{p.tournamentsCount}</strong> Torneios
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>{p.score}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Pontos Scout</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 64, padding: 40, background: 'var(--bg-secondary)', borderRadius: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>És um Olheiro Profissional? 🕵️‍♂️</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px' }}>
            Acede a relatórios detalhados, histórico de performance e entra em contacto direto com os capitães das equipas destes jogadores.
          </p>
          <button className="btn btn-primary">
            Solicitar Acesso Scout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
