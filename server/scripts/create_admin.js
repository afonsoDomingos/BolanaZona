const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB para criação do admin...');

    const adminExists = await User.findOne({ email: 'admin@bolanazona.com' });
    if (adminExists) {
      console.log('⚠️ O utilizador admin@bolanazona.com já existe.');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin Bola na Zona',
      email: 'admin@bolanazona.com',
      password: '@Admin123@',
      role: 'superadmin'
    });

    await admin.save();
    console.log('🚀 Conta de Super Administrador criada com sucesso!');
    console.log('📧 Email: admin@bolanazona.com');
    console.log('🔑 Password: [A que definiste]');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao criar admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
