import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart2, Share2, ArrowRight, CheckCircle, ClipboardList, Handshake, Camera } from 'lucide-react';

const features = [
  { icon: <Trophy size={28} />, title: 'Criar Torneios', desc: 'Mata-mata ou fase de grupos. Configura em minutos.' },
  { icon: <Users size={28} />, title: 'Gerir Equipas', desc: 'Regista equipas, jogadores, capitães e contactos.' },
  { icon: <Calendar size={28} />, title: 'Calendário Automático', desc: 'Jogos gerados automaticamente com datas e horários.' },
  { icon: <BarChart2 size={28} />, title: 'Classificação ao Vivo', desc: 'Pontos, golos e vitórias atualizados em tempo real.' },
  { icon: <Share2 size={28} />, title: 'Partilhar Torneio', desc: 'Link público para todos acompanharem os resultados.' },
  { icon: <ClipboardList size={28} />, title: 'Inscrições Públicas', desc: 'Partilha um link e deixa as equipas inscreverem-se sozinhas.' },
  { icon: <Handshake size={28} />, title: 'Patrocínios e Apoios', desc: 'Atrai patrocinadores locais com um botão de contacto na página.' },
  { icon: <Camera size={28} />, title: 'Prints Oficiais', desc: 'Gera imagens com qualidade da classificação e jogos para partilhar.' },
];

export default function Landing() {
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => setPageLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pageLoading) return;

    // Iniciar o radar de scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.scroll-reveal');
    animatedElements.forEach(el => observer.observe(el));

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const newOpacity = Math.max(0, 1 - scrollPos / 400);
      setScrollOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [pageLoading]);

  if (pageLoading) {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', 
        background: '#0a0f14', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 30,
        position: 'fixed', inset: 0, zIndex: 9999
      }}>
        <div style={{ position: 'relative' }}>
          {/* Aura pulsante */}
          <div style={{ 
            position: 'absolute', inset: -20, borderRadius: '50%', 
            background: 'rgba(0, 200, 83, 0.2)', filter: 'blur(30px)',
            animation: 'pulse-glow 1.5s ease-in-out infinite'
          }} />
          <div className="spin-ball" style={{ fontSize: 80, position: 'relative', zIndex: 1 }}>⚽</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p className="font-syne" style={{ color: 'var(--green)', fontWeight: 900, letterSpacing: 4, fontSize: 10, textTransform: 'uppercase', opacity: 0.8 }}>
            Bola na Zona
          </p>
          {/* Barra de progresso ultra-fina */}
          <div style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--green)', animation: 'loading-bar 1.2s ease-in-out forwards' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center',
        backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(10, 15, 20, 0.7)), url(/banner1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative', overflow: 'hidden',
      }}>

        <div className="container" style={{ 
          textAlign: 'center', 
          position: 'relative', 
          zIndex: 1,
          opacity: scrollOpacity,
          transform: `translateY(${typeof window !== 'undefined' ? window.scrollY * 0.3 : 0}px)`,
          transition: 'opacity 0.1s ease-out'
        }}>
          <div className="animate-slide-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Plataforma de Torneios de Futebol</span>
            </div>

            <h1 className="font-syne" style={{ fontSize: 'clamp(28px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, textAlign: 'center' }}>
              <span className="typewriter">Gere o teu torneio</span><br />
              <span className="gradient-text animate-reveal-dramatic" style={{ animationDelay: '1.5s' }}>como um pro</span>
            </h1>

            <p className="animate-reveal" style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7, animationDelay: '0.2s' }}>
              Cria torneios de bairro, gere equipas, gera calendários automáticos e partilha resultados em tempo real.
            </p>

            <div className="animate-reveal" style={{ 
              display: 'flex', 
              gap: 16, 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              animationDelay: '0.4s',
              padding: '0 20px'
            }}>
              <Link to="/register" className="btn btn-primary btn-lg shadow-green" style={{ minWidth: 'min(300px, 100%)' }}>
                Criar Torneio Grátis <ArrowRight size={18} />
              </Link>
              <Link to="/explore" className="btn btn-secondary btn-lg" style={{ borderColor: 'var(--green)', color: 'var(--green)', minWidth: 'min(300px, 100%)' }}>
                <span className="spin-ball">⚽</span> Explorar Torneios
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
              <div key={i} className="card scroll-reveal" style={{ transitionDelay: `${(i % 4) * 0.1}s` }}>
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
          <div className="scroll-reveal" style={{
            backgroundImage: 'linear-gradient(rgba(0, 200, 83, 0.9), rgba(0, 168, 67, 0.85)), url(/banner2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 28,
            padding: '80px 48px', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div className="cta-ball-container">
                <span className="spin-ball cta-ball" style={{ fontSize: 48 }}>⚽</span>
              </div>
            </div>
            <h2 className="font-syne" style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 800, marginBottom: 16, color: '#fff' }}>
              <span className="typewriter-on-scroll">Pronto para apitar?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, marginBottom: 40, fontWeight: 500 }}>
              Cria o teu primeiro torneio em menos de 2 minutos.
            </p>
            <Link to="/register" className="btn btn-lg" style={{ background: '#000', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              Criar Torneio Agora <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © 2026 Bola na Zona · Feito com <span className="spin-ball">⚽</span> para a comunidade
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }

        @keyframes loading-bar {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .typewriter {
          display: inline-block;
          overflow: hidden;
          border-right: 3px solid var(--green);
          white-space: nowrap;
          margin: 0 auto;
          letter-spacing: -1px;
          animation: 
            typing 1.5s steps(20, end) forwards,
            blink-caret 0.75s step-end 3;
        }

        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { 
          from, to { border-color: transparent } 
          50% { border-color: var(--green); } 
        }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          filter: blur(5px);
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: transform, opacity;
        }

        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        .typewriter-on-scroll {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          width: 0;
          border-right: 3px solid #fff;
        }

        .is-visible .typewriter-on-scroll {
          animation: 
            typing 1.5s steps(20, end) forwards,
            blink-caret-white 0.75s step-end 3;
        }

        @keyframes blink-caret-white { 
          from, to { border-color: transparent } 
          50% { border-color: #fff; } 
        }

        .is-visible .cta-ball-container {
          animation: ball-shoot-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 1.5s forwards;
        }

        .cta-ball {
          display: inline-block;
          animation: spin 3s linear infinite;
        }

        @keyframes ball-shoot-up {
          from { transform: translateY(0); }
          to { transform: translateY(-30px) scale(1.2); }
        }

        .animate-reveal-dramatic {
          opacity: 0;
          animation: revealDramatic 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes revealDramatic {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.92);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .animate-reveal {
          opacity: 0;
          animation: revealUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .shadow-green {
          box-shadow: 0 0 20px rgba(0, 200, 83, 0.2);
          transition: all 0.3s ease;
        }
        .shadow-green:hover {
          box-shadow: 0 0 30px rgba(0, 200, 83, 0.4);
          transform: translateY(-2px);
        }

        .spin-ball { 
          display: inline-block;
          animation: spin 3s linear infinite; 
        }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
