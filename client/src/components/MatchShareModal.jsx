import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchShareModal({ match, tournament, onClose }) {
  const cardRef = useRef(null);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1 });
      const link = document.createElement('a');
      link.download = `jogo-${match.homeTeam.name}-vs-${match.awayTeam.name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Imagem gerada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar imagem.');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500, padding: 0, overflow: 'hidden', background: '#000' }}>
        <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Gerar Imagem de Partilha</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* THE SHAREABLE CARD */}
          <div ref={cardRef} style={{
            width: 400, height: 400,
            background: 'linear-gradient(135deg, #080d1a 0%, #0d1529 100%)',
            padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,200,83,0.3)'
          }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.1) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(41,121,255,0.05) 0%, transparent 70%)' }} />

            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>{tournament.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>📍 {tournament.neighborhood}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', justifyContent: 'center' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
                  {match.homeTeam.logo ? <img src={match.homeTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👕</span>}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{match.homeTeam.name}</div>
              </div>

              <div style={{ fontSize: 24, fontWeight: 900, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>VS</div>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
                  {match.awayTeam.logo ? <img src={match.awayTeam.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👕</span>}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{match.awayTeam.name}</div>
              </div>
            </div>

            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{match.roundName}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                {match.date ? new Date(match.date).toLocaleDateString('pt-PT') : 'Data a definir'}
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 20, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>BOLANAZONA.PLATFORM</div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, width: '100%' }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={downloadImage}>
              <Download size={16} /> Baixar Imagem (PNG)
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('Copia a imagem ou tira print para o Instagram!', { icon: '📸' })}>
              <Camera size={16} /> Instagram
            </button>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Partilha esta imagem nos grupos de WhatsApp ou Stories do Instagram para promover o jogo!
          </p>
        </div>
      </div>
    </div>
  );
}
