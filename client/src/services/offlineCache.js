const OFFLINE_PREFIX = 'bnz_offline_';

export const offlineCache = {
  // Salvar dados no cache offline
  set: (key, data) => {
    try {
      localStorage.setItem(`${OFFLINE_PREFIX}${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Erro ao salvar no cache offline:', err);
    }
  },

  // Obter dados do cache offline
  get: (key) => {
    try {
      const item = localStorage.getItem(`${OFFLINE_PREFIX}${key}`);
      if (!item) return null;
      const { data, timestamp } = JSON.parse(item);
      // Retorna dados se tiverem menos de 24 horas
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
      // Remove dados antigos
      localStorage.removeItem(`${OFFLINE_PREFIX}${key}`);
      return null;
    } catch (err) {
      console.error('Erro ao ler do cache offline:', err);
      return null;
    }
  },

  // Remover dados do cache
  remove: (key) => {
    try {
      localStorage.removeItem(`${OFFLINE_PREFIX}${key}`);
    } catch (err) {
      console.error('Erro ao remover do cache offline:', err);
    }
  },

  // Limpar todo o cache offline
  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(OFFLINE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (err) {
      console.error('Erro ao limpar cache offline:', err);
    }
  },

  // Salvar operação pendente para sincronização
  savePendingOperation: (operation) => {
    try {
      const pending = JSON.parse(localStorage.getItem(`${OFFLINE_PREFIX}pending_ops`) || '[]');
      pending.push({
        ...operation,
        id: Date.now(),
        timestamp: Date.now()
      });
      localStorage.setItem(`${OFFLINE_PREFIX}pending_ops`, JSON.stringify(pending));
    } catch (err) {
      console.error('Erro ao salvar operação pendente:', err);
    }
  },

  // Obter operações pendentes
  getPendingOperations: () => {
    try {
      return JSON.parse(localStorage.getItem(`${OFFLINE_PREFIX}pending_ops`) || '[]');
    } catch (err) {
      console.error('Erro ao ler operações pendentes:', err);
      return [];
    }
  },

  // Remover operação pendente
  removePendingOperation: (id) => {
    try {
      const pending = JSON.parse(localStorage.getItem(`${OFFLINE_PREFIX}pending_ops`) || '[]');
      const filtered = pending.filter(op => op.id !== id);
      localStorage.setItem(`${OFFLINE_PREFIX}pending_ops`, JSON.stringify(filtered));
    } catch (err) {
      console.error('Erro ao remover operação pendente:', err);
    }
  }
};
