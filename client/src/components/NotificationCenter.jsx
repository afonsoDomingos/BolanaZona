import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Todas marcadas como lidas.');
    } catch { toast.error('Erro ao marcar como lidas.'); }
  };

  const clearAll = async () => {
    if (!window.confirm('Eliminar todas as notificações permanentemente?')) return;
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
      toast.success('Notificações limpas.');
    } catch { toast.error('Erro ao limpar notificações.'); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { }
  };

  const typeIcon = (type) => {
    const icons = {
      match: '⚽',
      tournament: '🏆',
      squad: '👥',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="nav-link"
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 10 }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            background: '#ff4444', color: '#fff',
            fontSize: 9, fontWeight: 800,
            width: 15, height: 15, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-primary)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 340,
            maxHeight: 500,
            overflowY: 'auto',
            zIndex: 2000,
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            fontFamily: "'Inter', sans-serif",
            scrollbarWidth: 'thin',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: '#ffffff',
            borderRadius: '16px 16px 0 0',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="#000000" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: 14, color: '#000000' }}>Notificações</span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#000000', color: '#ffffff',
                  fontSize: 9, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 100
                }}>
                  {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none', border: '1px solid #e2e8f0',
                    color: '#000000', fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 100, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#000'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <Check size={11} /> Lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: 'none', border: '1px solid #fde2e2',
                    color: '#ff4444', fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 100, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff0f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <Trash2 size={11} /> Limpar
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          {notifications.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#f5f5f7', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Bell size={22} color="#88888b" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 4 }}>Tudo em dia!</div>
              <div style={{ fontSize: 12, color: '#88888b' }}>Não tens notificações novas.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((n, idx) => (
                <div
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: idx < notifications.length - 1 ? '1px solid #f5f5f7' : 'none',
                    background: n.read ? '#ffffff' : '#f8fffe',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = n.read ? '#fafafa' : '#f0fff8'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? '#ffffff' : '#f8fffe'}
                >
                  {/* Type Icon Circle */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: n.read ? '#f5f5f7' : '#e8fff2',
                    border: `1px solid ${n.read ? '#e2e8f0' : '#c3f0d4'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0
                  }}>
                    {typeIcon(n.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#000000', lineHeight: 1.3 }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: '#88888b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(n.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#555558', lineHeight: 1.5, margin: 0, marginBottom: n.link ? 8 : 0 }}>
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          color: '#000000', fontSize: 11, fontWeight: 700,
                          background: '#f5f5f7', border: '1px solid #e2e8f0',
                          padding: '3px 10px', borderRadius: 100,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        Ver detalhes <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#00C853', flexShrink: 0, marginTop: 4
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
