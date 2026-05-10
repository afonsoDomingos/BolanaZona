import { Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          Feito com <Heart size={14} color="var(--red)" fill="var(--red)" /> por 
          <a 
            href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}
          >
            Vibe
          </a>
        </p>
        <a 
          href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }}
          className="hover-green"
        >
          <Linkedin size={18} />
        </a>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.5 }}>
          © {new Date().getFullYear()} Bola na Zona · Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
