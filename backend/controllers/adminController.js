const Parcel = require('../models/Parcel');
const User = require('../models/User');
const AdminAudit = require('../models/AdminAudit');
const Feedback = require('../models/Feedback');
const { isGmailAddress, normalizeEmail } = require('../utils/email');

const STATUS_ORDER = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
const PARCEL_TYPES = ['Document', 'Electronics', 'Clothing', 'Food', 'Fragile', 'Medicine', 'Other'];

exports.createAdmin = async (req, res) => {
  try {
    const { name, password, phone, address } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!isGmailAddress(email)) {
      return res.status(400).json({ message: 'Admin accounts must use a valid Gmail address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      role: 'admin'
    });

    await AdminAudit.create({
      action: 'CREATE_ADMIN',
      actorId: req.user._id,
      actorName: req.user.name,
      targetUserId: admin._id,
      targetName: admin.name,
      targetEmail: admin.email,
      details: `${req.user.name} created a new admin account`
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phone: admin.phone,
      address: admin.address,
      createdAt: admin.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminManagementData = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    const auditLogs = await AdminAudit.find({ action: 'CREATE_ADMIN' })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ admins, auditLogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    // Restrict feedback viewing to specific admin email
    if (req.user.email !== 'yaswanth.chittiboina999@gmail.com') {
      return res.status(403).json({ message: 'Access denied. You do not have permission to view complaints.' });
    }
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    // Restrict feedback updates to specific admin email
    if (req.user.email !== 'yaswanth.chittiboina999@gmail.com') {
      return res.status(403).json({ message: 'Access denied. You do not have permission to reply to complaints.' });
    }
    const { status, adminResponse } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const oldStatus = feedback.status;
    const oldResponse = feedback.adminResponse;

    if (status) feedback.status = status;
    if (typeof adminResponse === 'string') feedback.adminResponse = adminResponse.trim();

    if (feedback.adminResponse) {
      feedback.respondedByName = req.user.name;
      feedback.respondedAt = new Date();
    }

    await feedback.save();

    const hasStatusChanged = status && status !== oldStatus;
    const hasNewResponse = feedback.adminResponse && feedback.adminResponse !== oldResponse;

    if (hasStatusChanged || hasNewResponse) {
      const details = hasStatusChanged
        ? `Your feedback "${feedback.subject}" is now ${feedback.status}.`
        : `Admin replied to your feedback "${feedback.subject}".`;

      await User.findByIdAndUpdate(feedback.userId, {
        $push: { notifications: { message: details } }
      });
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllParcels = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.$or = [
      { trackingId: { $regex: search, $options: 'i' } },
      { senderName: { $regex: search, $options: 'i' } },
      { receiverName: { $regex: search, $options: 'i' } }
    ];
    const total = await Parcel.countDocuments(query);
    const parcels = await Parcel.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ parcels, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, location, description } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    if (!location || !location.trim()) return res.status(400).json({ message: 'Current location is required' });

    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

    parcel.status = status;
    parcel.trackingHistory.push({ status, location: location.trim(), description: description || `Status updated to ${status}` });
    if (status === 'Delivered') parcel.actualDelivery = new Date();
    await parcel.save();

    // Notify user
    await User.findByIdAndUpdate(parcel.userId, {
      $push: { notifications: { message: `Your parcel ${parcel.trackingId} is now: ${status}` } }
    });

    res.json(parcel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [total, totalUsers, statusCountsRaw, typeCountsRaw] = await Promise.all([
      Parcel.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Parcel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Parcel.aggregate([{ $group: { _id: '$parcelType', count: { $sum: 1 } } }])
    ]);

    const statusCounts = Object.fromEntries(statusCountsRaw.map((entry) => [entry._id, entry.count]));
    const typeCounts = Object.fromEntries(typeCountsRaw.map((entry) => [entry._id, entry.count]));

    const delivered = statusCounts.Delivered || 0;
    const inTransit = statusCounts['In Transit'] || 0;
    const pending = (statusCounts.Booked || 0) + (statusCounts['Picked Up'] || 0);
    const outForDelivery = statusCounts['Out for Delivery'] || 0;
    const cancelled = statusCounts.Cancelled || 0;
    const returned = statusCounts.Returned || 0;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await Parcel.countDocuments({ createdAt: { $gte: start, $lte: end } });
      last7Days.push({ date: start.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }

    const byType = PARCEL_TYPES.map((type) => ({ _id: type, count: typeCounts[type] || 0 }));
    const byStatus = STATUS_ORDER.map((status) => ({ _id: status, count: statusCounts[status] || 0 }));

    res.json({
      total,
      delivered,
      inTransit,
      pending,
      outForDelivery,
      cancelled,
      returned,
      totalUsers,
      last7Days,
      byType,
      byStatus
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCarriers = async (req, res) => {
  try {
    const carriers = await User.find({ role: 'carrier' }).select('name email phone location').sort({ name: 1 });
    res.json(carriers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignCarrier = async (req, res) => {
  try {
    const { carrierId } = req.body;
    console.log(`Assigning carrier ${carrierId} to parcel ${req.params.id}`);
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      console.log('Parcel not found for assignment');
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    parcel.carrierId = carrierId;
    await parcel.save();
    console.log('Carrier assigned successfully in DB');
    
    const carrier = await User.findById(carrierId);
    
    // Notify user
    await User.findByIdAndUpdate(parcel.userId, {
      $push: { notifications: { message: `Delivery agent ${carrier.name} has been assigned to your parcel ${parcel.trackingId}.` } }
    });
    
    res.json(parcel);
  } catch (err) {
    console.error('Error in assignCarrier:', err);
    res.status(500).json({ message: err.message });
  }
};
