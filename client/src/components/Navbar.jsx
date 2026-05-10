import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, LayoutDashboard, LogOut, LogIn, UserPlus, ShoppingBag } from 'lucide-react';
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
            <div className="navbar-logo-icon spin-ball" style={{ background: 'none', fontSize: 24 }}>
              ⚽
            </div>
            <span className="navbar-logo-text gradient-text">Bola na Zona</span>
          </Link>

          <div className="navbar-nav">
            <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>
              Torneios
            </Link>
            <Link to="/talents" className={`nav-link ${isActive('/talents') ? 'active' : ''}`}>
              Talentos
            </Link>
            <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={18} /> Loja
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/dashboard/tournaments" className={`nav-link ${isActive('/dashboard/tournaments') ? 'active' : ''}`}>
                  <Trophy size={15} style={{ display: 'inline', marginRight: 4 }} />
                  Meus Torneios
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
