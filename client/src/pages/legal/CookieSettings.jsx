import React from 'react';
import toast from 'react-hot-toast';

export default function CookieSettings() {
  const clearCookies = () => {
    // Limpar localStorage relacionado a cookies/tracking para teste
    localStorage.removeItem('bnz_visitor_id');
    localStorage.removeItem('bnz_visitor_number');
    toast.success('Preferências de cookies repostas. Recarregue a página.');
  };

  return (
    <div className="page animate-fade-in">
      <div className="container" style={{ maxWidth: 800, padding: '40px 20px' }}>
        <h1 className="font-syne" style={{ fontSize: 40, fontWeight: 800, marginBottom: 32 }}>
          Definições de <span className="gradient-text">Cookies</span>
        </h1>
        
        <div className="card-glass" style={{ padding: 40, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: 32 }}>
            Pode gerir as suas preferências de privacidade e cookies abaixo. Estas definições aplicam-se apenas a este navegador e dispositivo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Cookies Essenciais</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Necessários para o funcionamento básico do site (Login, Segurança).</p>
              </div>
              <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Sempre Ativos</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Cookies de Analytics</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ajudam-nos a entender como os utilizadores interagem com o site.</p>
              </div>
              <div className="badge badge-green">Ativo</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Cookies de Publicidade (AdSense)</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Usados para mostrar anúncios relevantes baseados nos seus interesses.</p>
              </div>
              <div className="badge badge-blue">Ativo</div>
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <button onClick={clearCookies} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Repor todas as preferências
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              Ao repor, voltaremos a pedir consentimento na próxima visita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
