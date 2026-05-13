const Challenge = require('../models/Challenge');
const Squad = require('../models/Squad');

exports.create = async (req, res) => {
  try {
    const { challengerSquad, challengedSquad, date, location, message } = req.body;
    
    // Verify that the user actually owns the challenger squad
    const challenger = await Squad.findOne({ _id: challengerSquad, manager: req.user._id });
    if (!challenger) return res.status(403).json({ message: 'Não és o gestor do clube desafiador.' });

    const challenge = await Challenge.create({ challengerSquad, challengedSquad, date, location, message });
    res.status(201).json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyChallenges = async (req, res) => {
  try {
    // Find all squads managed by this user
    const mySquads = await Squad.find({ manager: req.user._id }).select('_id');
    const mySquadIds = mySquads.map(s => s._id);

    const challenges = await Challenge.find({
      $or: [
        { challengerSquad: { $in: mySquadIds } },
        { challengedSquad: { $in: mySquadIds } }
      ]
    })
    .populate('challengerSquad', 'name logo color manager')
    .populate('challengedSquad', 'name logo color manager')
    .sort('-createdAt');

    res.json(challenges);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted, rejected, completed
    const challenge = await Challenge.findById(req.params.id)
      .populate('challengedSquad')
      .populate('challengerSquad');

    if (!challenge) return res.status(404).json({ message: 'Desafio não encontrado.' });

    const isChallengedManager = challenge.challengedSquad.manager.toString() === req.user._id.toString();
    const isChallengerManager = challenge.challengerSquad.manager.toString() === req.user._id.toString();

    if (!isChallengedManager && !isChallengerManager) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    challenge.status = status;
    await challenge.save();
    res.json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
