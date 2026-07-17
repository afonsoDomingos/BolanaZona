const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// Configurar VAPID keys (estas devem ser definidas nas variáveis de ambiente)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:contact@bolanazona.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    
    // Remover subscription anterior se existir
    await PushSubscription.deleteOne({ user: req.user._id, endpoint });
    
    // Criar nova subscription
    const subscription = await PushSubscription.create({
      user: req.user._id,
      endpoint,
      keys
    });
    
    res.json({ message: 'Subscrição realizada com sucesso', subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.deleteOne({ user: req.user._id, endpoint });
    res.json({ message: 'Subscrição removida com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const subscriptions = await PushSubscription.find({ user: userId });
    
    if (subscriptions.length === 0) {
      console.log('Nenhuma subscription encontrada para o utilizador');
      return;
    }
    
    const payload = JSON.stringify({
      notification: {
        title,
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        data
      }
    });
    
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        // Se a subscription expirou, remover
        if (err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
        console.error('Erro ao enviar push:', err);
      }
    }
  } catch (err) {
    console.error('Erro ao enviar notificação push:', err);
  }
};

exports.getVapidPublicKey = async (req, res) => {
  try {
    res.json({ publicKey: vapidKeys.publicKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
