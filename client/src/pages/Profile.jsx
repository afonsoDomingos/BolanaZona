import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Camera, Save, LogOut, MapPin, Bell, ToggleLeft, ToggleRight, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestNotificationPermission, subscribeToPush, registerServiceWorker, isPushSupported } from '../services/pushNotifications';

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    match: true,
    tournament: true,
    squad: true,
    store: true,
    system: true,
    pushEnabled: false,
    emailEnabled: false
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  const provinces = [
    'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 
    'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'
  ];

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        province: user.province || ''
      });
      if (user.notificationPreferences) {
        setNotificationPrefs(user.notificationPreferences);
      }
    }
  }, [user]);

  const fetchNotificationPrefs = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      setNotificationPrefs(res.data);
    } catch (err) {
      console.error('Erro ao carregar preferências:', err);
    }
  };

  useEffect(() => {
    fetchNotificationPrefs();
    setPushSupported(isPushSupported());
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', formData);
      setForm({ ...form, avatar: res.data.url });
      toast.success('Foto carregada! Salva para confirmar.');
    } catch (err) {
      toast.error('Erro ao carregar foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      setUser(res.data);
      toast.success('Perfil atualizado com sucesso! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPrefChange = async (key, value) => {
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);
    setSavingPrefs(true);
    try {
      await api.put('/notifications/preferences', { notificationPreferences: newPrefs });
      toast.success('Preferências atualizadas');
    } catch (err) {
      toast.error('Erro ao atualizar preferências');
      setNotificationPrefs(notificationPrefs);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleEnablePush = async () => {
    if (!pushSupported) {
      toast.error('Este navegador não suporta notificações push');
      return;
    }

    setEnablingPush(true);
    try {
      // Registrar service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Falha ao registrar service worker');
      }

      // Solicitar permissão
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        throw new Error('Permissão negada');
      }

      // Subscrever para push
      await subscribeToPush(registration);

      // Atualizar preferências
      await handleNotificationPrefChange('pushEnabled', true);
      toast.success('Notificações push ativadas! 🎉');
    } catch (err) {
      toast.error(err.message || 'Erro ao ativar notificações push');
    } finally {
      setEnablingPush(false);
    }
  };

  if (!user) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page animate-fade-in">
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Meu Perfil</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gere os teus dados e identidade na plataforma</p>
        </div>

        <div className="card-glass" style={{ padding: 32, borderRadius: 24 }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: 120, height: 120, borderRadius: '50%', 
                background: 'var(--bg-secondary)', border: '4px solid var(--green)', 
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,200,83,0.2)'
              }}>
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={60} color="var(--text-muted)" />
                )}
              </div>
              <label style={{ 
                position: 'absolute', bottom: 5, right: 5, 
                background: 'var(--green)', color: '#000', 
                width: 36, height: 36, borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', border: '3px solid var(--bg-card)'
              }}>
                {uploading ? <div className="spinner" style={{ width: 16, height: 16, borderColor: '#000' }} /> : <Camera size={18} />}
                <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={uploading} />
              </label>
            </div>
            <div className="badge badge-green" style={{ marginTop: 16, padding: '4px 12px' }}>
              <Shield size={12} /> {user.role.toUpperCase()}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <div className="input-wrapper">
                <User size={18} />
                <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Telemóvel 
                <span style={{ fontSize: 10, color: '#25D366', fontWeight: 700 }}>● USADO PARA WHATSAPP</span>
              </label>
              <div className="input-wrapper">
                <Phone size={18} />
                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Província</label>
              <div className="input-wrapper">
                <MapPin size={18} />
                <select className="form-input" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}>
                  <option value="">Selecionar Província...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail (Opcional)</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexDirection: 'column' }}>
              <button type="button" onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary" style={{ justifyContent: 'center', color: 'var(--red)', borderColor: 'var(--red)', width: '100%' }}>
                <LogOut size={18} /> Sair da Conta
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', width: '100%' }}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Guardar Alterações</>}
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card-glass" style={{ padding: 32, borderRadius: 24, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: '50%', 
              background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bell size={24} color="var(--green)" />
            </div>
            <div>
              <h2 className="font-syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Preferências de Notificação</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Escolhe que tipos de notificações queres receber</p>
            </div>
          </div>

          {/* Push Notifications Toggle */}
          <div style={{ 
            padding: 16, background: 'rgba(0,200,83,0.05)', borderRadius: 12,
            border: '1px solid rgba(0,200,83,0.2)', marginBottom: 20
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Smartphone size={20} color="var(--green)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Notificações Push</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Recebe notificações no telemóvel mesmo quando a app está fechada
                  </div>
                </div>
              </div>
              {notificationPrefs.pushEnabled ? (
                <button
                  onClick={() => handleNotificationPrefChange('pushEnabled', false)}
                  disabled={savingPrefs}
                  style={{
                    background: 'var(--green)',
                    border: 'none',
                    borderRadius: 24,
                    padding: '10px 16px',
                    cursor: savingPrefs ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  <ToggleRight size={18} color="#000" /> Ativado
                </button>
              ) : (
                <button
                  onClick={handleEnablePush}
                  disabled={enablingPush || !pushSupported}
                  style={{
                    background: enablingPush ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 24,
                    padding: '10px 16px',
                    cursor: enablingPush || !pushSupported ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  {enablingPush ? (
                    <span className="spinner" style={{ width: 16, height: 16, borderColor: '#fff' }} />
                  ) : (
                    <><ToggleLeft size={18} color="var(--text-muted)" /> Ativar</>
                  )}
                </button>
              )}
            </div>
            {!pushSupported && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                ⚠️ Este navegador não suporta notificações push. Tenta usar Chrome ou Safari.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'match', label: '⚽ Jogos e Partidas', desc: 'Notificações sobre jogos dos teus squads' },
              { key: 'tournament', label: '🏆 Torneios', desc: 'Atualizações sobre torneios em que participas' },
              { key: 'squad', label: '👥 Squads', desc: 'Atividades das tuas equipas' },
              { key: 'store', label: '🛒 Loja', desc: 'Promoções e atualizações da loja' },
              { key: 'system', label: '🔔 Sistema', desc: 'Notificações importantes da plataforma' }
            ].map(pref => (
              <div key={pref.key} style={{ 
                display: 'flex', flexDirection: 'column', gap: 12,
                padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{pref.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pref.desc}</div>
                </div>
                <button
                  onClick={() => handleNotificationPrefChange(pref.key, !notificationPrefs[pref.key])}
                  disabled={savingPrefs}
                  style={{
                    background: notificationPrefs[pref.key] ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 24,
                    padding: '10px 16px',
                    cursor: savingPrefs ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  {notificationPrefs[pref.key] ? (
                    <><ToggleRight size={18} color="#000" /> Ativado</>
                  ) : (
                    <><ToggleLeft size={18} color="var(--text-muted)" /> Desativado</>
                  )}
                </button>
              </div>
            ))}

            <div style={{ 
              marginTop: 8, padding: 16, background: 'rgba(0,200,83,0.05)', 
              borderRadius: 12, border: '1px solid rgba(0,200,83,0.2)'
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                💡 <strong>Dica:</strong> Podes desativar notificações específicas se não queres receber atualizações sobre certos tipos de conteúdo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
