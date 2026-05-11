const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    
    // Validar se o telemóvel já existe em outro utilizador
    if (phone) {
      const existing = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ message: 'Este número de telemóvel já está em uso.' });
    }

    // Validar se o email já existe em outro utilizador
    if (email && email.trim() !== '') {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }

    const updates = { name, phone };
    if (avatar) updates.avatar = avatar;
    
    // Tratar email como undefined se vazio para respeitar o índice sparse
    if (email && email.trim() !== '') {
      updates.email = email.toLowerCase();
    } else {
      updates.email = undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Methods
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminUpdateUser = async (req, res) => {
  try {
    const { name, email, phone, role, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { name, email, phone, role, avatar } },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilizador removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
