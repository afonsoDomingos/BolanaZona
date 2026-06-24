import { Eye } from 'lucide-react';
import LikeButton from './LikeButton';

/**
 * MatchLikeButton - views pill + unlimited Instagram-style likes
 */
export default function MatchLikeButton({ likes = 0, views = 0, onLike, size = 'md' }) {
  const iconSize = size === 'sm' ? 10 : 11;

  return (
    <div className={`match-stats-row${size === 'sm' ? ' match-stats-row--sm' : ''}`}>
      <span className="match-view-pill">
        <Eye size={iconSize} />
        {views.toLocaleString('pt-PT')}
      </span>
      <LikeButton likes={likes} onLike={onLike} size={size} />
    </div>
  );
}
