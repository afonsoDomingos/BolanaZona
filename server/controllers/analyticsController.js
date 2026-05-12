const Analytics = require('../models/Analytics');

exports.track = async (req, res) => {
  try {
    const { type, page, targetId, targetName, deviceType, os } = req.body;
    await Analytics.create({
      type, page, targetId, targetName,
      user: req.user?._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      deviceType,
      os
    });

    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
    }

    const isNew = req.body.isNewVisitor;
    
    let visitorNumber = 0;
    if (isNew) {
      // Usar a contagem total de visitas para dar continuidade ao número real
      const totalVisits = await Analytics.countDocuments({ type: 'visit' });
      visitorNumber = totalVisits; // O documento atual já foi criado no início desta função
    }

    res.status(201).json({ 
      message: 'Tracked', 
      visitorNumber: visitorNumber > 0 ? visitorNumber : null 
    });
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

    // Utilizadores mais recentemente ativos (Top 20)
    const User = require('../models/User');
    const onlineUsers = await User.find()
      .select('name email role lastSeen phone')
      .sort({ lastSeen: -1 })
      .limit(20);

    // Dispositivos e OS
    const deviceStats = await Analytics.aggregate([
      { $match: { type: 'visit', deviceType: { $ne: null } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    const osStats = await Analytics.aggregate([
      { $match: { type: 'visit', os: { $ne: null } } },
      { $group: { _id: '$os', count: { $sum: 1 } } }
    ]);

    // Torneios por província
    const Tournament = require('../models/Tournament');
    const tournamentStats = await Tournament.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ totalVisits, totalPurchases, topProducts, pageVisits, recentEvents, onlineUsers, deviceStats, osStats, tournamentStats });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
