import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trophy, Heart, Send, Zap, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('text'); // text, score, goal
  const [content, setContent] = useState('');
  const [scoreData, setScoreData] = useState({ teamA: '', teamB: '', scoreA: 0, scoreB: 0, period: 'FT', matchTime: '' });
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch { toast.error('Erro ao carregar o mural.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [posts]);

  const handleCreatePost = async (overrideContent = null) => {
    const finalContent = overrideContent || content;
    if (!user) return toast.error('Faz login para participar no mural! ⚽');
    if (activeMode === 'text' && !finalContent) return toast.error('Escreve alguma coisa!');
    if (activeMode === 'score' && (!scoreData.teamA || !scoreData.teamB)) return toast.error('Preenche as equipas!');

    setSending(true);
    try {
      await api.post('/posts', {
        type: activeMode,
        content: finalContent || (activeMode === 'goal' ? 'GOOOOOOOOOLO! ⚽🔥' : ''),
        scoreData: activeMode === 'score' ? scoreData : null
      });
      setContent('');
      setScoreData({ teamA: '', teamB: '', scoreA: 0, scoreB: 0, period: 'FT', matchTime: '' });
      setActiveMode('text');
      fetchPosts();
      toast.success('Publicado no mural! 🚀');
    } catch {
      toast.error('Erro ao publicar.');
    } finally { setSending(false); }
  };

  const toggleLike = async (postId) => {
    if (!user) {
      toast('Faz login para poderes reagir! ❤️', { icon: '🤝' });
      return;
    }
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch {
      toast.error('Erro ao reagir.');
    }
  };
 
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Queres mesmo eliminar esta publicação?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Publicação eliminada.');
      fetchPosts();
    } catch {
      toast.error('Erro ao eliminar.');
    }
  };

  return (
    <div className="page animate-fade-in" style={{ 
      background: 'var(--bg-primary)', 
      height: 'calc(100dvh - 64px)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div className="container" style={{ 
        maxWidth: 700, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '0 12px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* COMPACT HEADER */}
        <header style={{ 
          padding: '8px 0', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
              Mural da <span className="gradient-text">Malta</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Live</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 10, maxWidth: 150, textAlign: 'right', lineHeight: 1.2 }}>Vibra com a comunidade em tempo real.</p>
        </header>

        {/* SCROLLABLE FEED */}
        <div 
          ref={scrollRef}
          style={{ 
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '20px 12px 20px 0',
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain'
        }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state"><h3>A conversa ainda não começou...</h3><p>Diz o primeiro "Olá"!</p></div>
          ) : posts.map((post, i) => {
            const isMe = user && post.user?._id === user._id;
            const showName = !isMe && (i === 0 || posts[i-1].user?._id !== post.user?._id);
            
            return (
              <div key={post._id} className="animate-slide-up" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                width: '100%',
                marginTop: showName ? 8 : 2
              }}>
                {showName && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', marginBottom: 2, marginLeft: 4 }}>
                    {post.user?.name || 'Utilizador'}
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  gap: 8,
                  maxWidth: '85%'
                }}>
                  {/* Bubble */}
                  <div style={{ 
                    background: isMe ? 'var(--green)' : 'rgba(255,255,255,0.08)',
                    color: isMe ? '#000' : '#fff',
                    padding: '8px 12px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid ' + (isMe ? 'transparent' : 'rgba(255,255,255,0.05)')
                  }}>
                    {post.type === 'text' && (
                      <p style={{ fontSize: 14, lineHeight: 1.4, margin: 0 }}>{post.content}</p>
                    )}

                    {post.type === 'score' && (
                      <div style={{ 
                        background: 'rgba(0,0,0,0.1)', 
                        padding: '8px 10px', 
                        borderRadius: 8, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        gap: 4,
                        marginTop: 2
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 12 }}>{post.scoreData.teamA}</span>
                          <span style={{ background: isMe ? '#000' : 'var(--green)', color: isMe ? 'var(--green)' : '#000', padding: '1px 6px', borderRadius: 4, fontWeight: 900, fontSize: 12 }}>
                            {post.scoreData.scoreA}-{post.scoreData.scoreB}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 12 }}>{post.scoreData.teamB}</span>
                        </div>
                        {post.scoreData.period && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>
                              {post.scoreData.period === 'PR' ? 'Pré-jogo' :
                               post.scoreData.period === '1T' ? '1ª Parte' : 
                               post.scoreData.period === '2T' ? '2ª Parte' : 'Finalizado'}
                            </span>
                            {post.scoreData.matchTime && (
                              <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.5 }}>
                                • 🕒 {post.scoreData.matchTime}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {post.type === 'goal' && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '10px', 
                        background: post.content.includes('MADRID') ? '#fff' : 
                                    post.content.includes('BARÇA') ? 'linear-gradient(90deg, #a50044, #004d98)' :
                                    '#00C853',
                        borderRadius: 10,
                        marginTop: 2,
                        minWidth: 150
                      }}>
                        <h4 style={{ margin: 0, fontSize: 15, color: post.content.includes('MADRID') ? '#000' : '#fff' }} className="pulse-text">{post.content}</h4>
                      </div>
                    )}

                    <div style={{ 
                      marginTop: 4, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      gap: 6,
                      opacity: 0.5
                    }}>
                      <button 
                        onClick={() => toggleLike(post._id)}
                        style={{ 
                          background: 'none', border: 'none', 
                          color: post.likes?.includes(user?._id) ? (isMe ? '#000' : 'var(--red)') : 'inherit', 
                          display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, fontWeight: 700, cursor: 'pointer' 
                        }}
                      >
                        <Heart size={10} fill={post.likes?.includes(user?._id) ? (isMe ? '#000' : 'var(--red)') : 'none'} /> {post.likes?.length || 0}
                      </button>
                      {(isMe || user?.role === 'superadmin') && (
                        <button 
                          onClick={() => handleDeletePost(post._id)}
                          style={{ background: 'none', border: 'none', color: isMe ? '#000' : 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.6 }}
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(post.createdAt).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FIXED INPUT BAR */}
        <div style={{ 
          padding: '8px 0 12px', 
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-primary)'
        }}>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '8px 0', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: 12 }}>Inicia sessão para comentar!</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ height: 28, fontSize: 11 }}>Entrar</Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ height: 28, fontSize: 11 }}>Criar Conta</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setActiveMode('text')} className={`tab ${activeMode === 'text' ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 10, borderRadius: 6, padding: 0 }}>
                  <MessageSquare size={12} /> Texto
                </button>
                <button onClick={() => setActiveMode('score')} className={`tab ${activeMode === 'score' ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 10, borderRadius: 6, padding: 0 }}>
                  <Trophy size={12} /> Placar
                </button>
                <button onClick={() => setActiveMode('goal')} className={`tab ${activeMode === 'goal' ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 10, borderRadius: 6, padding: 0 }}>
                  <Zap size={12} /> GOLO
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  {activeMode === 'text' && (
                    <textarea 
                      className="form-input" 
                      placeholder="Escreve uma mensagem..."
                      style={{ minHeight: 36, maxHeight: 100, borderRadius: 10, padding: '8px 12px', fontSize: 13 }}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                    />
                  )}

                  {activeMode === 'score' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
                        {['⚽', '🏆', '🔥', '⚔️', '🏁', '🛡️'].map(emoji => (
                          <button 
                            key={emoji}
                            onClick={() => {
                              if (!scoreData.teamA) setScoreData({...scoreData, teamA: emoji + ' '});
                              else if (!scoreData.teamB) setScoreData({...scoreData, teamB: emoji + ' '});
                            }}
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 4, 
                              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, cursor: 'pointer'
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                        <input className="form-input" placeholder="Equipa A" style={{ height: 28, fontSize: 11, padding: '0 6px' }} value={scoreData.teamA} onChange={e => setScoreData({...scoreData, teamA: e.target.value})} />
                        <input type="number" className="form-input" style={{ width: 35, height: 28, textAlign: 'center', fontSize: 11, padding: 0 }} value={scoreData.scoreA} onChange={e => setScoreData({...scoreData, scoreA: parseInt(e.target.value)})} />
                        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>vs</span>
                        <input type="number" className="form-input" style={{ width: 35, height: 28, textAlign: 'center', fontSize: 11, padding: 0 }} value={scoreData.scoreB} onChange={e => setScoreData({...scoreData, scoreB: parseInt(e.target.value)})} />
                        <input className="form-input" placeholder="Equipa B" style={{ height: 28, fontSize: 11, padding: '0 6px' }} value={scoreData.teamB} onChange={e => setScoreData({...scoreData, teamB: e.target.value})} />
                        <input type="text" className="form-input" placeholder="15:30" style={{ width: 50, height: 28, fontSize: 10, padding: '0 4px', textAlign: 'center' }} value={scoreData.matchTime} onChange={e => setScoreData({...scoreData, matchTime: e.target.value})} />
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['PR', '1T', '2T', 'FT'].map(p => (
                          <button 
                            key={p} 
                            onClick={() => setScoreData({...scoreData, period: p})}
                            style={{ 
                              flex: 1, height: 20, fontSize: 8, borderRadius: 4, 
                              background: scoreData.period === p ? 'var(--green)' : 'rgba(255,255,255,0.05)',
                              color: scoreData.period === p ? '#000' : 'var(--text-muted)',
                              border: 'none', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            {p === 'PR' ? 'Pré' : p === '1T' ? '1ª P' : p === '2T' ? '2ª P' : 'Final'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMode === 'goal' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleCreatePost('GOOOOOOOOOLO! ⚽🔥')} className="btn btn-secondary" style={{ flex: 1, height: 32, fontSize: 9, borderRadius: 8 }}>Geral</button>
                      <button onClick={() => handleCreatePost('HALA MADRID! ⚪👑')} className="btn btn-secondary" style={{ flex: 1, height: 32, fontSize: 9, borderRadius: 8, borderColor: '#fff' }}>Madrid</button>
                      <button onClick={() => handleCreatePost('VISCA BARÇA! 🔴🔵')} className="btn btn-secondary" style={{ flex: 1, height: 32, fontSize: 9, borderRadius: 8, borderColor: '#ff4d4d' }}>Barça</button>
                    </div>
                  )}
                </div>

                {activeMode !== 'goal' && (
                  <button 
                    onClick={() => handleCreatePost()} 
                    className="btn btn-primary" 
                    disabled={sending}
                    style={{ width: 36, height: 36, borderRadius: 10, padding: 0, justifyContent: 'center', flexShrink: 0 }}
                  >
                    {sending ? <span className="spinner" style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent' }} /> : <Send size={18} />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .pulse-text { animation: pulse-text 2s ease-in-out infinite; }
        @keyframes pulse-text {
          0%, 100% { transform: scale(1); text-shadow: 0 0 10px rgba(255,255,255,0); }
          50% { transform: scale(1.05); text-shadow: 0 0 20px rgba(255,255,255,0.4); }
        }

        .bounce-animation { animation: bounce 2s infinite; }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }

        .celebration-particles {
          position: absolute; inset: 0; pointer-events: none;
          display: flex; justify-content: space-around; align-items: flex-end;
        }
        .celebration-particles span {
          font-size: 24px;
          animation: float-up var(--d, 3s) linear infinite;
          opacity: 0;
          transform: translateY(100%);
        }
        .celebration-particles span:nth-child(1) { --d: 3s; animation-delay: 0s; left: 10%; }
        .celebration-particles span:nth-child(2) { --d: 4s; animation-delay: 1s; left: 30%; }
        .celebration-particles span:nth-child(3) { --d: 2.5s; animation-delay: 0.5s; left: 50%; }
        .celebration-particles span:nth-child(4) { --d: 3.5s; animation-delay: 1.5s; left: 70%; }
        .celebration-particles span:nth-child(5) { --d: 4.5s; animation-delay: 2s; left: 90%; }

        @keyframes float-up {
          0% { transform: translateY(100%) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-200%) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
