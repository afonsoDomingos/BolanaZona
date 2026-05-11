const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    console.log('📝 Nova tentativa de registo:', { name, phone, role });

    if (!phone) return res.status(400).json({ message: 'Número de telefone é obrigatório.' });

    const exists = await User.findOne({ $or: [
      { email: email && email.trim() !== '' ? email.toLowerCase() : '---non-existent-email---' },
      { phone }
    ].filter(q => q.email !== '---non-existent-email---') });

    if (exists) {
      console.log('⚠️ Registo falhou: Email ou Telefone já existe');
      const field = (email && email.trim() !== '' && exists.email === email.toLowerCase()) ? 'Email' : 'Telefone';
      return res.status(400).json({ message: `${field} já registado.` });
    }

    const userData = { name, phone, password, role: role || 'viewer' };
    if (email && email.trim() !== '') userData.email = email.toLowerCase();

    const user = await User.create(userData);
    console.log('✅ Utilizador criado com sucesso:', user._id, 'Role:', user.role);
    
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('🔥 Erro no registo:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log('🔑 Tentativa de login para:', identifier);

    if (!identifier || !password) {
      console.log('⚠️ Falha: Identificador ou senha ausentes');
      return res.status(400).json({ message: 'Utilizador e senha obrigatórios.' });
    }

    // Normalizar identificador se for telemóvel
    let normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier.includes('@')) {
      const digits = normalizedIdentifier.replace(/\D/g, '');
      normalizedIdentifier = digits.length > 9 ? digits.slice(-9) : digits;
    }
    console.log('🔍 Identificador normalizado:', normalizedIdentifier);

    const user = await User.findOne({ 
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { phone: normalizedIdentifier }
      ]
    }).select('+password');

    if (!user) {
      console.log('❌ Utilizador não encontrado no DB');
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Senha incorreta para o utilizador:', user.phone || user.email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    console.log('✅ Login bem-sucedido para:', user.name);
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('🔥 Erro no processo de login:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Identificador obrigatório.' });

    // Normalizar identificador se for telemóvel
    let normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier.includes('@')) {
      const digits = normalizedIdentifier.replace(/\D/g, '');
      normalizedIdentifier = digits.length > 9 ? digits.slice(-9) : digits;
    }

    const user = await User.findOne({ 
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { phone: normalizedIdentifier }
      ]
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
