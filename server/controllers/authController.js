const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!phone) return res.status(400).json({ message: 'Número de telefone é obrigatório.' });

    const exists = await User.findOne({ $or: [
      { email: email && email.trim() !== '' ? email.toLowerCase() : '---non-existent-email---' },
      { phone }
    ].filter(q => q.email !== '---non-existent-email---') });

    if (exists) {
      const field = (email && email.trim() !== '' && exists.email === email.toLowerCase()) ? 'Email' : 'Telefone';
      return res.status(400).json({ message: `${field} já registado.` });
    }

    const userData = { name, phone, password, role: role || 'admin' };
    if (email && email.trim() !== '') userData.email = email.toLowerCase();

    const user = await User.create(userData);
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Utilizador e senha obrigatórios.' });

    const user = await User.findOne({ 
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({ 
      $or: [{ email: identifier?.toLowerCase() }, { phone: identifier }] 
    });
    
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    // Gerar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordToken = resetCode; 
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutos
    await user.save({ validateBeforeSave: false });

    // Aqui integraríamos a API do WhatsApp. Por agora, retornamos o código.
    res.json({ 
      message: 'Código de recuperação gerado!', 
      phone: user.phone,
      code: resetCode 
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { code, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Código inválido ou expirado.' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
