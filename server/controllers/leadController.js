const Lead = require('../models/Lead');
const Tournament = require('../models/Tournament');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPushNotification } = require('./pushController');

exports.create = async (req, res) => {
  try {
    const { productId, tournamentId, name, contact, teamName, message, source, size, color, province, quantity, paymentMethod, paymentPhone, paymentDetails } = req.body;
    
    const lead = await Lead.create({
      product: productId || null,
      tournament: tournamentId || null,
      name,
      contact,
      teamName,
      size,
      color,
      province,
      quantity: quantity || 1,
      message,
      source: source || 'store',
      paymentMethod: paymentMethod || 'whatsapp',
      paymentPhone: paymentPhone || '',
      paymentDetails: paymentDetails || ''
    });

    // Notificação
    if (tournamentId) {
      const tournament = await Tournament.findById(tournamentId).populate('createdBy');
      if (tournament && tournament.createdBy) {
        await Notification.create({
          user: tournament.createdBy._id,
          type: 'tournament',
          title: 'Nova Tentativa de Inscrição! ⚽',
          message: `${name} tentou inscrever a equipa "${teamName}". Contacto: ${contact}`,
          link: `/dashboard/tournaments/${tournamentId}?tab=leads`
        });
        
        // Push notification
        await sendPushNotification(
          tournament.createdBy._id,
          'Nova Inscrição! ⚽',
          `${name} quer inscrever "${teamName}"`,
          { url: `/dashboard/tournaments/${tournamentId}?tab=leads` }
        );
      }
    } else if (productId) {
      const product = await Product.findById(productId);
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'store',
          title: 'Nova Venda! 🛍️',
          message: `${name} comprou ${quantity || 1}x "${product?.name}" - ${((product?.price || 0) * (quantity || 1)).toLocaleString()} MT`,
          link: `/admin/store?tab=sales`
        });
        
        // Push notification
        await sendPushNotification(
          admin._id,
          'Nova Venda! 🛍️',
          `${name} comprou ${quantity || 1}x ${product?.name} - ${((product?.price || 0) * (quantity || 1)).toLocaleString()} MT`,
          { url: `/admin/store?tab=sales` }
        );
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
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
      .populate('product')
      .populate('tournament');
    
    // Notificar quando status for atualizado para 'confirmed'
    if (req.body.status === 'confirmed' && lead.product) {
      await Notification.create({
        user: req.user._id,
        type: 'store',
        title: 'Venda Confirmada! ✅',
        message: `Venda de ${lead.name} - ${lead.product.name} foi confirmada com sucesso`,
        link: `/admin/store?tab=sales`
      });
      
      // Push notification
      await sendPushNotification(
        req.user._id,
        'Venda Confirmada! ✅',
        `Venda de ${lead.name} - ${lead.product.name} confirmada`,
        { url: `/admin/store?tab=sales` }
      );
    }
    
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
