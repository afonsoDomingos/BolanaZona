const Lead = require('../models/Lead');
const Tournament = require('../models/Tournament');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.create = async (req, res) => {
  try {
    const { productId, tournamentId, name, contact, teamName, message, source } = req.body;
    
    const lead = await Lead.create({
      product: productId || null,
      tournament: tournamentId || null,
      name,
      contact,
      teamName,
      message,
      source: source || 'store'
    });

    // Notificação
    if (tournamentId) {
      const tournament = await Tournament.findById(tournamentId).populate('createdBy');
      if (tournament && tournament.createdBy) {
        await Notification.create({
          user: tournament.createdBy._id,
          type: 'info',
          title: 'Nova Tentativa de Inscrição! ⚽',
          message: `${name} tentou inscrever a equipa "${teamName}". Contacto: ${contact}`,
          link: `/dashboard/tournaments/${tournamentId}?tab=leads`
        });
      }
    } else if (productId) {
      const product = await Product.findById(productId);
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'info',
          title: 'Novo Lead de Venda! 🛍️',
          message: `${name} tem interesse em "${product?.name}". Contacto: ${contact}`,
          link: `/dashboard/analytics?tab=leads`
        });
      }
    }

    res.status(201).json({ message: 'Lead captado com sucesso!', lead });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const { tournamentId } = req.query;
    let query = {};
    
    // Se for organizador, ele só vê os dele (a menos que seja superadmin)
    if (tournamentId) {
      query.tournament = tournamentId;
    } else if (req.user.role !== 'superadmin') {
      // Se não passou ID e não é superadmin, buscar torneios que ele criou
      const myTournaments = await Tournament.find({ createdBy: req.user._id }).select('_id');
      const ids = myTournaments.map(t => t._id);
      query = { $or: [{ tournament: { $in: ids } }, { product: { $exists: true } && req.user.role === 'superadmin' }] };
    }

    const leads = await Lead.find(query)
      .populate('product')
      .populate('tournament')
      .sort('-createdAt');
    res.json(leads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
