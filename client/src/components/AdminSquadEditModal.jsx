import { useState, useRef } from 'react';
import { Shield, X, Save, Upload, Plus, Trash2, Pencil, Users, Camera, Image, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Comprime imagem via Canvas antes do upload (garante < 2MB)
const compressImage = (file, maxWidth = 1200, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Falha na compressão da imagem.'));
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            console.log(`📦 Compressão: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

export default function AdminSquadEditModal({ squad, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: squad?.name || '',
    category: squad?.category || 'Senior',
    city: squad?.city || 'Maputo (Cidade)',
    neighborhood: squad?.neighborhood || '',
    contact: squad?.contact || '',
    color: squad?.color || '#00C853',
    logo: squad?.logo || '',
    banner: squad?.banner || '',
    description: squad?.description || '',
    players: squad?.players || []
  });

  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Player editing state
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '', photo: '', notes: '', isCaptain: false });
  const [editingPlayerIdx, setEditingPlayerIdx] = useState(null);
  const [uploadingPlayerPhoto, setUploadingPlayerPhoto] = useState(false);

  const playerFormRef = useRef(null);

  const uploadImage = async (file, target) => {
    if (target === 'banner') setUploadingBanner(true);
    if (target === 'logo') setUploadingLogo(true);
    if (target === 'player') setUploadingPlayerPhoto(true);

    try {
      // Comprime antes do upload: banner até 1920px, logo/foto até 800px
      const maxWidth = target === 'banner' ? 1920 : 800;
      const quality = target === 'banner' ? 0.80 : 0.85;
      const compressed = await compressImage(file, maxWidth, quality);

      const fd = new FormData();
      fd.append('image', compressed);

      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      if (target === 'banner') {
        setFormData(prev => ({ ...prev, banner: res.data.url }));
      } else if (target === 'logo') {
        setFormData(prev => ({ ...prev, logo: res.data.url }));
      } else if (target === 'player') {
        setNewPlayer(prev => ({ ...prev, photo: res.data.url }));
      }
      toast.success('Imagem carregada com sucesso! 📸');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erro no upload.';
      console.error('[UPLOAD ERROR]', err);
      toast.error(`Falha no upload: ${msg}`);
    } finally {
      setUploadingBanner(false);
      setUploadingLogo(false);
      setUploadingPlayerPhoto(false);
    }
  };

  const handleAddOrUpdatePlayer = (e) => {
    e.preventDefault();
    if (!newPlayer.name) return toast.error('Insira o nome do jogador.');

    let updatedPlayers = [...formData.players];
    if (editingPlayerIdx !== null) {
      updatedPlayers[editingPlayerIdx] = newPlayer;
      setEditingPlayerIdx(null);
    } else {
      updatedPlayers.push(newPlayer);
    }

    setFormData({ ...formData, players: updatedPlayers });
    setNewPlayer({ name: '', position: '', number: '', photo: '', notes: '', isCaptain: false });
    toast.success(editingPlayerIdx !== null ? 'Jogador atualizado no plantel!' : 'Jogador adicionado ao plantel!');
  };

  const handleEditPlayer = (idx) => {
    setEditingPlayerIdx(idx);
    setNewPlayer(formData.players[idx]);
    if (playerFormRef.current) {
      playerFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRemovePlayer = (idx) => {
    const updated = [...formData.players];
    updated.splice(idx, 1);
    setFormData({ ...formData, players: updated });
    toast.success('Jogador removido.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/squads/${squad._id}`, formData);
      toast.success('Equipa totalmente atualizada pelo Administrador! ✨');
      if (onSaved) onSaved();
      onClose();
    } catch {
      toast.error('Erro ao guardar alterações da equipa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '76px 16px 36px', overflowY: 'auto' }}>
      <div className="modal animate-slide-up" style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 24, width: '100%', maxWidth: 680, padding: 0, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden', maxHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Banner Preview & Header */}
        <div style={{
          height: 160,
          position: 'relative',
          background: formData.banner 
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15,23,42,0.8)), url(${formData.banner}) center/cover no-repeat`
            : 'linear-gradient(135deg, #00C853 0%, #008a38 100%)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <label className="btn btn-secondary btn-sm" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', cursor: 'pointer', fontWeight: 700, borderRadius: 10 }}>
              <Camera size={14} /> {uploadingBanner ? 'A carregar...' : 'Alterar Banner / Foto de Capa'}
              <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'banner')} />
            </label>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div style={{ padding: '0 24px 24px', marginTop: -46, overflowY: 'auto', flex: 1 }}>
          
          {/* Logo Upload & Title */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 22, background: '#ffffff', border: `3px solid ${formData.color || '#00C853'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', flexShrink: 0 }}>
              {formData.logo ? <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shield size={44} color={formData.color || '#00C853'} />}
              <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <Upload size={20} color="#fff" />
                <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'logo')} />
              </label>
            </div>

            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Editar Equipa (Modo Admin)</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>Gestão total de informações, fotos e plantel</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Nome da Equipa */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>Nome da Equipa</label>
              <input required style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600 }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* Categoria & Contacto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>Escalão / Categoria</label>
                <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600 }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Senior">Sénior (Livre) ⚽</option>
                  <option value="Sub-20">Sub-20 (Juniores) 🏃</option>
                  <option value="Sub-17">Sub-17 (Juvenis) 👦</option>
                  <option value="Sub-15">Sub-15 (Iniciados) 🧒</option>
                  <option value="Veteranos">Veteranos (+35) 👴</option>
                  <option value="Feminino">Feminino ♀️</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>Contacto WhatsApp</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600 }} placeholder="Ex: 258842123456" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
              </div>
            </div>

            {/* Cidade & Bairro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>Província / Cidade</label>
                <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600 }} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                  <option value="Cabo Delgado">Cabo Delgado</option>
                  <option value="Gaza">Gaza</option>
                  <option value="Inhambane">Inhambane</option>
                  <option value="Manica">Manica</option>
                  <option value="Maputo (Cidade)">Maputo (Cidade)</option>
                  <option value="Maputo (Província)">Maputo (Província)</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Niassa">Niassa</option>
                  <option value="Sofala">Sofala</option>
                  <option value="Tete">Tete</option>
                  <option value="Zambézia">Zambézia</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>Bairro / Comunidade</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600 }} placeholder="Ex: Central" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} />
              </div>
            </div>

            {/* Cor da Equipa */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>Cor Principal da Equipa</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer', background: 'transparent' }} />
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>{formData.color}</span>
              </div>
            </div>

            {/* História / Biografia */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>História / Biografia do Clube</label>
              <textarea style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: 14, fontWeight: 600, resize: 'vertical' }} rows={3} placeholder="Descrição ou história do clube..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            {/* SEÇÃO PLANTEL DE JOGADORES */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 10 }} ref={playerFormRef}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="#00C853" /> Gestão do Plantel ({formData.players.length} Atletas)
              </h3>

              {/* Form de adicionar/editar jogador */}
              <div style={{ background: '#f1f5f9', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#008a38' }}>
                  {editingPlayerIdx !== null ? '✏️ Editar Jogador' : '➕ Adicionar Novo Jogador'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                  <input style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: 13, fontWeight: 600 }} placeholder="Nome Completo *" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
                  <input style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: 13, fontWeight: 600 }} type="number" placeholder="Nº" value={newPlayer.number} onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value })} />
                  <select style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: 13, fontWeight: 600 }} value={newPlayer.position} onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })}>
                    <option value="">Posição</option>
                    <option value="GK">Guarda-Redes</option>
                    <option value="DEF">Defesa</option>
                    <option value="MID">Médio</option>
                    <option value="FWD">Avançado</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', fontSize: 12, background: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}>
                    <Camera size={14} /> {uploadingPlayerPhoto ? 'A carregar...' : newPlayer.photo ? 'Foto Adicionada ✓' : 'Carregar Foto'}
                    <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'player')} />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({ ...newPlayer, isCaptain: e.target.checked })} />
                    Capitão 👑
                  </label>

                  <button type="button" onClick={handleAddOrUpdatePlayer} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', borderRadius: 10, background: '#00C853', color: '#000', fontWeight: 800 }}>
                    {editingPlayerIdx !== null ? 'Atualizar Jogador' : 'Guardar no Plantel'}
                  </button>
                </div>
              </div>

              {/* Lista dos Jogadores atuais */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {formData.players.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} color="#94a3b8" />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{p.name}</span>
                      {p.number && <span style={{ color: '#008a38', fontSize: 12, marginLeft: 8, fontWeight: 800 }}>#{p.number}</span>}
                      {p.isCaptain && <span style={{ marginLeft: 6 }}>👑</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" onClick={() => handleEditPlayer(idx)} className="btn btn-secondary btn-sm" style={{ padding: 6, background: '#f8fafc', borderColor: '#cbd5e1' }}><Pencil size={14} color="#0f172a" /></button>
                      <button type="button" onClick={() => handleRemovePlayer(idx)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444', padding: 6, background: '#f8fafc', borderColor: '#cbd5e1' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÕES FINAIS */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 700, height: 48, borderRadius: 12 }}>Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #00C853 0%, #00a843 100%)', color: '#ffffff', fontWeight: 800, height: 48, borderRadius: 12, border: 'none' }}>
                {saving ? <span className="spinner-xs" /> : <><Save size={18} /> Guardar Todas Alterações</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
