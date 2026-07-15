const Partner = require('../models/Partner');

const DEFAULT_PARTNERS = [
  { name: "INSCREVA'SE", url: 'https://inscreva-se.com/', order: 0, active: true },
  { name: 'Rpa Moçambique', url: 'https://recuperaaqui.vercel.app/', order: 1, active: true },
];

async function ensureDefaults() {
  const count = await Partner.countDocuments();
  if (count === 0) {
    await Partner.insertMany(DEFAULT_PARTNERS);
  }
}

exports.getPublic = async (req, res) => {
  try {
    await ensureDefaults();
    const partners = await Partner.find({ active: true }).sort('order name');
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    await ensureDefaults();
    const partners = await Partner.find().sort('order name');
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) return res.status(404).json({ message: 'Parceiro não encontrado.' });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Parceiro não encontrado.' });
    res.json({ message: 'Parceiro eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
