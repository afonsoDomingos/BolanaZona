const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ user: req.user._id });
    
    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Lida.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'Todas lidas.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'Notificações limpas.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (userId, title, message, type = 'system', link = '') => {
  try {
    // Verificar se o utilizador tem notificações deste tipo ativadas
    const user = await User.findById(userId);
    if (!user || !user.notificationPreferences) {
      await Notification.create({ user: userId, title, message, type, link });
      return;
    }
    
    const pref = user.notificationPreferences;
    if (pref[type] !== false) {
      await Notification.create({ user: userId, title, message, type, link });
    }
  } catch (err) { console.error('Erro ao criar notificação:', err); }
};

exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    res.json(user.notificationPreferences || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { notificationPreferences } = req.body;
    await User.findByIdAndUpdate(req.user._id, { notificationPreferences });
    res.json({ message: 'Preferências atualizadas.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
