const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isGmailAddress, normalizeEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!isGmailAddress(email)) {
      return res.status(400).json({ message: 'Please register with a valid Gmail address' });
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!isGmailAddress(email)) {
      return res.status(400).json({ message: 'Please sign in with a valid Gmail address' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
