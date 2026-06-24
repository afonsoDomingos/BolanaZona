import { useState } from 'react';
import { X, Copy, Share2, Download, MessageCircle, Instagram, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  copyToClipboard,
  openWhatsApp,
  canNativeShare,
  nativeShare,
  downloadBlob,
} from '../utils/shareUtils';

export default function ShareModal({
  onClose,
  url,
  title = 'Partilhar',
  subtitle,
  shareText,
  imageBlob = null,
  imagePreviewUrl = null,
  imageFileName = 'bolanazona.png',
}) {
  const [busy, setBusy] = useState(null);
  const message = shareText || url;
  const nativeAvailable = canNativeShare({ withFiles: false });
  const nativeImageAvailable = !!imageBlob && canNativeShare({ withFiles: true });

  const run = async (key, fn) => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err);
        toast.error('Não foi possível partilhar.');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleCopyLink = () =>
    run('copy', async () => {
      const ok = await copyToClipboard(url);
      if (ok) {
        toast.success('Link copiado!');
        onClose();
      } else {
        toast.error('Não foi possível copiar o link.');
      }
    });

  const handleWhatsApp = () =>
    run('whatsapp', async () => {
      openWhatsApp(message);
      toast.success('A abrir WhatsApp…');
      onClose();
    });

  const handleNativeShare = () =>
    run('native', async () => {
      await nativeShare({ title, text: message, url });
      toast.success('Partilhado!');
      onClose();
    });

  const handleNativeImageShare = () =>
    run('native-image', async () => {
      await nativeShare({
        title,
        text: message,
        blob: imageBlob,
        fileName: imageFileName,
      });
      toast.success('Escolhe WhatsApp ou Stories!');
      onClose();
    });

  const handleWhatsAppImage = () =>
    run('whatsapp-image', async () => {
      if (nativeImageAvailable) {
        await nativeShare({ title, text: message, blob: imageBlob, fileName: imageFileName });
        toast.success('Escolhe WhatsApp na lista!');
        onClose();
        return;
      }
      openWhatsApp(message);
      downloadBlob(imageBlob, imageFileName);
      toast.success('Texto aberto no WhatsApp. Imagem guardada — anexa no chat.');
      onClose();
    });

  const handleStoriesShare = () =>
    run('stories', async () => {
      if (nativeImageAvailable) {
        await nativeShare({ title, text: message, blob: imageBlob, fileName: imageFileName });
        toast.success('Escolhe Instagram ou Stories!');
        onClose();
        return;
      }
      downloadBlob(imageBlob, imageFileName);
      toast.success('Imagem guardada. Abre Instagram e partilha nos Stories.');
      onClose();
    });

  const handleDownload = () =>
    run('download', async () => {
      downloadBlob(imageBlob, imageFileName);
      toast.success('Imagem guardada!');
      onClose();
    });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {imagePreviewUrl && (
          <div className="share-modal-preview">
            <img src={imagePreviewUrl} alt="Pré-visualização" />
          </div>
        )}

        <div className="share-modal-url">
          <Link2 size={14} />
          <span>{url}</span>
        </div>

        <div className="share-modal-actions">
          <button type="button" className="share-action-btn" onClick={handleCopyLink} disabled={!!busy}>
            <span className="share-action-icon share-action-icon--copy"><Copy size={18} /></span>
            <span className="share-action-label">Copiar link</span>
          </button>

          <button type="button" className="share-action-btn" onClick={handleWhatsApp} disabled={!!busy}>
            <span className="share-action-icon share-action-icon--whatsapp"><MessageCircle size={18} /></span>
            <span className="share-action-label">WhatsApp</span>
          </button>

          {nativeAvailable && (
            <button type="button" className="share-action-btn" onClick={handleNativeShare} disabled={!!busy}>
              <span className="share-action-icon share-action-icon--native"><Share2 size={18} /></span>
              <span className="share-action-label">Partilhar</span>
            </button>
          )}
        </div>

        {imageBlob && (
          <>
            <div className="share-modal-divider">Partilhar imagem</div>
            <div className="share-modal-actions">
              <button type="button" className="share-action-btn" onClick={handleWhatsAppImage} disabled={!!busy}>
                <span className="share-action-icon share-action-icon--whatsapp"><MessageCircle size={18} /></span>
                <span className="share-action-label">WhatsApp</span>
              </button>

              <button type="button" className="share-action-btn" onClick={handleStoriesShare} disabled={!!busy}>
                <span className="share-action-icon share-action-icon--instagram"><Instagram size={18} /></span>
                <span className="share-action-label">Stories</span>
              </button>

              {nativeImageAvailable && (
                <button type="button" className="share-action-btn" onClick={handleNativeImageShare} disabled={!!busy}>
                  <span className="share-action-icon share-action-icon--native"><Share2 size={18} /></span>
                  <span className="share-action-label">Mais opções</span>
                </button>
              )}

              <button type="button" className="share-action-btn" onClick={handleDownload} disabled={!!busy}>
                <span className="share-action-icon share-action-icon--download"><Download size={18} /></span>
                <span className="share-action-label">Guardar PNG</span>
              </button>
            </div>
          </>
        )}

        <p className="share-modal-hint">
          {imageBlob
            ? 'No telemóvel podes enviar a imagem directamente para WhatsApp ou Stories.'
            : 'Partilha o link para adeptos acompanharem o torneio.'}
        </p>
      </div>
    </div>
  );
}
