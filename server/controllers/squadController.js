const Squad = require('../models/Squad');
const Notification = require('../models/Notification');

exports.getMySquads = async (req, res) => {
  try {
    const squads = await Squad.find({ manager: req.user._id }).sort('-createdAt');
    res.json(squads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const squad = await Squad.create({ ...req.body, manager: req.user._id });
    res.status(201).json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const oldSquad = await Squad.findOne({ _id: req.params.id, manager: req.user._id });
    if (!oldSquad) return res.status(404).json({ message: 'Clube não encontrado ou sem permissão.' });

    const oldName = oldSquad.name;
    const newName = req.body.name;

    const squad = await Squad.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    // Se o nome mudou, atualizar as notificações existentes que mencionam o nome antigo
    if (newName && oldName !== newName) {
      console.log(`🔄 [SYNC] Nome do clube mudou de "${oldName}" para "${newName}". A atualizar notificações...`);
      
      // Procurar notificações que contenham o nome antigo no campo 'message'
      const affectedNotifications = await Notification.find({ 
        message: { $regex: oldName, $options: 'i' } 
      });

      if (affectedNotifications.length > 0) {
        for (let notif of affectedNotifications) {
          notif.message = notif.message.split(oldName).join(newName);
          await notif.save();
        }
        console.log(`✅ [SYNC] ${affectedNotifications.length} notificações atualizadas.`);
      }
    }

    res.json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const squad = await Squad.findOneAndDelete({ _id: req.params.id, manager: req.user._id });
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado.' });
    res.json({ message: 'Clube eliminado.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPublicSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id).populate('manager', 'name');
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado.' });
    res.json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllPublicSquads = async (req, res) => {
  try {
    const squads = await Squad.find().populate('manager', 'name').sort('-createdAt');
    res.json(squads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
