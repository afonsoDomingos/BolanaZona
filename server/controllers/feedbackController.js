const Feedback = require('../models/Feedback');

exports.create = async (req, res) => {
  try {
    const { experience, source, rating } = req.body;
    const feedback = await Feedback.create({
      user: req.user?._id,
      experience,
      source,
      rating,
      ip: req.ip
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
