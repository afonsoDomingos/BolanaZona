const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true, sparse: true },
  phone: { type: String, unique: true, trim: true, sparse: true, default: undefined },
  password: { type: String, minlength: 6 },
  googleId: { type: String, sparse: true, unique: true },
  role: { type: String, enum: ['superadmin', 'admin', 'player', 'viewer'], default: 'viewer' },
  province: { type: String, default: '' },
  hasGivenFeedback: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  lastSeen: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
