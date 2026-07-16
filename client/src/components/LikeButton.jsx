import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';

const FLOATING_HEART_COLORS = [
  '#ff3c50', // red
  '#ff8a00', // orange
  '#00d2ff', // cyan
  '#00c853', // green
  '#ff007f', // pink
  '#e040fb', // purple
  '#ffd600'  // yellow
];

/**
 * LikeButton - Instagram-style burst on every click (unlimited likes)
 */
export default function LikeButton({ likes = 0, onLike, size = 'md', label, style, className = '' }) {
  const [animating, setAnimating] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [hearts, setHearts] = useState([]);

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    setBurstKey(k => k + 1);
    setTimeout(() => setAnimating(false), 550);

    // Spawn live stream floating hearts
    const newHearts = Array.from({ length: 6 }).map((_, i) => {
      const id = Date.now() + Math.random() + i;
      return {
        id,
        left: Math.random() * 40 - 20, // horizontal shift: -20px to 20px
        scale: Math.random() * 0.4 + 0.7, // scale: 0.7 to 1.1
        color: FLOATING_HEART_COLORS[Math.floor(Math.random() * FLOATING_HEART_COLORS.length)],
        delay: i * 0.08, // staggered animation start delay
        duration: Math.random() * 0.3 + 1.1 // float time: 1.1s to 1.4s
      };
    });

    setHearts(prev => [...prev, ...newHearts]);

    // Clear hearts after animations complete to prevent memory accumulation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 2000);

    onLike?.(e);
  }, [onLike]);

  return (
    <button
      type="button"
      className={`match-like-btn ${animating ? 'animating liked' : ''} ${className}`.trim()}
      onClick={handleClick}
      title="Gostar"
      style={style}
    >
      {animating && <span key={burstKey} className="heart-burst-ring" />}
      
      {/* Floating live hearts */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="live-floating-heart"
          style={{
            left: `calc(50% + ${h.left}px)`,
            color: h.color,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            transform: `scale(${h.scale})`,
            display: 'inline-flex'
          }}
        >
          <Heart size={14} fill={h.color} color={h.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }} />
        </span>
      ))}

      <span className="heart-icon">
        <Heart
          size={iconSize}
          fill={animating ? '#ff3c50' : 'none'}
          color={animating ? '#ff3c50' : 'currentColor'}
        />
      </span>
      {likes.toLocaleString('pt-PT')}
      {label ? ` ${label}` : ''}
    </button>
  );
}
