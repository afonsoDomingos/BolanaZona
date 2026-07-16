import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Activity, Menu, X, User, Settings, Heart, Search, Trophy, Users, LogIn, Shield } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => { 
    setIsLoggingOut(true);
    try {
      await logout(); 
      // Keep splash for a bit for the effect
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsLoggingOut(false);
      navigate('/'); 
      setIsMenuOpen(false); 
    }
  };

  return (
    <nav className="navbar">
      {isLoggingOut && (
        <div className="splash-overlay">
          <div style={{
            position: 'absolute', width: '100%', height: '100%', 
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
            zIndex: -1
          }} />

          <div className="card-glass splash-card" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="spin-ball splash-ball" style={{ fontSize: 'clamp(60px, 15vw, 100px)', marginBottom: 24, filter: 'grayscale(1) brightness(0.7)' }}>⚽</div>
            <h1 className="font-syne animate-slide-up splash-title">
              Até à próxima, <span className="gradient-text" style={{ filter: 'grayscale(0.5)' }}>Craque</span>
            </h1>
            <p className="animate-slide-up splash-text" style={{ animationDelay: '0.1s' }}>
              A Zona espera pelo teu regresso. Prepara-te para a próxima jornada.
            </p>
            
            <div style={{ marginTop: 40, width: '100%', maxWidth: 200, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'rgba(255,255,255,0.2)', width: '100%', animation: 'loading-bar 2s linear forwards' }} />
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)} style={{ flexShrink: 0 }}>
            <div className="navbar-logo-icon spin-ball" style={{ background: 'none', fontSize: 24 }}>
              ⚽
            </div>
            <span className="navbar-logo-text gradient-text">Bola na Zona</span>
          </Link>

          <div className={`navbar-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <Trophy size={20} /> Torneios
            </Link>
            <Link to="/clubs" className={`nav-link ${isActive('/clubs') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <Shield size={20} /> Liga Nacional
            </Link>
            <Link to="/talents" className={`nav-link ${isActive('/talents') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <Users size={20} /> Talentos
            </Link>
            <Link to="/support" className={`nav-link ${isActive('/support') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <Heart size={18} color="var(--red)" /> Apoiar
            </Link>
            <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={20} />
                <span style={{
                  position: 'absolute',
                  top: -8,
                  right: -10,
                  background: '#000',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>0</span>
              </div>
              <span className="hide-desktop">Loja</span>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={18} /> Perfil
                </Link>
                {(user.role === 'superadmin' || user.role === 'admin') && (
                  <Link to="/admin/store" className={`nav-link ${isActive('/admin/store') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingCart size={18} /> Painel Loja
                  </Link>
                )}
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
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm" 
                  disabled={isLoggingOut}
                  style={{ color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)', minWidth: 80, justifyContent: 'center' }}
                >
                  {isLoggingOut ? <span className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,68,68,0.2)', borderTopColor: 'var(--red)' }} /> : 'Sair'}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8 }}>
                <Link 
                  to="/login" 
                  className="btn btn-sm" 
                  style={{ background: 'rgba(0,0,0,0.04)', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.05)' }} 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>Criar Conta</Link>
              </div>
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
