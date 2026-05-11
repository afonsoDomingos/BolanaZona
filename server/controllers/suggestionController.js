const Suggestion = require('../models/Suggestion');

exports.create = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    const suggestion = await Suggestion.create({
      user: req.user?._id,
      name: req.user?.name || name,
      email: req.user?.email || email,
      category,
      message
    });
    res.status(201).json(suggestion);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
