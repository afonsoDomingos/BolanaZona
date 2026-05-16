import { useState, useEffect } from 'react';
import { X, Search, User, Phone, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LinkManagerModal({ team, onClose, onLinked }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [invitationCode, setInvitationCode] = useState(team.invitationCode || null);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/teams/${team._id}/invite-code`);
      setInvitationCode(res.data.invitationCode);
      toast.success('Link de convite gerado!');
    } catch (err) {
      toast.error('Erro ao gerar link.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/invite/team/${invitationCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  useEffect(() => {
    if (query.length < 3) {

      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/auth/search?query=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleLink = async (userId) => {
    setLinking(true);
    try {
      await api.put(`/teams/${team._id}/link-manager`, { userId });
      toast.success('Equipa vinculada com sucesso! 🎉');
      onLinked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao vincular gestor.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title">Gestão da Equipa</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔗 Convite por Link
          </h3>
          {invitationCode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ 
                padding: '10px 12px', background: 'var(--bg-main)', borderRadius: 8, fontSize: 12, 
                color: 'var(--text-secondary)', border: '1px dashed var(--border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {window.location.origin}/invite/team/{invitationCode}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={copyLink}>Copiar Link</button>
                <button className="btn btn-secondary btn-sm" onClick={generateLink}>Gerar Novo</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={generateLink} disabled={loading}>
              Gerar Link de Convite
            </button>
          )}
        </div>

        <div className="divider" style={{ margin: '20px 0' }}>OU</div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔍 Pesquisar Utilizador
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Pesquisar por telefone (Ex: 847877405)"
              style={{ paddingLeft: 40 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>


        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 150 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : results.length > 0 ? (
            results.map(u => (
              <div 
                key={u._id} 
                className="card" 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '12px 16px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                  border: '1px solid var(--border)', transition: '0.2s'
                }}
                onClick={() => handleLink(u._id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="var(--text-muted)" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={10} /> {u.phone}
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px' }} disabled={linking}>
                  {linking ? '...' : 'Vincular'}
                </button>
              </div>
            ))
          ) : query.length >= 3 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
              Nenhum utilizador encontrado com este número.
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
              Digita pelo menos 3 números para pesquisar...
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, padding: 12, background: 'rgba(255,160,0,0.05)', borderRadius: 8, border: '1px solid rgba(255,160,0,0.1)' }}>
          <p style={{ fontSize: 11, color: '#ffb300', textAlign: 'center' }}>
            ⚠️ Ao vincular, o utilizador passará a ter autonomia sobre esta equipa no seu Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
