import { Calendar } from 'lucide-react';

/** Compact scheduled label: calendar icon + "Ag." */
export default function ScheduledBadge({ size = 'sm' }) {
  const iconSize = size === 'xs' ? 7 : 8;
  return (
    <span className={`scheduled-badge scheduled-badge--${size}`} title="Agendado">
      <Calendar size={iconSize} strokeWidth={2.5} />
      Ag.
    </span>
  );
}
