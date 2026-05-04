const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Feedback = require('../models/Feedback');

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, password, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password && newPassword) {
      if (!(await user.matchPassword(password)))
        return res.status(400).json({ message: 'Current password incorrect' });
      user.password = newPassword;
    }
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { trackingId, issueType, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      trackingId: trackingId || '',
      issueType: issueType || 'Other',
      subject,
      message
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
