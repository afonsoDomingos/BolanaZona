import { useEffect, useState } from 'react';
import { MessageSquare, Trophy, Star, Heart, Send, Plus, Users, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('text'); // text, score, goal
  const [content, setContent] = useState('');
  const [scoreData, setScoreData] = useState({ teamA: '', teamB: '', scoreA: 0, scoreB: 0 });
  const [sending, setSending] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch { toast.error('Erro ao carregar o mural.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000); // Polling simples a cada 15s
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async () => {
    if (!user) return toast.error('Faz login para participar no mural! ⚽');
    if (activeMode === 'text' && !content) return toast.error('Escreve alguma coisa!');
    if (activeMode === 'score' && (!scoreData.teamA || !scoreData.teamB)) return toast.error('Preenche as equipas!');

    setSending(true);
    try {
      await api.post('/posts', {
        type: activeMode,
        content: content || (activeMode === 'goal' ? 'GOOOOOOOOOLO! ⚽🔥' : ''),
        scoreData: activeMode === 'score' ? scoreData : null
      });
      setContent('');
      setScoreData({ teamA: '', teamB: '', scoreA: 0, scoreB: 0 });
      setActiveMode('text');
      fetchPosts();
      toast.success('Publicado no mural! 🚀');
    } catch {
      toast.error('Erro ao publicar.');
    } finally { setSending(false); }
  };

  const toggleLike = async (postId) => {
    if (!user) return toast.error('Faz login para dar like! ❤️');
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch { toast.error('Erro ao reagir.'); }
  };

  return (
    <div className="page animate-fade-in" style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Mundo do Futebol Live</span>
          </div>
          <h1 className="font-syne" style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
            Mural da <span className="gradient-text">Malta</span> 🏟️
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Onde o futebol nunca para. Comenta jogos, partilha placares e vibra com a comunidade.</p>
        </header>

        {/* POST CREATOR */}
        {user && (
          <div className="card" style={{ padding: 20, marginBottom: 40, border: '1px solid rgba(0, 200, 83, 0.2)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button 
                onClick={() => setActiveMode('text')}
                className={`tab ${activeMode === 'text' ? 'active' : ''}`}
                style={{ flex: 1, borderRadius: 12, fontSize: 13 }}
              >
                <MessageSquare size={16} /> Texto
              </button>
              <button 
                onClick={() => setActiveMode('score')}
                className={`tab ${activeMode === 'score' ? 'active' : ''}`}
                style={{ flex: 1, borderRadius: 12, fontSize: 13 }}
              >
                <Trophy size={16} /> Placar
              </button>
              <button 
                onClick={() => setActiveMode('goal')}
                className={`tab ${activeMode === 'goal' ? 'active' : ''}`}
                style={{ flex: 1, borderRadius: 12, fontSize: 13 }}
              >
                <Zap size={16} /> GOLO!
              </button>
            </div>

            {activeMode === 'text' && (
              <textarea 
                className="form-input" 
                placeholder="Como está o jogo? Alguém a ver o Barça? Fala aqui! ⚽🔥"
                style={{ minHeight: 80, borderRadius: 16, padding: 16, fontSize: 15 }}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            )}

            {activeMode === 'score' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input className="form-input" placeholder="Equipa A" value={scoreData.teamA} onChange={e => setScoreData({...scoreData, teamA: e.target.value})} />
                  <input type="number" className="form-input" style={{ width: 70, textAlign: 'center' }} value={scoreData.scoreA} onChange={e => setScoreData({...scoreData, scoreA: parseInt(e.target.value)})} />
                  <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>VS</span>
                  <input type="number" className="form-input" style={{ width: 70, textAlign: 'center' }} value={scoreData.scoreB} onChange={e => setScoreData({...scoreData, scoreB: parseInt(e.target.value)})} />
                  <input className="form-input" placeholder="Equipa B" value={scoreData.teamB} onChange={e => setScoreData({...scoreData, teamB: e.target.value})} />
                </div>
              </div>
            )}

            {activeMode === 'goal' && (
              <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0, 200, 83, 0.05)', borderRadius: 16, border: '1px dashed var(--green)' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }} className="spin-slow">⚽🔥</div>
                <h3 style={{ fontWeight: 800, color: 'var(--green)', marginBottom: 16 }}>ESCOLHE A TUA CELEBRAÇÃO!</h3>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setContent('GOOOOOOOOOLO! ⚽🔥'); handleCreatePost(); }} className="btn btn-secondary" style={{ borderRadius: 100 }}>Padrão ⚽</button>
                  <button onClick={() => { setContent('HALA MADRID! ⚪👑'); handleCreatePost(); }} className="btn btn-secondary" style={{ borderRadius: 100, borderColor: '#fff', color: '#fff' }}>Hala Madrid ⚪</button>
                  <button onClick={() => { setContent('VISCA BARÇA! 🔴🔵'); handleCreatePost(); }} className="btn btn-secondary" style={{ borderRadius: 100, borderColor: '#ff4d4d', color: '#ff4d4d' }}>Visca Barça 🔵</button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleCreatePost} disabled={sending} style={{ padding: '0 32px', height: 48, borderRadius: 12 }}>
                {sending ? 'A publicar...' : 'Publicar no Mural'} <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state"><h3>O mural está vazio...</h3><p>Sê o primeiro a comentar!</p></div>
          ) : posts.map(post => (
            <div key={post._id} className="card animate-slide-up" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
              
              {/* Background celebration for GOAL type */}
              {post.type === 'goal' && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, var(--green), transparent, var(--green))' }} />
              )}

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {post.user?.avatar ? <img src={post.user.avatar} style={{ width: '100%', height: '100%', borderRadius: 12 }} /> : '👤'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{post.user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>

              {post.type === 'text' && (
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#fff' }}>{post.content}</p>
              )}

              {post.type === 'score' && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  padding: 20, 
                  borderRadius: 16, 
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 20
                }}>
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: 800 }}>{post.scoreData.teamA}</div>
                  <div style={{ background: 'var(--green)', color: '#000', fontWeight: 900, padding: '4px 16px', borderRadius: 8, fontSize: 20 }}>
                    {post.scoreData.scoreA} - {post.scoreData.scoreB}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{post.scoreData.teamB}</div>
                </div>
              )}

              {post.type === 'goal' && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '32px 0', 
                  background: post.content.includes('MADRID') ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)' : 
                              post.content.includes('BARÇA') ? 'linear-gradient(135deg, rgba(255,77,77,0.1) 0%, transparent 100%)' :
                              'linear-gradient(135deg, rgba(0,200,83,0.1) 0%, transparent 100%)',
                  borderRadius: 16
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', letterSpacing: 4, marginBottom: 8 }}>VIBRAÇÃO TOTAL</div>
                  <h2 className="font-syne" style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{post.content}</h2>
                </div>
              )}

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
                <button 
                  onClick={() => toggleLike(post._id)}
                  style={{ 
                    background: 'none', border: 'none', color: post.likes?.includes(user?._id) ? 'var(--red)' : 'var(--text-muted)', 
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' 
                  }}
                >
                  <Heart size={18} fill={post.likes?.includes(user?._id) ? 'var(--red)' : 'none'} /> {post.likes?.length || 0} Curtidas
                </button>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {post.type === 'score' ? '📢 Atualização de Resultado' : post.type === 'goal' ? '🔥 Celebração' : '💬 Comentário'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
