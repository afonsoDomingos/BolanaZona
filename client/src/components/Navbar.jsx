import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Activity, Menu, X, User, Settings, Heart, Search, Trophy, Users, LogIn, Shield, Sun, Moon, Download, ChevronDown, LayoutDashboard, Camera, Handshake, Film } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdminDropdown && !event.target.closest('.admin-dropdown-container')) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdminDropdown]);

  useEffect(() => {
    setIsLightMode(document.body.classList.contains('light-mode'));
  }, []);

  // Carregar contador do carrinho do localStorage
  useEffect(() => {
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    loadCartCount();

    // Escutar mudanças no carrinho
    const handleCartChange = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') {
        loadCartCount();
      }
    });

    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
      window.removeEventListener('storage', handleCartChange);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
      console.log('✅ [PWA] beforeinstallprompt disparado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowInstallButton(false);
    } else {
      // Mostrar botão se for mobile e não estiver instalado
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setShowInstallButton(true);
        console.log('📱 [PWA] Mobile detectado, botão de instalação visível');
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Usar prompt nativo se disponível
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    } else {
      // Mostrar modal com instruções manuais
      setShowInstallModal(true);
    }
  };

  const toggleTheme = () => {
    const isLight = document.body.classList.contains('light-mode');
    if (isLight) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

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
                {cartCount > 0 && (
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
                  }}>{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </div>
              <span className="hide-desktop">Loja</span>
            </Link>

            {showInstallButton && (
              <button 
                onClick={handleInstall}
                className="nav-link"
                style={{ 
                  background: 'var(--green)', 
                  border: 'none', 
                  color: '#000', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  padding: '6px 12px', 
                  borderRadius: '8px',
                  transition: 'var(--transition)',
                  fontWeight: 700,
                  fontSize: 13
                }}
                title="Instalar App"
              >
                <Download size={18} />
                <span className="hide-desktop">Instalar</span>
              </button>
            )}

            <button 
              onClick={toggleTheme} 
              className="nav-link"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '6px 12px', 
                borderRadius: '8px',
                transition: 'var(--transition)'
              }}
              title={isLightMode ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
              <span className="hide-desktop">{isLightMode ? "Modo Escuro" : "Modo Claro"}</span>
            </button>

            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={18} /> Perfil
                </Link>
                {user.role === 'superadmin' && (
                  <div className="admin-dropdown-container" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowAdminDropdown(prev => !prev)}
                      className={`nav-link ${isActive('/admin/') || isActive('/dashboard/analytics') ? 'active' : ''}`}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: '8px'
                      }}
                    >
                      <LayoutDashboard size={18} /> Admin <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showAdminDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {showAdminDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: isLightMode ? '#ffffff' : '#0d1527',
                        border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 16,
                        padding: '8px',
                        minWidth: 220,
                        boxShadow: isLightMode ? '0 12px 36px rgba(0,0,0,0.12)' : '0 20px 50px rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(16px)',
                        zIndex: 10000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        {[
                          { to: '/admin/store', label: 'Painel Loja', icon: <ShoppingCart size={16} /> },
                          { to: '/admin/gallery', label: 'Galeria de Fotos', icon: <Camera size={16} /> },
                          { to: '/admin/partners', label: 'Parceiros', icon: <Handshake size={16} /> },
                          { to: '/admin/shorts', label: 'Shorts & Reels', icon: <Film size={16} /> },
                          { to: '/admin/teams', label: 'Equipas', icon: <Shield size={16} /> },
                          { to: '/admin/users', label: 'Gestão Utilizadores', icon: <Settings size={16} /> },
                          { to: '/dashboard/analytics', label: 'Analytics', icon: <Activity size={16} /> },
                        ].map(item => (
                          <Link 
                            key={item.to}
                            to={item.to} 
                            onClick={() => { setIsMenuOpen(false); setShowAdminDropdown(false); }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10,
                              padding: '10px 14px',
                              borderRadius: 10,
                              fontSize: 13,
                              fontWeight: 600,
                              color: isLightMode ? '#0f172a' : '#ffffff',
                              background: isActive(item.to) ? (isLightMode ? 'rgba(0,200,83,0.12)' : 'rgba(0,200,83,0.18)') : 'transparent',
                              transition: 'all 0.2s ease',
                              textDecoration: 'none'
                            }}
                            onMouseEnter={e => {
                              if (!isActive(item.to)) e.currentTarget.style.background = isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
                            }}
                            onMouseLeave={e => {
                              if (!isActive(item.to)) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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

      {/* Modal de Instruções de Instalação */}
      {showInstallModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20
        }} onClick={() => setShowInstallModal(false)}>
          <div 
            className="card-glass"
            style={{
              maxWidth: 400,
              width: '100%',
              padding: 32,
              borderRadius: 24,
              background: 'rgba(18,18,18,0.95)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--green), #00e676)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#000',
                fontSize: 32
              }}>
                ⚽
              </div>
              <h3 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Instalar Bola na Zona</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Instala a app no teu telemóvel</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>1️⃣</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Toca em Partilhar</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ícone quadrado com seta para cima</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>2️⃣</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Escolhe "Adicionar ao Ecrã Principal"</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Na lista de opções</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>3️⃣</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Toca em "Adicionar"</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>No canto superior direito</div>
                    </div>
                  </div>
                </div>
              ) : /Android/.test(navigator.userAgent) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>1️⃣</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Toca nos três pontos</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>No canto superior direito</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>2️⃣</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Escolhe "Instalar Aplicação"</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ou "Adicionar ao Ecrã Principal"</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>3️⃣</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Confirma a instalação</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Toca em "Instalar"</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Procura a opção de instalar no menu do navegador (geralmente nos três pontos ou menu de configurações).
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowInstallModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
