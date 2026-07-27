import { useState, useRef } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, Users, Zap, Bot, RefreshCw, AlertCircle, Play, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';


export default function SummonsWhatsAppModal({ match, squadName, players = [], onClose }) {
  const homeName = match?.homeTeam?.name || match?.homeTeamName || 'Equipa A';
  const awayName = match?.awayTeam?.name || match?.awayTeamName || 'Equipa B';
  const tourName = match?.tournament?.name || match?.tournamentName || '';
  
  const formattedDate = match?.date ? new Date(match.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'A definir';
  const formattedTime = match?.date ? new Date(match.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'A definir';
  const matchLocation = match?.location || 'Campo de Jogos';

  // Template predefinido com variáveis solicitadas
  const DEFAULT_TEMPLATE = `Olá, {Nome do Jogador}! ⚽

Foste convocado para o próximo jogo.

🏆 Jogo: {Equipa Casa} vs {Equipa Visitante}
📅 Data: {Data}
🕒 Hora: {Hora}
📍 Local: {Local}

Pedimos que estejas presente com antecedência. Contamos contigo!`;

  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [sendMode, setSendMode] = useState('assisted'); // 'assisted' ou 'twilio'
  const [selectedPlayerIndices, setSelectedPlayerIndices] = useState(
    players.map((_, i) => i)
  );
  
  // Estado para o modo de envio assistido em sequência
  const [isAssistedActive, setIsAssistedActive] = useState(false);
  const [assistedIndex, setAssistedIndex] = useState(0);

  // Estado para envio por API Twilio
  const [isSendingTwilio, setIsSendingTwilio] = useState(false);
  const [twilioResults, setTwilioResults] = useState(null);
  const [twilioError, setTwilioError] = useState(null);

  const [copiedGroup, setCopiedGroup] = useState(false);
  const [sentPlayers, setSentPlayers] = useState({});
  const textareaRef = useRef(null);

  const toggleSelectPlayer = (idx) => {
    if (selectedPlayerIndices.includes(idx)) {
      setSelectedPlayerIndices(selectedPlayerIndices.filter(i => i !== idx));
    } else {
      setSelectedPlayerIndices([...selectedPlayerIndices, idx]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPlayerIndices.length === players.length) {
      setSelectedPlayerIndices([]);
    } else {
      setSelectedPlayerIndices(players.map((_, i) => i));
    }
  };

  // Interpolação de variáveis dinâmicas no modelo de mensagem
  const interpolateMessage = (template, playerName) => {
    if (!template) return '';
    return template
      .split('{Nome do Jogador}').join(playerName || 'Jogador')
      .split('{Equipa Casa}').join(homeName)
      .split('{Equipa Visitante}').join(awayName)
      .split('{Data}').join(formattedDate)
      .split('{Hora}').join(formattedTime)
      .split('{Local}').join(matchLocation);
  };

  const insertVariableTag = (tag) => {
    setMessageTemplate(prev => prev + tag);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Gerar convocatória geral para o grupo do WhatsApp da equipa
  const buildGroupCallupText = () => {
    let msg = `📢 CONVOCATÓRIA OFICIAL ⚽\n`;
    if (squadName) msg += `👕 ${squadName.toUpperCase()}\n\n`;
    msg += `🏆 Jogo: ${homeName} vs ${awayName}\n`;
    msg += `📅 Data: ${formattedDate} | 🕒 Hora: ${formattedTime}\n`;
    msg += `📍 Local: ${matchLocation}\n`;
    if (tourName) msg += `🏆 Competição: ${tourName}\n`;
    
    msg += `\n📋 Atletas Convocados (${selectedPlayerIndices.length}):\n`;
    selectedPlayerIndices.forEach((idx, i) => {
      const p = players[idx];
      if (p) {
        const num = p.number ? `#${p.number} ` : '';
        const pos = p.position ? ` (${p.position})` : '';
        msg += `${i + 1}. ${num}${p.name}${pos}\n`;
      }
    });

    msg += `\nPedimos que todos fiquem atentos aos horários. Contamos convosco! 💪⚽`;
    return msg;
  };

  const formatWhatsAppPhone = (contact) => {
    if (!contact) return '';
    let cleanPhone = contact.replace(/\D/g, '');
    if (cleanPhone.length === 9 && (cleanPhone.startsWith('82') || cleanPhone.startsWith('83') || cleanPhone.startsWith('84') || cleanPhone.startsWith('85') || cleanPhone.startsWith('86') || cleanPhone.startsWith('87'))) {
      cleanPhone = '258' + cleanPhone;
    }
    return cleanPhone;
  };

  // Abrir conversa individual do WhatsApp
  const openWhatsAppForPlayer = (player, idx) => {
    if (!player.contact) {
      toast.error(`O jogador ${player.name} não tem número de WhatsApp registado.`);
      return false;
    }

    const cleanPhone = formatWhatsAppPhone(player.contact);
    const text = interpolateMessage(messageTemplate, player.name);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
    setSentPlayers(prev => ({ ...prev, [idx]: true }));
    toast.success(`Conversa de WhatsApp aberta para ${player.name}!`);
    return true;
  };

  // --- MODO ASSISTIDO EM SEQUÊNCIA ---
  const handleStartAssistedSequence = () => {
    if (selectedPlayerIndices.length === 0) {
      toast.error('Selecione pelo menos um jogador para a convocatória.');
      return;
    }
    setIsAssistedActive(true);
    setAssistedIndex(0);
  };

  const handleAssistedNext = () => {
    if (assistedIndex < selectedPlayerIndices.length - 1) {
      setAssistedIndex(prev => prev + 1);
    } else {
      toast.success('Envio assistido concluído para todos os jogadores convocados!');
      setIsAssistedActive(false);
    }
  };

  const handleAssistedSendAndNext = () => {
    const pIdx = selectedPlayerIndices[assistedIndex];
    const player = players[pIdx];
    if (player) {
      openWhatsAppForPlayer(player, pIdx);
    }
    handleAssistedNext();
  };

  // --- MODO AUTOMATIZADO VIA TWILIO API ---
  const handleSendTwilioMass = async () => {
    const selectedPlayers = selectedPlayerIndices.map(i => players[i]).filter(Boolean);
    if (selectedPlayers.length === 0) {
      toast.error('Selecione pelo menos um jogador convocados.');
      return;
    }

    setIsSendingTwilio(true);
    setTwilioError(null);
    setTwilioResults(null);

    try {
      const res = await api.post('/squads/send-twilio-summons', {
        recipients: selectedPlayers,
        templateText: messageTemplate,
        matchInfo: {
          homeTeam: homeName,
          awayTeam: awayName,
          date: formattedDate,
          time: formattedTime,
          location: matchLocation
        }
      });

      if (res.data.configured) {
        setTwilioResults(res.data.results);
        toast.success('Envio automático via Twilio processado com sucesso!');
        const newSent = { ...sentPlayers };
        selectedPlayerIndices.forEach((idx) => {
          newSent[idx] = true;
        });
        setSentPlayers(newSent);
      }
    } catch (err) {
      console.error('Twilio Send Error:', err);
      const errMsg = err.response?.data?.message || 'A API Twilio não está configurada no servidor ou ocorreu um erro durante o disparo.';
      setTwilioError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSendingTwilio(false);
    }
  };

  const handleCopyGroupText = () => {
    const text = buildGroupCallupText();
    navigator.clipboard.writeText(text);
    setCopiedGroup(true);
    toast.success('Convocatória copiada! Pode colar diretamente no grupo do WhatsApp da equipa.');
    setTimeout(() => setCopiedGroup(false), 3000);
  };

  const samplePlayerName = selectedPlayerIndices.length > 0 && players[selectedPlayerIndices[0]] 
    ? players[selectedPlayerIndices[0]].name 
    : 'João Silva';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 750, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                Envio de Convocatórias via WhatsApp ⚽
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {homeName} vs {awayName} · {formattedDate} às {formattedTime}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Selective Tabs: Formas de Envio */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            <button
              onClick={() => { setSendMode('assisted'); setIsAssistedActive(false); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: sendMode === 'assisted' ? '#25D366' : 'transparent',
                color: sendMode === 'assisted' ? '#000' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={16} /> Envio Coletivo Assistido
            </button>

            <button
              onClick={() => setSendMode('twilio')}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: sendMode === 'twilio' ? '#00d2ff' : 'transparent',
                color: sendMode === 'twilio' ? '#000' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              <Bot size={16} /> Envio Automático (Twilio API)
            </button>
          </div>

          {/* Template Customization Engine with Variable Tags */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Modelo da Mensagem (com Variáveis Dinâmicas) 📝
              </label>
              <button
                type="button"
                onClick={() => setMessageTemplate(DEFAULT_TEMPLATE)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={12} /> Restaurar Padrão
              </button>
            </div>

            {/* Variable insertion tag pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Inserir variável:</span>
              {[
                '{Nome do Jogador}',
                '{Equipa Casa}',
                '{Equipa Visitante}',
                '{Data}',
                '{Hora}',
                '{Local}'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertVariableTag(tag)}
                  style={{
                    background: 'rgba(37, 211, 102, 0.1)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    color: '#25D366',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: '3px 8px',
                    cursor: 'pointer'
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              rows={6}
              value={messageTemplate}
              onChange={e => setMessageTemplate(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: '#fff',
                padding: 10,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                lineHeight: 1.4
              }}
            />

            {/* Realtime Live Preview */}
            <div style={{ marginTop: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10, borderLeft: '3px solid #25D366' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                Pré-visualização para "{samplePlayerName}":
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {interpolateMessage(messageTemplate, samplePlayerName)}
              </div>
            </div>
          </div>

          {/* Section: Players Selection & Action Controls */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} color="var(--green)" /> Selecionar Convocados ({selectedPlayerIndices.length}/{players.length})
              </span>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={toggleSelectAll} 
                  style={{ background: 'transparent', border: 'none', color: '#25D366', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  {selectedPlayerIndices.length === players.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              </div>
            </div>

            {/* Mode-specific Header Action */}
            {sendMode === 'assisted' ? (
              <div style={{ background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                {!isAssistedActive ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: '#fff', display: 'block' }}>Modo Coletivo Assistido em Sequência</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Abre a conversa do WhatsApp preenchida para cada jogador um a um.</span>
                    </div>
                    <button
                      onClick={handleStartAssistedSequence}
                      disabled={selectedPlayerIndices.length === 0}
                      className="btn"
                      style={{ background: '#25D366', color: '#000', fontWeight: 800, fontSize: 12, padding: '8px 16px' }}
                    >
                      <Play size={14} /> Iniciar Sequência ({selectedPlayerIndices.length})
                    </button>
                  </div>
                ) : (
                  /* Assisted Flow Controller Active */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#25D366' }}>
                        Passo {assistedIndex + 1} de {selectedPlayerIndices.length} convocados
                      </span>
                      <button
                        onClick={() => setIsAssistedActive(false)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}
                      >
                        Sair da Sequência
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: '#25D366', 
                          width: `${((assistedIndex + 1) / selectedPlayerIndices.length) * 100}%`,
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>

                    {/* Current Player Card in Sequence */}
                    {(() => {
                      const curIdx = selectedPlayerIndices[assistedIndex];
                      const curPlayer = players[curIdx];
                      if (!curPlayer) return null;

                      return (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>
                              #{curPlayer.number || ''} {curPlayer.name}
                            </div>
                            <div style={{ fontSize: 11, color: curPlayer.contact ? '#25D366' : '#ff5252' }}>
                              <Phone size={10} style={{ display: 'inline', marginRight: 4 }} />
                              {curPlayer.contact || 'Sem contacto registado'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={handleAssistedSendAndNext}
                              className="btn btn-sm"
                              style={{ background: '#25D366', color: '#000', fontWeight: 800, fontSize: 12, padding: '8px 14px' }}
                            >
                              <Send size={13} /> Enviar & Próximo <ChevronRight size={14} />
                            </button>
                            <button
                              onClick={handleAssistedNext}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: 11 }}
                            >
                              Saltar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              /* Twilio Automated Section */
              <div style={{ background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.25)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#fff', display: 'block' }}>Envio Automático via Twilio API</strong>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Dispara a mensagem individual no WhatsApp via API sem intervenção manual.</span>
                  </div>

                  <button
                    onClick={handleSendTwilioMass}
                    disabled={isSendingTwilio || selectedPlayerIndices.length === 0}
                    className="btn"
                    style={{ background: '#00d2ff', color: '#000', fontWeight: 800, fontSize: 12, padding: '8px 16px' }}
                  >
                    {isSendingTwilio ? <RefreshCw size={14} className="spin" /> : <Bot size={14} />}
                    {isSendingTwilio ? 'A Enviar...' : `Disparar para ${selectedPlayerIndices.length} Convocados`}
                  </button>
                </div>

                {twilioError && (
                  <div style={{ marginTop: 10, background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', borderRadius: 8, padding: 10, color: '#ff1744', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <div>
                      {twilioError}
                      <button 
                        onClick={() => setSendMode('assisted')} 
                        style={{ display: 'block', marginTop: 4, background: 'transparent', border: 'none', color: '#00d2ff', textDecoration: 'underline', cursor: 'pointer', fontSize: 11, padding: 0 }}
                      >
                        Alternar para Envio Coletivo Assistido
                      </button>
                    </div>
                  </div>
                )}

                {twilioResults && (
                  <div style={{ marginTop: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#00d2ff' }}>Relatório do Disparo API:</span>
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
                      {twilioResults.map((r, i) => (
                        <div key={i} style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', color: r.success ? '#25D366' : '#ff5252' }}>
                          <span>{r.name} ({r.phone || 'Sem N°'})</span>
                          <span>{r.success ? '✓ Enviado' : `Erro: ${r.error}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Players Selection List */}
            {players.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                Nenhum jogador registado nesta equipa. Adiciona jogadores no perfil do Clube para enviares convocatórias rápidas!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                {players.map((p, idx) => {
                  const isSelected = selectedPlayerIndices.includes(idx);
                  const isSent = sentPlayers[idx];

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px 14px', 
                        background: isSelected ? 'rgba(37, 211, 102, 0.05)' : 'rgba(255,255,255,0.02)', 
                        border: isSelected ? '1px solid rgba(37, 211, 102, 0.2)' : '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: 12,
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelectPlayer(idx)} 
                          style={{ width: 16, height: 16, accentColor: '#25D366', cursor: 'pointer' }}
                        />
                        {p.number && (
                          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--green)', background: 'rgba(0,200,83,0.1)', padding: '2px 6px', borderRadius: 6, flexShrink: 0 }}>
                            #{p.number}
                          </span>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name} {p.position && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>({p.position})</span>}
                          </div>
                          <div style={{ fontSize: 11, color: p.contact ? '#25D366' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={10} /> {p.contact || 'Sem WhatsApp'}
                          </div>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => openWhatsAppForPlayer(p, idx)} 
                        disabled={!p.contact}
                        className="btn btn-sm" 
                        style={{ 
                          background: isSent ? 'rgba(37,211,102,0.15)' : p.contact ? '#25D366' : 'rgba(255,255,255,0.05)', 
                          color: p.contact ? (isSent ? '#25D366' : '#000') : 'var(--text-muted)', 
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '6px 12px',
                          borderRadius: 100,
                          border: 'none',
                          cursor: p.contact ? 'pointer' : 'not-allowed',
                          flexShrink: 0
                        }}
                      >
                        {isSent ? <CheckCircle2 size={14} /> : <Send size={13} />}
                        {isSent ? 'Enviado' : 'Enviar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group Copy Fallback Action */}
          <div style={{ paddingTop: 8 }}>
            <button 
              onClick={handleCopyGroupText} 
              className="btn" 
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontWeight: 700, fontSize: 13, justifyContent: 'center', height: 42 }}
            >
              {copiedGroup ? <Check size={16} color="#25D366" /> : <Copy size={16} />} 
              {copiedGroup ? 'Copiado para a área de transferência!' : 'Copiar Convocatória Completa para Grupo de WhatsApp'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 20px', fontSize: 13 }}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
