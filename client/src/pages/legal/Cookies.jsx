import React from 'react';

export default function Cookies() {
  return (
    <div className="page animate-fade-in">
      <div className="container" style={{ maxWidth: 800, padding: '40px 20px' }}>
        <h1 className="font-syne" style={{ fontSize: 40, fontWeight: 800, marginBottom: 32 }}>
          Política de <span className="gradient-text">Cookies</span>
        </h1>
        
        <div className="card-glass" style={{ padding: 40, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 0, marginBottom: 16 }}>O que são cookies?</h2>
          <p>Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados no seu computador, para melhorar sua experiência.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>Como usamos os cookies?</h2>
          <p>Utilizamos cookies por vários motivos, detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>Desativar cookies</h2>
          <p>Você pode impedir a configuração de cookies ajustando as configurações do seu navegador (consulte a Ajuda do navegador para saber como fazer isso). Esteja ciente de que a desativação de cookies afetará a funcionalidade deste e de muitos outros sites que você visita.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>Cookies que definimos</h2>
          <ul>
            <li><strong>Cookies relacionados à conta:</strong> Se você criar uma conta conosco, usaremos cookies para o gerenciamento do processo de inscrição e administração geral.</li>
            <li><strong>Cookies relacionados ao login:</strong> Utilizamos cookies quando você está logado, para que possamos lembrar dessa ação. Isso evita que você precise fazer login sempre que visitar uma nova página.</li>
          </ul>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>Cookies de Terceiros (Google AdSense)</h2>
          <p>Este site usa o Google AdSense para veicular publicidade. O Google utiliza o cookie DoubleClick para veicular anúncios mais relevantes em toda a Web e limitar o número de vezes que um determinado anúncio é exibido para você.</p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'var(--text-muted)' }}>
            Última atualização: 12 de Maio de 2026
          </div>
        </div>
      </div>
    </div>
  );
}
