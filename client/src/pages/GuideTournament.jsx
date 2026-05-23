import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Play, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function GuideTournament() {
  return (
    <div className="page" style={{ backgroundImage: 'url(/loginbg1.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Dark overlay for readability */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,36,0.92)', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 800, padding: '60px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 60 }} className="animate-fade-in">
          <div style={{ display: 'inline-flex', padding: '12px 24px', background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.3)', borderRadius: 30, color: 'var(--green)', fontWeight: 700, marginBottom: 20, alignItems: 'center', gap: 10 }}>
            <Trophy size={20} /> Guia Oficial
          </div>
          <h1 className="font-syne" style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>
            Como Criar e Gerir o Teu Torneio 🏆
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            A Bola na Zona simplifica todo o trabalho pesado. Segue estes 5 passos simples para teres o teu torneio a decorrer como os profissionais.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Step 1 */}
          <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>1</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Criar o Torneio</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Acede ao teu <strong>Painel (Dashboard)</strong>, vai a "Torneios" e clica em <strong>Novo Torneio</strong>. Preenche os dados básicos: nome, desporto, formato (Mata-Mata ou Grupos), datas e local.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#fff' }}>💡 Dica Pro:</strong> Define um limite de equipas para criar exclusividade.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start', animationDelay: '0.1s' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--yellow)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>2</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Receber e Adicionar Equipas</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Na aba <strong>Equipas</strong>, podes adicionar equipas manualmente ou, melhor ainda, partilhar a <strong>Página Pública</strong> do teu torneio. As equipas podem inscrever-se de forma autónoma através do link, e tu só precisas de clicar em "Aprovar"!
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-gray"><Users size={14} /> Partilhar Link Público</span>
                <span className="badge badge-green"><CheckCircle2 size={14} /> Aprovar Inscrições</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start', animationDelay: '0.2s' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>3</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Gerar o Calendário (A Árvore)</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Com as equipas aprovadas, vai à aba <strong>Calendário</strong>. Com apenas um clique no botão <strong>"Gerar Calendário"</strong>, o nosso sistema calcula os cruzamentos e desenha a Árvore Eliminatória automaticamente. Sim, é assim tão fácil.
              </p>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: 16, borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <Calendar size={18} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 14 }}>O sistema emparelha as equipas, criando as fases (Quartos, Meias-Finais, etc.) até à grande Final.</p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start', animationDelay: '0.3s' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>4</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Lançar Resultados e Avançar</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Durante o torneio, acede aos jogos e clica no ícone do Troféu 🏆 para lançar o resultado final e (opcionalmente) quem marcou os golos. Ao guardares, a <strong>equipa vencedora avança automaticamente</strong> para a ronda seguinte na árvore! Nenhuma gestão manual é necessária.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start', animationDelay: '0.4s', border: '1px solid var(--green)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'linear-gradient(135deg, var(--green), var(--yellow))', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>5</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Acompanhamento Público</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Enquanto geres o torneio no teu painel, todos os adeptos podem ver os resultados em tempo real, a árvore atualizada, os melhores marcadores e partilhar a página pública nas redes sociais. A tua imagem será a de uma organização de topo!
              </p>
              <Link to="/dashboard/tournaments/new" className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', fontSize: 16 }}>
                Criar o Meu Torneio Agora <Play size={16} fill="currentColor" style={{ marginLeft: 8 }} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
