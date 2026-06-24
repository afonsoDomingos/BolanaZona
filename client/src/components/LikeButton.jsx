import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';

/**
 * LikeButton - Instagram-style burst on every click (unlimited likes)
 */
export default function LikeButton({ likes = 0, onLike, size = 'md', label, style, className = '' }) {
  const [animating, setAnimating] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    setBurstKey(k => k + 1);
    setTimeout(() => setAnimating(false), 550);
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
