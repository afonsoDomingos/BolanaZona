import React from 'react';

export default function Terms() {
  return (
    <div className="page animate-fade-in">
      <div className="container" style={{ maxWidth: 800, padding: '40px 20px' }}>
        <h1 className="font-syne" style={{ fontSize: 40, fontWeight: 800, marginBottom: 32 }}>
          Termos e <span className="gradient-text">Condições</span>
        </h1>
        
        <div className="card-glass" style={{ padding: 40, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 0, marginBottom: 16 }}>1. Aceitação dos Termos</h2>
          <p>Ao aceder ao site <strong>Bola na Zona</strong>, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>2. Uso de Licença</h2>
          <p>É concedida permissão para descarregar temporariamente uma cópia dos materiais (informações ou software) no site Bola na Zona, apenas para visualização transitória pessoal e não comercial.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>3. Isenção de Responsabilidade</h2>
          <p>Os materiais no site da Bola na Zona são fornecidos 'como estão'. A Bola na Zona não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>4. Limitações</h2>
          <p>Em nenhum caso a Bola na Zona ou os seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais na Bola na Zona.</p>

          <h2 style={{ color: '#fff', fontSize: 24, marginTop: 32, marginBottom: 16 }}>5. Precisão dos Materiais</h2>
          <p>Os materiais exibidos no site da Bola na Zona podem incluir erros técnicos, tipográficos ou fotográficos. A Bola na Zona não garante que qualquer material no seu site seja preciso, completo ou atual.</p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'var(--text-muted)' }}>
            Última atualização: 12 de Maio de 2026
          </div>
        </div>
      </div>
    </div>
  );
}
