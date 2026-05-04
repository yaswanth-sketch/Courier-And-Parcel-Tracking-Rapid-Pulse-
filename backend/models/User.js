const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isGmailAddress, normalizeEmail } = require('../utils/email');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    set: normalizeEmail,
    validate: {
      validator: isGmailAddress,
      message: 'Please use a valid Gmail address'
    }
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin', 'carrier'], default: 'user' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  location: {
    lat: { type: Number, default: 17.3850 },
    lng: { type: Number, default: 78.4867 },
    lastUpdated: { type: Date, default: Date.now }
  },
  notifications: [{ message: String, read: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
