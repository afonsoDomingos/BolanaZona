import React from 'react';

export default function Privacy() {
  return (
    <div className="page animate-fade-in">
      <div className="container" style={{ maxWidth: 800, padding: '40px 20px' }}>
        <h1 className="font-syne" style={{ fontSize: 40, fontWeight: 800, marginBottom: 32 }}>
          Política de <span className="gradient-text">Privacidade</span>
        </h1>
        
        <div className="card-glass" style={{ padding: 40, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: 24, fontSize: 16 }}>
            A sua privacidade é importante para nós. É política da <strong>Bola na Zona</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site.
          </p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>1. Coleta de Informações</h2>
          <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>2. Uso de Dados</h2>
          <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemo-los dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>3. Partilha com Terceiros</h2>
          <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>4. Cookies e Google AdSense</h2>
          <p>O Google, como fornecedor de terceiros, utiliza cookies para exibir anúncios no nosso site. O uso do cookie DART pelo Google permite que ele exiba anúncios para os nossos usuários com base em sua visita ao nosso site e a outros sites na Internet.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>5. Responsabilidade do Usuário</h2>
          <p>O usuário é responsável por manter a confidencialidade da sua senha e conta, sendo totalmente responsável por todas as atividades que ocorram sob a sua senha ou conta.</p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'var(--text-muted)' }}>
            Última atualização: 12 de Maio de 2026
          </div>
        </div>
      </div>
    </div>
  );
}
