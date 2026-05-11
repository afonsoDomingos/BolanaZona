import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Activity, Menu, X, User, Settings, Heart } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => { logout(); navigate('/'); setIsMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
            <div className="navbar-logo-icon spin-ball" style={{ background: 'none', fontSize: 24 }}>
              ⚽
            </div>
            <span className="navbar-logo-text gradient-text">Bola na Zona</span>
          </Link>

          <div className={`navbar-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Torneios</Link>
            <Link to="/talents" className={`nav-link ${isActive('/talents') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Talentos</Link>
            <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={18} /> Loja
            </Link>
            <Link to="/support" className={`nav-link ${isActive('/support') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={18} color="var(--red)" /> Apoiar
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={18} /> Perfil
                </Link>
                {user.role === 'superadmin' && (
                  <>
                    <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Settings size={18} /> Gestão
                    </Link>
                    <Link to="/dashboard/analytics" className={`nav-link ${isActive('/dashboard/analytics') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={18} /> Analytics
                    </Link>
                  </>
                )}
                <NotificationCenter />
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}>Sair</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>Criar Conta</Link>
              </>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
