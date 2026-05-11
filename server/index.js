require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true })); // Allow all origins in production for flexibility
app.use(express.json());

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
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', platform: 'Bola na Zona' }));

// Export for Vercel
module.exports = app;

// Connect DB and start server (only if not running on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB conectado localmente');
      app.listen(PORT, () => console.log(`🚀 Servidor a correr em http://localhost:${PORT}`));
    })
    .catch(err => {
      console.error('❌ Erro MongoDB Local:', err.stack);
    });
} else {
  // On Vercel, connect and log
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado em Produção'))
    .catch(err => console.error('❌ Falha Crítica MongoDB Produção:', err.stack));
}

// Global Error Handler Middleware (Deve ser o último)
app.use((err, req, res, next) => {
  console.error(`[ERRO NO SERVIDOR] ${new Date().toISOString()}`);
  console.error(`Path: ${req.path}`);
  console.error(`Stack: ${err.stack}`);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno no servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});
