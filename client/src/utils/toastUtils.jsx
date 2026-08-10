import toast from 'react-hot-toast';

export const ADMIN_PHONE = '847877405';
export const ADMIN_WHATSAPP_NUMBER = '258847877405';

export function getAdminWhatsappLink(customText) {
  const baseText = customText ? `Olá Admin, encontrei um erro na plataforma: "${customText}"` : 'Olá Admin, preciso de ajuda com a plataforma BolanaZona.';
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(baseText)}`;
}

export function showErrorToast(message) {
  const textMsg = typeof message === 'string' ? message : 'Ocorreu um erro ao processar o pedido.';
  const link = getAdminWhatsappLink(textMsg);

  return toast.error((t) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{textMsg}</div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => toast.dismiss(t.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          fontWeight: 700,
          color: '#25D366',
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
      >
        💬 Contactar Administrador (WhatsApp 847877405)
      </a>
    </div>
  ), { duration: 7000 });
}

export function ErrorContactAdminBanner({ error }) {
  if (!error) return null;
  const link = getAdminWhatsappLink(typeof error === 'string' ? error : 'Erro ao guardar dados.');

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 12
    }}>
      <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
        ❌ {typeof error === 'string' ? error : 'Ocorreu um erro ao guardar.'}
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
        style={{
          height: 32,
          fontSize: 11,
          fontWeight: 700,
          padding: '0 10px',
          color: '#25D366',
          borderColor: 'rgba(37,211,102,0.4)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        💬 Contactar Administrador (WhatsApp 847877405)
      </a>
    </div>
  );
}
