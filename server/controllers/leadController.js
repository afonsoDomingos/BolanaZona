const Lead = require('../models/Lead');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.create = async (req, res) => {
  try {
    const { productId, name, contact, message } = req.body;
    const product = await Product.findById(productId);
    
    const lead = await Lead.create({
      product: productId,
      name,
      contact,
      message
    });

    // Notificar os administradores
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'info',
        title: 'Novo Lead de Venda! 🛍️',
        message: `${name} tem interesse em "${product?.name}". Contacto: ${contact}`,
        link: `/dashboard/analytics?tab=leads` // Vamos criar esta aba
      });
    }

    res.status(201).json({ message: 'Lead captado com sucesso!', lead });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const leads = await Lead.find().populate('product').sort('-createdAt');
    res.json(leads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
