import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import useOffline from '../hooks/useOffline';
import { offlineCache } from '../services/offlineCache';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function OfflineIndicator() {
  const isOffline = useOffline();
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const updatePendingCount = () => {
    const pending = offlineCache.getPendingOperations();
    setPendingCount(pending.length);
  };

  const syncPendingOperations = async () => {
    if (isOffline) return;
    
    setSyncing(true);
    const pending = offlineCache.getPendingOperations();
    
    if (pending.length === 0) {
      setSyncing(false);
      return;
    }

    let synced = 0;
    let failed = 0;

    for (const op of pending) {
      try {
        switch (op.type) {
          case 'POST':
            await api.post(op.endpoint, op.data);
            break;
          case 'PUT':
            await api.put(op.endpoint, op.data);
            break;
          case 'DELETE':
            await api.delete(op.endpoint);
            break;
        }
        offlineCache.removePendingOperation(op.id);
        synced++;
      } catch (err) {
        failed++;
        console.error('Erro ao sincronizar operação:', err);
      }
    }

    updatePendingCount();
    setSyncing(false);

    if (synced > 0) {
      toast.success(`${synced} alterações sincronizadas com sucesso!`);
    }
    if (failed > 0) {
      toast.error(`${failed} alterações não puderam ser sincronizadas`);
    }
  };

  useEffect(() => {
    if (!isOffline && pendingCount > 0) {
      syncPendingOperations();
    }
  }, [isOffline]);

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      right: 20,
      maxWidth: 400,
      margin: '0 auto',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {isOffline && (
        <div style={{
          background: 'rgba(255, 68, 68, 0.95)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 4px 20px rgba(255, 68, 68, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <WifiOff size={20} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Sem Conexão à Internet</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>Algumas funcionalidades podem estar limitadas</div>
          </div>
        </div>
      )}

      {!isOffline && pendingCount > 0 && (
        <div style={{
          background: 'rgba(0, 200, 83, 0.95)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 4px 20px rgba(0, 200, 83, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <Wifi size={20} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {pendingCount} alteração{pendingCount !== 1 ? 'ões' : ''} pendente{pendingCount !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>Sincronizando automaticamente...</div>
          </div>
          {syncing && (
            <div className="spinner" style={{ width: 16, height: 16, borderColor: '#fff' }} />
          )}
        </div>
      )}
    </div>
  );
}
