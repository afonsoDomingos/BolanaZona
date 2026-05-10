import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
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
    const interval = setInterval(fetchNotifications, 30000); // Polling simples
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

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="nav-link" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 10 }}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 6, right: 6, background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: 320, maxHeight: 480, overflowY: 'auto', zIndex: 1000, marginTop: 12, padding: 0, border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Notificações</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>Marcar todas como lidas</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
              <div style={{ fontSize: 14 }}>Sem notificações</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map(n => (
                <div key={n._id} onClick={() => markRead(n._id)} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', background: n.read ? 'transparent' : 'rgba(0,200,83,0.03)', transition: 'var(--transition)', cursor: 'pointer', position: 'relative' }}>
                  {!n.read && <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>{n.message}</p>
                  {n.link && (
                    <Link to={n.link} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
                      Ver detalhes <ExternalLink size={12} />
                    </Link>
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
