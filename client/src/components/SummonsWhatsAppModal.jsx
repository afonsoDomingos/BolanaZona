import { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, Users, Calendar, MapPin, Trophy, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SummonsWhatsAppModal({ match, squadName, players = [], onClose }) {
  const homeName = match?.homeTeam?.name || match?.homeTeamName || 'Equipa A';
  const awayName = match?.awayTeam?.name || match?.awayTeamName || 'Equipa B';
  const tourName = match?.tournament?.name || match?.tournamentName || 'Liga / Jogo Amigável';
  
  const formattedDate = match?.date ? new Date(match.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'A definir';
  const formattedTime = match?.date ? new Date(match.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'A definir';
  const matchLocation = match?.location || 'Campo de Jogos';

  const [selectedPlayerIndices, setSelectedPlayerIndices] = useState(
    players.map((_, i) => i)
  );
  const [customNotes, setCustomNotes] = useState('Pedimos que chegues 30 min antes. Contamos contigo!');
  const [copiedGroup, setCopiedGroup] = useState(false);
  const [sentPlayers, setSentPlayers] = useState({});

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

  // Gerar mensagem personalizada para um jogador
  const buildPlayerMessage = (playerName) => {
    let msg = `Olá, ${playerName}! ⚽\n\n`;
    msg += `Lembramos que tens um jogo agendado pelo ${squadName || 'teu clube'}.\n\n`;
    msg += `🏆 Jogo: ${homeName} vs ${awayName}\n`;
    msg += `📅 Data: ${formattedDate}\n`;
    msg += `🕒 Hora: ${formattedTime}\n`;
    msg += `📍 Local: ${matchLocation}\n`;
    if (tourName) msg += `🏆 Competição: ${tourName}\n`;
    if (customNotes.trim()) msg += `\n📝 Obs: ${customNotes.trim()}\n`;
    msg += `\n${customNotes.includes('Pedimos') ? '' : 'Pedimos que chegues com antecedência. Contamos contigo!'}`;
    return msg;
  };

  // Gerar convocatória geral para o grupo do WhatsApp da equipa
  const buildGroupCallupText = () => {
    let msg = `📢 CONVOCATÓRIA OFICIAL ⚽\n`;
    if (squadName) msg += `👕 ${squadName.toUpperCase()}\n\n`;
    msg += `🏆 Jogo: ${homeName} vs ${awayName}\n`;
    msg += `📅 Data: ${formattedDate} | 🕒 Hora: ${formattedTime}\n`;
    msg += `📍 Local: ${matchLocation}\n`;
    if (tourName) msg += `🏆 Competição: ${tourName}\n`;
    if (customNotes.trim()) msg += `\n📝 Obs: ${customNotes.trim()}\n`;
    
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

  // Abrir link do WhatsApp para um jogador individual
  const sendWhatsAppToPlayer = (player, idx) => {
    if (!player.contact) {
      toast.error(`O jogador ${player.name} não tem número de WhatsApp registado.`);
      return;
    }

    // Limpar caracteres não numéricos
    let cleanPhone = player.contact.replace(/\D/g, '');
    
    // Se o número for de Moçambique e não tiver código de país (ex: 841234567 -> 258841234567)
    if (cleanPhone.length === 9 && (cleanPhone.startsWith('82') || cleanPhone.startsWith('83') || cleanPhone.startsWith('84') || cleanPhone.startsWith('85') || cleanPhone.startsWith('86') || cleanPhone.startsWith('87'))) {
      cleanPhone = '258' + cleanPhone;
    }

    const text = buildPlayerMessage(player.name);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
    setSentPlayers(prev => ({ ...prev, [idx]: true }));
    toast.success(`Mensagem gerada para ${player.name}!`);
  };

  const handleCopyGroupText = () => {
    const text = buildGroupCallupText();
    navigator.clipboard.writeText(text);
    setCopiedGroup(true);
    toast.success('Convocatória copiada para a área de transferência! Pode colar no grupo do WhatsApp.');
    setTimeout(() => setCopiedGroup(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 650, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 18, fontWeight: 800 }}>
                Convocatória via WhatsApp ⚽
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {homeName} vs {awayName} · {formattedDate}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Match summary card */}
          <div style={{ background: 'rgba(37, 211, 102, 0.06)', border: '1px solid rgba(37, 211, 102, 0.2)', borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>JOGO</span>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{homeName} vs {awayName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>DATA & HORA</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formattedDate} às {formattedTime}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>LOCAL</span>
                <strong style={{ color: 'var(--text-primary)' }}>{matchLocation}</strong>
              </div>
            </div>
          </div>

          {/* Observations input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Observações da Convocatória</label>
            <input 
              className="form-input" 
              placeholder="Ex: Trazer equipamento secundário. Concentração no campo às 14h." 
              value={customNotes} 
              onChange={e => setCustomNotes(e.target.value)} 
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Actions Bar */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button 
              onClick={handleCopyGroupText} 
              className="btn" 
              style={{ flex: 1, background: '#25D366', color: '#000', fontWeight: 800, fontSize: 13, justifyContent: 'center', height: 42 }}
            >
              {copiedGroup ? <Check size={16} /> : <Copy size={16} />} 
              {copiedGroup ? 'Copiado!' : 'Copiar Convocatória para Grupo'}
            </button>
          </div>

          {/* Player Selection List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} color="var(--green)" /> Jogadores do Plantel ({selectedPlayerIndices.length}/{players.length})
              </span>
              <button 
                type="button" 
                onClick={toggleSelectAll} 
                style={{ background: 'transparent', border: 'none', color: 'var(--green)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                {selectedPlayerIndices.length === players.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            {players.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                Nenhum jogador registado nesta equipa. Adiciona jogadores no perfil do Clube para enviares convocatórias rápidas!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
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
                        onClick={() => sendWhatsAppToPlayer(p, idx)} 
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
                        {isSent ? <Check size={14} /> : <Send size={13} />}
                        {isSent ? 'Enviado' : 'Enviar WhatsApp'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message Preview Box */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Pré-visualização da Mensagem Individual:
            </div>
            <pre style={{ 
              fontFamily: 'inherit', 
              fontSize: 12, 
              color: 'var(--text-secondary)', 
              whiteSpace: 'pre-wrap', 
              margin: 0, 
              lineHeight: 1.4,
              background: 'rgba(0,0,0,0.2)',
              padding: 10,
              borderRadius: 8
            }}>
              {buildPlayerMessage('[Nome do Jogador]')}
            </pre>
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
