const Analytics = require('../models/Analytics');

exports.track = async (req, res) => {
  try {
    const { type, page, targetId, targetName } = req.body;
    await Analytics.create({
      type, page, targetId, targetName,
      user: req.user?._id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
    }

    res.status(201).json({ message: 'Tracked' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const totalVisits = await Analytics.countDocuments({ type: 'visit' });
    const totalPurchases = await Analytics.countDocuments({ type: 'purchase_attempt' });
    
    // Top 5 produtos clicados
    const topProducts = await Analytics.aggregate([
      { $match: { type: 'purchase_attempt' } },
      { $group: { _id: '$targetName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Visitas por página
    const pageVisits = await Analytics.aggregate([
      { $match: { type: 'visit' } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentEvents = await Analytics.find()
      .populate('user', 'name email role lastSeen')
      .sort('-createdAt')
      .limit(50);

    // Utilizadores online (ativos nos últimos 5 min)
    const User = require('../models/User');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await User.find({ lastSeen: { $gte: fiveMinutesAgo } }).select('name email role lastSeen');

    res.json({ totalVisits, totalPurchases, topProducts, pageVisits, recentEvents, onlineUsers });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
