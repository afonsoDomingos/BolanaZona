/** Shared helpers for link and image sharing across the app */

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function openWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export function canNativeShare({ withFiles = false } = {}) {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  if (!withFiles) return true;
  if (!navigator.canShare) return false;
  try {
    const probe = new File([''], 'share.png', { type: 'image/png' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function nativeShare({ title, text, url, blob, fileName = 'bolanazona.png' }) {
  const payload = {};
  if (title) payload.title = title;
  if (text) payload.text = text;
  if (url && !blob) payload.url = url;

  if (blob) {
    const file = blob instanceof File
      ? blob
      : new File([blob], fileName, { type: blob.type || 'image/png' });
    payload.files = [file];
    if (!payload.text && text) payload.text = text;
  }

  await navigator.share(payload);
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function buildTournamentShareText(tournament, url) {
  const location = [tournament.location, tournament.neighborhood].filter(Boolean).join(', ');
  return (
    `🏆 *${tournament.name}* — Bola na Zona\n\n` +
    (location ? `📍 ${location}\n\n` : '') +
    `📊 Acompanha classificação, jogos e resultados em tempo real:\n${url}`
  );
}

export function buildMatchShareText(match, tournament, url) {
  const homeName = match.homeTeam?.name || 'Casa';
  const awayName = match.awayTeam?.name || 'Fora';
  const scoreText = match.status === 'finished' ? `*${match.homeScore} - ${match.awayScore}*` : 'vs';

  let eventsText = '';
  if (match.events?.length > 0) {
    eventsText =
      '\n⚽ *Golos/Cartões:*\n' +
      match.events
        .map((e) => {
          const icon = e.type === 'goal' ? '⚽' : e.type === 'yellow_card' ? '🟨' : '🟥';
          const side = e.team === match.homeTeam?._id ? homeName : awayName;
          return `${icon} ${e.playerName} (${side})`;
        })
        .join('\n');
  }

  return (
    `🏆 *BOLA NA ZONA*\n\n` +
    `🏟️ *Torneio:* ${tournament.name}\n` +
    `⚔️ *Jogo:* ${homeName} ${scoreText} ${awayName}\n` +
    (match.roundName ? `🏁 *Fase:* ${match.roundName}\n` : '') +
    (match.location || tournament.location ? `📍 *Local:* ${match.location || tournament.location}\n` : '') +
    (match.referee ? `👨‍⚖️ *Árbitro:* ${match.referee}\n` : '') +
    eventsText +
    `\n\n📊 *Ver torneio:* ${url}`
  );
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
