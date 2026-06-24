import { Linkedin, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  if (location.pathname === '/community') return null;

  return (
    <footer style={{ 
      padding: '40px 20px', 
      textAlign: 'center', 
      borderTop: '1px solid rgba(0,0,0,0.05)', 
      marginTop: 'auto',
      background: '#ffffff',
      color: '#1a1a1a'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          Feito com <Heart size={14} color="var(--red)" fill="var(--red)" /> por
          <a
            href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <img
              src="/vibe-avatar.png"
              alt="Vibe"
              width={22}
              height={22}
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(0, 200, 83, 0.35)' }}
            />
            Vibe
          </a>
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/support" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13, textDecoration: 'none' }} className="hover-green">Apoiar & Sugerir</Link>
          <span style={{ color: 'rgba(0,0,0,0.1)' }}>|</span>
          <Link to="/legal/privacy" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, textDecoration: 'none' }} className="hover-green">Privacidade</Link>
          <Link to="/legal/terms" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, textDecoration: 'none' }} className="hover-green">Termos</Link>
          <Link to="/legal/cookies" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, textDecoration: 'none' }} className="hover-green">Cookies</Link>
          <Link to="/legal/cookie-settings" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, textDecoration: 'none' }} className="hover-green">Definições</Link>
          <Link to="/como-criar-torneio" style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700, textDecoration: 'none' }} className="hover-green">Guia de Torneios</Link>
          <a 
            href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'rgba(0,0,0,0.6)', transition: 'var(--transition)' }}
            className="hover-green"
          >
            <Linkedin size={18} />
          </a>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>
          © {new Date().getFullYear()} Bola na Zona · Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
