import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2L14.5 9H9.5L12 2Z" fill="currentColor"/>
                <path d="M12 22L9.5 15H14.5L12 22Z" fill="currentColor"/>
                <path d="M2 12L9 9.5V14.5L2 12Z" fill="currentColor"/>
                <path d="M22 12L15 14.5V9.5L22 12Z" fill="currentColor"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <span className="navbar-logo-text gradient-text">Bola na Zona</span>
          </Link>

          <div className="navbar-nav">
            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={15} style={{ display: 'inline', marginRight: 4 }} />
                  Dashboard
                </Link>
                <Link to="/dashboard/tournaments" className={`nav-link ${isActive('/dashboard/tournaments') ? 'active' : ''}`}>
                  <Trophy size={15} style={{ display: 'inline', marginRight: 4 }} />
                  Torneios
                </Link>
                <NotificationCenter />
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }}>
                  <LogOut size={14} /> Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <LogIn size={15} style={{ display: 'inline', marginRight: 4 }} /> Entrar
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
                  <UserPlus size={14} /> Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
