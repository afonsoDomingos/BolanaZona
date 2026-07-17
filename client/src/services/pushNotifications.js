// Service Worker Registration para Push Notifications
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration);
      return registration;
    } catch (err) {
      console.error('Erro ao registrar Service Worker:', err);
      return null;
    }
  }
  return null;
};

// Solicitar permissão para notificações
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Subscrever para push notifications
export const subscribeToPush = async (registration) => {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY)
    });
    
    // Enviar subscription para o servidor
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscription)
    });
    
    return subscription;
  } catch (err) {
    console.error('Erro ao subscrever para push:', err);
    return null;
  }
};

// Converter VAPID key para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Enviar notificação local (para testes)
export const sendLocalNotification = (title, body, icon = '/favicon.svg') => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon,
      badge: '/favicon.svg',
      vibrate: [200, 100, 200]
    });
  }
};

// Verificar se push notifications são suportados
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};
