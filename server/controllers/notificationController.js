const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
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

exports.create = async (userId, title, message, type = 'info', link = '') => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) { console.error('Erro ao criar notificação:', err); }
};
