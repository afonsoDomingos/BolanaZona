import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Camera, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

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
              <label className="form-label">Telemóvel</label>
              <div className="input-wrapper">
                <Phone size={18} />
                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail (Opcional)</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="button" onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', color: 'var(--red)', borderColor: 'var(--red)' }}>
                <LogOut size={18} /> Sair da Conta
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Guardar Alterações</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
