import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart2, Share2, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: <Trophy size={28} />, title: 'Criar Torneios', desc: 'Mata-mata ou fase de grupos. Configura em minutos.' },
  { icon: <Users size={28} />, title: 'Gerir Equipas', desc: 'Regista equipas, jogadores, capitães e contactos.' },
  { icon: <Calendar size={28} />, title: 'Calendário Automático', desc: 'Jogos gerados automaticamente com datas e horários.' },
  { icon: <BarChart2 size={28} />, title: 'Classificação ao Vivo', desc: 'Pontos, golos e vitórias atualizados em tempo real.' },
  { icon: <Share2 size={28} />, title: 'Partilhar Torneio', desc: 'Link público para todos acompanharem os resultados.' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,200,83,0.15) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative balls */}
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-slide-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Plataforma de Torneios de Futebol</span>
            </div>

            <h1 className="font-syne" style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
              Gere o teu torneio<br />
              <span className="gradient-text">como um pro</span>
            </h1>

            <p style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
              Cria torneios de bairro, gere equipas, gera calendários automáticos e partilha resultados em tempo real.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Começar Grátis <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Já tenho conta
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
              {['100% Gratuito', 'Sem instalação', 'Partilha fácil'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                  <CheckCircle size={16} color="var(--green)" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 className="font-syne" style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
              Tudo que precisas num só lugar
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 480, margin: '0 auto' }}>
              Do primeiro apito ao pódio final, tens tudo controlado.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--green-subtle)', border: '1px solid rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,200,83,0.15) 0%, rgba(0,200,83,0.05) 100%)',
            border: '1px solid rgba(0,200,83,0.3)', borderRadius: 28,
            padding: '64px 48px', textAlign: 'center',
          }}>
            <h2 className="font-syne" style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
              Pronto para apitar? ⚽
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40 }}>
              Cria o teu primeiro torneio em menos de 2 minutos.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Criar Torneio Agora <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © 2026 Bola na Zona · Feito com ⚽ para a comunidade
          </p>
        </div>
      </footer>
    </div>
  );
}
