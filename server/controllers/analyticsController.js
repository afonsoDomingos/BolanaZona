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

    const recentEvents = await Analytics.find().sort('-createdAt').limit(20);

    res.json({ totalVisits, totalPurchases, topProducts, pageVisits, recentEvents });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
