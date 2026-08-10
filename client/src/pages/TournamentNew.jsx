import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Trophy, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = ['Informações', 'Formato', 'Revisão'];
const formatOptions = [
  { value: 'groups', label: '📊 Fase de Grupos', desc: 'Todos jogam entre si. Classificação por pontos.' },
  { value: 'knockout', label: '⚔️ Mata-mata', desc: 'Eliminação direta. Perde e sai.' },
  { value: 'groups_knockout', label: '🏆 Grupos + Mata-mata', desc: 'Fase de grupos seguida de eliminatórias.' },
  { value: 'league', label: '⚡ Liga / Amigável', desc: 'Jogos individuais ou liga contínua.' },
];

export default function TournamentNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', neighborhood: '', location: '', province: 'Maputo Cidade', description: '',
    format: 'groups', maxTeams: 8, startDate: '', prize: '', registrationFee: 0, contactLink: '',
  });

  const provinces = [
    'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 
    'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'
  ];

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/tournaments', form);
      toast.success('Torneio criado com sucesso! 🎉');
      navigate(`/dashboard/tournaments/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao criar torneio.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800 }}>Criar Torneio</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Preenche os detalhes do teu torneio</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 4, borderRadius: 4, background: i <= step ? 'var(--green)' : 'var(--border)', transition: 'all 0.3s' }} />
              <span style={{ fontSize: 12, color: i === step ? 'var(--green)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="card animate-slide-up">
          {/* STEP 0: Informações */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Informações do Torneio</h2>
              <div className="form-group">
                <label className="form-label">Nome do Torneio *</label>
                <input className="form-input" placeholder="Ex: Copa do Bairro 2026" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label className="form-label">Província *</label>
                  <select className="form-select" value={form.province} onChange={e => set('province', e.target.value)} required>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bairro *</label>
                  <input className="form-input" placeholder="Ex: Maxaquene" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Local / Campo *</label>
                  <input className="form-input" placeholder="Ex: Campo do Maxaquene" value={form.location} onChange={e => set('location', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nº de Equipas *</label>
                  <select className="form-select" value={form.maxTeams} onChange={e => set('maxTeams', Number(e.target.value))}>
                    {[4,6,8,10,12,16,20,24,32].map(n => <option key={n} value={n}>{n} equipas</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Início</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                </div>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Taxa de Inscrição (MT)</label>
                  <input type="number" className="form-input" placeholder="Ex: 500" value={form.registrationFee} onChange={e => set('registrationFee', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Prémio / Troféu</label>
                  <input className="form-input" placeholder="Ex: Taça + 50.000 MT" value={form.prize} onChange={e => set('prize', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Link de Comunicação (WhatsApp / Telegram)</label>
                <input className="form-input" placeholder="Ex: https://chat.whatsapp.com/..." value={form.contactLink} onChange={e => set('contactLink', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-input" placeholder="Descreve o torneio..." rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* STEP 1: Formato */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Formato da Competição</h2>
              {formatOptions.map(f => (
                <div key={f.value} onClick={() => set('format', f.value)}
                  style={{ padding: 20, borderRadius: 'var(--radius)', border: `2px solid ${form.format === f.value ? 'var(--green)' : 'var(--border)'}`, background: form.format === f.value ? 'var(--green-subtle)' : 'var(--bg-card)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{f.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{f.desc}</div>
                  {form.format === f.value && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ Selecionado</div>}
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: Revisão */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Confirmar e Criar</h2>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['🏆 Nome', form.name],
                  ['📍 Bairro', form.neighborhood],
                  ['🏟️ Local', form.location],
                  ['👥 Equipas', `${form.maxTeams} equipas`],
                  ['📊 Formato', formatOptions.find(f => f.value === form.format)?.label],
                  form.prize && ['🥇 Prémio', form.prize],
                  form.startDate && ['📅 Início', new Date(form.startDate).toLocaleDateString('pt-PT')],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="alert alert-success">
                ✅ Tudo pronto! Após criar, podes adicionar equipas e gerar o calendário.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft size={15} /> Anterior
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                if (form.startDate && form.startDate < today) {
                  return toast.error('A data de início não pode ser no passado.');
                }
                setStep(s => s + 1);
              }}
                disabled={step === 0 && (!form.name || !form.neighborhood || !form.location)}>
                Próximo <ArrowRight size={15} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'A criar...' : <><Trophy size={15} /> Criar Torneio</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
