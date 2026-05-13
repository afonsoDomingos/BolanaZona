require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🟢 LOG DE ARRANQUE E VARIÁVEIS
console.log('🚀 [SERVER] A iniciar Bola na Zona Backend...');
console.log('📡 [ENV CHECK] MONGO_URI:', process.env.MONGO_URI ? '✅ Configurada' : '❌ EM FALTA');
console.log('📡 [ENV CHECK] JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurada' : '❌ EM FALTA');
console.log('📡 [ENV CHECK] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurada' : '❌ EM FALTA');

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 🟢 FORÇAR POLÍTICA DE POPUPS PARA GOOGLE AUTH
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

// 🟢 LOGGER DE PEDIDOS
app.use((req, res, next) => {
  console.log(`📩 [PEDIDO] ${req.method} ${req.path}`);
  next();
});

// 🟢 MIDDLEWARE DE CONEXÃO MONGO (CRÍTICO PARA VERCEL)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState >= 1) return next();
  try {
    console.log('📡 [DB] A ligar ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ [DB] Ligado');
    next();
  } catch (err) {
    console.error('❌ [DB] Erro:', err.message);
    return res.status(500).json({ message: 'Erro de base de dados', error: err.message });
  }
});

// 🟢 LOGGER DE PEDIDOS
app.use((req, res, next) => {
  console.log(`📩 [PEDIDO] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/tournaments/:tournamentId/teams', require('./routes/teams'));
app.use('/api/tournaments/:tournamentId/matches', require('./routes/matches'));
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api/upload', require('./routes/upload'));
app.use('/api/players', require('./routes/players'));
app.use('/api/products', require('./routes/products'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/feedbacks', require('./routes/feedbacks'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', platform: 'Bola na Zona' }));

// 🟢 MIDDLEWARE DE ERRO (DEVE ESTAR ANTES DO EXPORT)
app.use((err, req, res, next) => {
  console.error(`🔥 [ERRO CRÍTICO] ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno no servidor',
    error: err.stack,
    debug: true
  });
});

// Start local server if not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Servidor em http://localhost:${PORT}`));
}

module.exports = app;
