const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!phone) return res.status(400).json({ message: 'Número de telefone é obrigatório.' });

    const exists = await User.findOne({ $or: [
      { email: email ? email.toLowerCase() : undefined },
      { phone }
    ].filter(q => q.email || q.phone) });

    if (exists) {
      const field = (email && exists.email === email.toLowerCase()) ? 'Email' : 'Telefone';
      return res.status(400).json({ message: `${field} já registado.` });
    }

    const user = await User.create({ name, email, phone, password, role: role || 'admin' });
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
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Não existe utilizador com este email.' });

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save({ validateBeforeSave: false });

    // Aqui enviaríamos o email. Por agora vamos retornar o token para teste.
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    res.json({ 
      message: 'Token de recuperação gerado!', 
      resetUrl, // No futuro isto será enviado por email
      resetToken 
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token inválido ou expirado.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
