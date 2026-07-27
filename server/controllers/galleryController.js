const GalleryPhoto = require('../models/GalleryPhoto');

const DEFAULT_PHOTOS = [
  {
    title: 'Grande Final de Bairro',
    caption: 'A festa do futebol comunitário na atribuição do troféu principal.',
    image: '/banner1.png',
    category: 'Torneios',
    order: 0,
    active: true,
  },
  {
    title: 'Mambinhas no CAN Sub-17',
    caption: 'Momento histórico da qualificação inédita ao Mundial Qatar 2026.',
    image: '/banner4mabinhas.jpg',
    category: 'Comunidade',
    order: 1,
    active: true,
  },
  {
    title: 'Ação em Campo',
    caption: 'Garra, talento e determinação a cada lance disputado.',
    image: '/banner2.png',
    category: 'Jogos',
    order: 2,
    active: true,
  },
  {
    title: 'Emblema da Comunidade',
    caption: 'Paixão pelo desporto em todas as zonas e bairros.',
    image: '/bolanazonalgo.png',
    category: 'Troféus',
    order: 3,
    active: true,
  },
  {
    title: 'Comunidade Bola na Zona',
    caption: 'Jovens talentos prontos para dar o salto.',
    image: '/vibe-avatar.png',
    category: 'Comunidade',
    order: 4,
    active: true,
  },
  {
    title: 'Duelo Decisivo nas Penalidades',
    caption: 'Frieza e concentração nos momentos de máxima pressão.',
    image: '/banner1.png',
    category: 'Jogos',
    order: 5,
    active: true,
  },
  {
    title: 'Cerimónia de Premiação',
    caption: 'Reconhecimento aos melhores marcadores e guarda-redes.',
    image: '/banner2.png',
    category: 'Troféus',
    order: 6,
    active: true,
  },
  {
    title: 'Espírito Desportivo',
    caption: 'Respeito e fair-play entre todas as equipas participantes.',
    image: '/banner4mabinhas.jpg',
    category: 'Torneios',
    order: 7,
    active: true,
  }
];

async function ensureDefaults() {
  const count = await GalleryPhoto.countDocuments();
  if (count === 0) {
    await GalleryPhoto.insertMany(DEFAULT_PHOTOS);
  }
}

exports.getPublic = async (req, res) => {
  try {
    await ensureDefaults();
    const photos = await GalleryPhoto.find({ active: true }).sort('order -createdAt');
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    await ensureDefaults();
    const photos = await GalleryPhoto.find().sort('order -createdAt');
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const photo = await GalleryPhoto.create(req.body);
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!photo) return res.status(404).json({ message: 'Fotografia não encontrada.' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Fotografia não encontrada.' });
    res.json({ message: 'Fotografia eliminada.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
