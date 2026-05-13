import { Shield, MapPin, Users, X, Phone, Swords } from 'lucide-react';

export default function SquadDetailsModal({ squad, onClose, onChallenge }) {
  if (!squad) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="modal animate-slide-up" style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: 500, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `2px solid ${squad.color || 'var(--green)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {squad.logo ? <img src={squad.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={32} color={squad.color || 'var(--green)'} />}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{squad.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--green)" /> {squad.city || 'Luanda'}{squad.neighborhood ? ` - ${squad.neighborhood}` : ''}
              </div>
              {squad.contact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  <Phone size={14} color="var(--green)" /> {squad.contact}
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--yellow)', background: 'rgba(255, 193, 7, 0.1)', padding: '4px 10px', borderRadius: 100, marginTop: 8, textTransform: 'uppercase', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                ⚽ {squad.category || 'Senior'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Estatísticas</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.wins || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vitórias</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.draws || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Empates</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{squad.stats?.losses || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Derrotas</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--yellow)' }}>{squad.stats?.tournamentsWon || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Títulos</div></div>
          </div>
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
            <Users size={18} color="var(--green)" /> Plantel Oficial
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(!squad.players || squad.players.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                Este clube ainda não registou jogadores.
              </div>
            ) : (
              squad.players.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={18} color="var(--text-muted)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.number && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)' }}>#{p.number}</span>}
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                    </div>
                    {p.position && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.position === 'GK' ? 'Guarda-Redes' : p.position === 'DEF' ? 'Defesa' : p.position === 'MID' ? 'Médio' : p.position === 'FWD' ? 'Avançado' : p.position}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {onChallenge && (
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onChallenge} style={{ width: '100%', justifyContent: 'center', height: 52, background: 'var(--red)', color: '#fff', border: 'none' }}>
              <Swords size={18} /> Lançar Desafio a {squad.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
