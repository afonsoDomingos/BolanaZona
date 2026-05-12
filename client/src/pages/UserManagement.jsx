import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Search, Shield, Trash2, UserPlus, Mail, Phone, Calendar } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Erro ao carregar utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success('Cargo atualizado!');
      loadUsers();
    } catch (err) {
      toast.error('Erro ao atualizar cargo.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tens a certeza que queres eliminar este utilizador? Esta ação é irreversível.')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Utilizador removido.');
      loadUsers();
    } catch (err) {
      toast.error('Erro ao eliminar utilizador.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         u.phone.includes(search) || 
                         (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Gestão de Utilizadores</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Controle de cargos e membros da comunidade</p>
          </div>
          <div className="badge badge-blue" style={{ padding: '8px 16px', fontSize: 14 }}>
            <Users size={16} /> Total: {users.length}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card-glass" style={{ padding: 20, marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: 280 }}>
            <Search size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Pesquisar por nome, telemóvel ou e-mail..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            style={{ width: 200 }}
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="all">Todos os Cargos</option>
            <option value="superadmin">Superadmins</option>
            <option value="admin">Admins</option>
            <option value="player">Jogadores/Capitães</option>
            <option value="viewer">Visualizadores</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper card-glass" style={{ padding: 0, borderRadius: 20, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Contacto</th>
                  <th>Cargo</th>
                  <th>Registado em</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 12, 
                          background: 'var(--bg-secondary)', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={18} color="var(--text-muted)" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {u._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} color="var(--green)" /> {u.phone}</div>
                        {u.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} color="var(--blue)" /> {u.email}</div>}
                      </div>
                    </td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        className={`badge ${u.role === 'superadmin' ? 'badge-yellow' : u.role === 'admin' ? 'badge-green' : 'badge-blue'}`}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer' }}
                      >
                        <option value="superadmin">Superadmin</option>
                        <option value="admin">Admin</option>
                        <option value="player">Jogador/Capitão</option>
                        <option value="viewer">Visualizador</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={12} /> {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(u._id)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ color: 'var(--red)', borderColor: 'rgba(255,0,0,0.2)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum utilizador encontrado com estes filtros.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
