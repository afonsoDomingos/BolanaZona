import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart2, Share2, ArrowRight, CheckCircle, ClipboardList, Handshake, Camera, ShoppingBag } from 'lucide-react';
import LandingBracketPreview from '../components/LandingBracketPreview';
import LeadCaptureModal from '../components/LeadCaptureModal';
import api from '../services/api';

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

const HISTORIC_ARTICLE = `A Selecção Nacional de Futebol Sub-17 de Moçambique garantiu, esta noite, apuramento ao Campeonato do Mundo da categoria, ao derrotar a Etiópia, por 5-4, no desempate através da marcação de grandes penalidades, após empate a uma bola no tempo regulamentar, em partida do "play-off" do Campeonato Africano das Nações (CAN) Marrocos-2026, disputada no Terrain 8 do Complexe Mohammed VI, em Rabat.

Os "Mambinhas" entraram determinados em alcançar a inédita qualificação e criaram a primeira situação de perigo aos 12 minutos, quando Mubai, na sequência de um cruzamento de Steys, desviou de cabeça para defesa segura do guarda-redes etíope, Temesgen Tadesse.

Apesar do bom início moçambicano, foi a Etiópia quem inaugurou o marcador aos 15 minutos, por intermédio de Zé Amir Muzemil, que concluiu com sucesso uma jogada construída pela zona central.

Em desvantagem, o combinado nacional reagiu e procurou o empate ainda na primeira parte. Diego Pelembe, aos 27 minutos, e Júlio, aos 42, tentaram a sorte, mas os seus remates saíram ao lado da baliza defendida por Tadesse. Com o 1-0 a favor dos etíopes o senhor Mohammed Aouina mandou todo mundo ao intervalo.

No reatamento, os etíopes estiveram perto de ampliar a vantagem. Aos 52 minutos, Biruk aproveitou uma recuperação de bola e rematou forte de pé esquerdo, obrigando João a uma intervenção decisiva para canto.

A persistência moçambicana acabou recompensada aos 55 minutos. Nhampule Jr. descobriu Diego Pelembe já no interior da grande área e o capitão dos "Mambinhas" não desperdiçou, restabelecendo a igualdade e relançando a partida.

O empate manteve-se até ao apito final, levando a decisão para as grandes penalidades, onde Moçambique mostrou maior frieza e eficácia, vencendo por 5-4 e assegurando, assim, presença no Mundial Sub-17 Qatar-2026.

João Jofrisse foi o herói improvável ao defender uma grande penalidade da Etiópia.

No "Mundial", que terá lugar no Qatar em Novembro próximo, Moçambique estará inserido no Grupo "B", juntamente com o Equador, Nova Caledónia e República da Korea.`;

function HistoricNewsCard() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 52, maxWidth: 760, margin: '52px auto 0', padding: '0 8px' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: open ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.04)',
          border: '1px solid ' + (open ? 'rgba(0,200,83,0.5)' : 'rgba(255,255,255,0.12)'),
          borderRadius: open ? '16px 16px 0 0' : 16,
          padding: '14px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Clean Icon */}
        <div style={{
          flexShrink: 0,
          width: 40, height: 40,
          borderRadius: 12,
          background: 'rgba(255,214,0,0.1)',
          border: '1px solid rgba(255,214,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--yellow)'
        }}>
          <Trophy size={20} />
        </div>
        
        {/* Text Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--yellow)', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Momento Histórico
          </div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            Mambinhas garantem apuramento inédito ao Mundial Sub-17 Qatar 2026
          </div>
        </div>
        
        {/* Toggle Icon */}
        <div style={{
          color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: 300,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}>+</div>
      </button>

      {/* Expandable content */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '1000px' : '0',
        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
        borderRadius: '0 0 16px 16px',
        border: open ? '1px solid rgba(0,200,83,0.5)' : 'none',
        borderTop: 'none',
        background: 'rgba(5,5,30,0.85)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>CAN Sub-17 · Rabat, Marrocos</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Moçambique 1–1 (5–4 pen.) Etiópia</span>
          </div>
          {HISTORIC_ARTICLE.split('\n\n').map((para, i) => (
            <p key={i} style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
              {para}
            </p>
          ))}
          <div style={{ marginTop: 20, padding: '14px 20px', background: 'rgba(0,200,83,0.08)', borderRadius: 12, border: '1px solid rgba(0,200,83,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 800 }}>
              🌍 Grupo B · Qatar 2026 · Equador · Nova Caledónia · República da Korea
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 20px rgba(255,200,0,0.5); }
          50% { box-shadow: 0 0 35px rgba(255,200,0,0.9); }
        }
      `}</style>
    </div>
  );
}

export default function Landing() {
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(null);

  const finalizePurchase = (product, leadInfo) => {
    let details = '';
    if (leadInfo.size) details += `\n- *Tamanho:* ${leadInfo.size}`;
    if (leadInfo.color) details += `\n- *Cor:* ${leadInfo.color}`;
    if (leadInfo.province) details += `\n- *Província:* ${leadInfo.province}`;
    
    const quantity = leadInfo.quantity || 1;
    const totalVal = product.price * quantity;
    details += `\n- *Quantidade:* ${quantity}`;
    details += `\n- *Valor Total:* ${totalVal.toLocaleString()} MT`;

    const message = `Olá! Meu nome é *${leadInfo.name}*. Tenho interesse em adquirir *${quantity}x* do produto "*${product.name}*" que vi na página inicial do Bola na Zona.${details}\n\nPor favor, confirmem a disponibilidade.`;
    window.open(`https://wa.me/258847877405?text=${encodeURIComponent(message)}`, '_blank');
    setShowLeadModal(null);
  };

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => setPageLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        setStoreProducts(res.data.slice(0, 4));
      })
      .catch(err => {
        console.error('Erro ao carregar produtos na landing:', err);
      })
      .finally(() => {
        setStoreLoading(false);
      });
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
  }, [pageLoading, storeLoading]);

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

            <h1 className="font-syne" style={{ fontSize: 'clamp(22px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, textAlign: 'center' }}>
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
                <span className="spin-ball">⚽</span> Ver Torneios
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
              {['100% Gratuito', 'Instalável', 'Partilha fácil'].map(t => (
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
            <h2 className="font-syne scroll-reveal" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
              <span className="typewriter-on-scroll">Tudo que precisas num só lugar</span>
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

      {/* Bracket Preview */}
      <LandingBracketPreview />

      {/* Loja Oficial Showcase */}
      <section style={{ padding: '100px 0', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f5f5f7', border: '1px solid #e2e8f0', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
                <ShoppingBag size={14} color="#000000" />
                <span style={{ fontSize: 13, color: '#000000', fontWeight: 600 }}>Loja Oficial</span>
              </div>
              <h2 className="font-syne scroll-reveal" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#000000' }}>
                Equipa-te como <span style={{ background: 'linear-gradient(135deg, #000000, #333333)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>um Campeão</span>
              </h2>
            </div>
            <Link to="/shop" className="btn scroll-reveal" style={{ background: '#000000', color: '#ffffff', borderRadius: 100, border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: 600 }}>
              Ver Loja Completa <ArrowRight size={16} />
            </Link>
          </div>

          {/* Subheader bar inspired by reference image */}
          <div className="scroll-reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '1px solid #f0f0f2', paddingBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 13, color: '#666668', fontWeight: 500 }}>
              {storeProducts.length} itens encontrados
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#000000', transition: 'all 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#000000'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                ⚙️ Filtros <span style={{ background: '#000000', color: '#ffffff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginLeft: 4 }}>0</span>
              </Link>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#000000', display: 'flex', alignItems: 'center', gap: 8 }}>
                Novidades <span style={{ fontSize: 10 }}>▼</span>
              </div>
            </div>
          </div>

          {storeLoading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : storeProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛍️</div>
              <h3 style={{ color: '#000000' }}>Brevemente novos produtos</h3>
              <p style={{ color: '#666668' }}>Estamos a preparar os melhores equipamentos e artigos oficiais.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
              {storeProducts.map((p, i) => (
                <div key={p._id} className="scroll-reveal" style={{ display: 'flex', flexDirection: 'column', transitionDelay: `${(i % 4) * 0.1}s` }}>
                  {/* Image wrapper with light grey background */}
                  <div style={{ height: 260, overflow: 'hidden', position: 'relative', background: '#f5f5f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f0f0f2' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', color: '#000000', padding: '4px 12px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', border: '1px solid #e2e8f0', letterSpacing: 0.5 }}>
                      {p.category}
                    </div>
                  </div>

                  {/* Brand and product details */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#88888b', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', marginTop: '16px' }}>
                      Bola na Zona
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#000000', marginBottom: '8px', lineHeight: '1.3', minHeight: '40px' }}>
                      {p.name}
                    </h3>
                    
                    {/* Visual Color swatches from inspiration image */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                      {['#000000', '#ffffff', '#2e5a44', '#7d2e2e'].map((color, idx) => (
                        <span key={idx} style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1px solid #dcdcdf', display: 'inline-block', cursor: 'pointer', transition: 'transform 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      ))}
                    </div>

                    {/* Price & Buy button container */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#000000' }}>
                        {p.price.toLocaleString()} MT
                      </div>
                      <button onClick={() => setShowLeadModal(p)} className="btn" style={{ width: '100%', background: '#1a1a1c', color: '#ffffff', border: 'none', borderRadius: '8px', justifyContent: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'background-color 0.2s ease', boxShadow: 'none' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#000000'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1a1c'}>
                        <ShoppingBag size={14} /> Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        {/* Background image with overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/banner4mabinhas.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'brightness(0.35)',
          zIndex: 0
        }} />
        {/* Top fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, var(--bg-main), transparent)', zIndex: 1 }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, var(--bg-main), transparent)', zIndex: 1 }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '40px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

          <h2 className="font-syne" style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 28, letterSpacing: '-0.5px' }}>
            Os próximos{' '}
            <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(0,200,83,0.5)' }}>Craques Nacionais</span>
            <br />nascem das comunidades.
          </h2>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.75)', maxWidth: 680, margin: '0 auto 48px', lineHeight: 1.8 }}>
            A nossa missão é criar o espaço onde esse talento se revela.
            De bairro em bairro, de torneio em torneio — a <strong style={{ color: '#fff' }}>Bola na Zona</strong> é a plataforma que organiza, regista e projecta os jogadores que um dia vão
            vestir a camisola <strong style={{ color: '#fff' }}>Mamba Verde</strong>.
          </p>

          {/* 3 Pillars */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { title: 'Das Comunidades', desc: 'O talento existe em cada bairro. Nós damos-lhe um palco.' },
              { title: 'Com Dados Reais', desc: 'Estatísticas, golos e classificações registados digitalmente.' },
              { title: 'Para o Futuro', desc: 'Jogadores visíveis. Recrutadores atentos. Caminhos abertos.' },
            ].map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '28px 24px',
                flex: '1 1 220px',
                maxWidth: 260,
                textAlign: 'center',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(0,200,83,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <div className="font-syne" style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#fff' }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Historic news card */}
          <HistoricNewsCard />
        </div>
      </section>

      {/* Extra padding at bottom to clear the FAB dock on mobile */}
      <div style={{ height: 80 }} />

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
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-lg" style={{ background: '#000', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                Criar Torneio Agora <ArrowRight size={18} />
              </Link>
              <Link to="/guia" className="btn btn-lg" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', backdropFilter: 'blur(5px)' }}>
                Guia de Torneios
              </Link>
            </div>
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

      {showLeadModal && (
        <LeadCaptureModal 
          product={showLeadModal} 
          onClose={() => setShowLeadModal(null)} 
          onCaptured={(leadInfo) => finalizePurchase(showLeadModal, leadInfo)} 
        />
      )}

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

        @media (max-width: 768px) {
          .typewriter {
            white-space: normal;
            border-right: none;
            width: auto !important;
            animation: none;
            opacity: 1;
          }
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

        @media (max-width: 768px) {
          .typewriter-on-scroll {
            white-space: normal;
            border-right: none;
            width: auto !important;
            display: block;
          }
        }

        .is-visible .typewriter-on-scroll {
          animation: 
            typing 1.5s steps(20, end) forwards,
            blink-caret-white 0.75s step-end 3;
        }

        @media (max-width: 768px) {
          .is-visible .typewriter-on-scroll {
            animation: none;
          }
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
