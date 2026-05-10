require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/tournaments/:tournamentId/teams', require('./routes/teams'));
app.use('/api/tournaments/:tournamentId/matches', require('./routes/matches'));

app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', platform: 'Bola na Zona' }));

// Connect DB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => console.log(`🚀 Servidor a correr em http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Erro MongoDB:', err.message);
    process.exit(1);
  });
