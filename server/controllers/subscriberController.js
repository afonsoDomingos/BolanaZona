const Subscriber = require('../models/Subscriber');
const Tournament = require('../models/Tournament');

exports.subscribe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { id } = req.params; // tournamentId

    // Verificar se o torneio existe
    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ message: 'Torneio não encontrado.' });

    // Criar ou atualizar subscrição
    const subscriber = await Subscriber.findOneAndUpdate(
      { tournament: id, phone },
      { name, isActive: true },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Agora estás a seguir este torneio! ⚽', subscriber });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Já estás a seguir este torneio.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getTournamentSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ tournament: req.params.id });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
