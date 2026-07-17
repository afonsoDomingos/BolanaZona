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
    console.log('🔔 [Push] Tentando enviar notificação push para userId:', userId);
    console.log('🔔 [Push] Título:', title, 'Body:', body);
    
    const subscriptions = await PushSubscription.find({ user: userId });
    
    if (subscriptions.length === 0) {
      console.log('⚠️ [Push] Nenhuma subscription encontrada para o utilizador:', userId);
      return;
    }
    
    console.log('✅ [Push] Encontradas', subscriptions.length, 'subscriptions para o utilizador');
    
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
    
    let successCount = 0;
    let failCount = 0;
    
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        successCount++;
        console.log('✅ [Push] Notificação enviada com sucesso para subscription:', sub._id);
      } catch (err) {
        failCount++;
        // Se a subscription expirou, remover
        if (err.statusCode === 410) {
          console.log('🗑️ [Push] Subscription expirada, removendo:', sub._id);
          await PushSubscription.deleteOne({ _id: sub._id });
        }
        console.error('❌ [Push] Erro ao enviar push para subscription:', sub._id, err);
      }
    }
    
    console.log('📊 [Push] Resumo:', { successCount, failCount, total: subscriptions.length });
  } catch (err) {
    console.error('❌ [Push] Erro ao enviar notificação push:', err);
  }
};

exports.getVapidPublicKey = async (req, res) => {
  try {
    res.json({ publicKey: vapidKeys.publicKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
