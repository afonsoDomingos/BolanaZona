const Post = require('../models/Post');

exports.create = async (req, res) => {
  try {
    const { type, content, scoreData } = req.body;
    const post = await Post.create({
      user: req.user._id,
      type,
      content,
      scoreData
    });
    const populatedPost = await post.populate('user', 'name avatar');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post não encontrado' });

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post não encontrado' });

    // Verificar se o utilizador é o dono do post ou superadmin
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    await post.deleteOne();
    res.json({ message: 'Post eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
