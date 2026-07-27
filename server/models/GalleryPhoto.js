const mongoose = require('mongoose');

const galleryPhotoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  caption: { type: String, default: '', trim: true },
  image: { type: String, required: true, trim: true },
  category: { type: String, default: 'Torneios', trim: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);
