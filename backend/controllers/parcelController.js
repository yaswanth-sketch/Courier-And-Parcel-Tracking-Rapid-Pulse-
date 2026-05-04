const Parcel = require('../models/Parcel');
const User = require('../models/User');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

exports.createParcel = async (req, res) => {
  try {
    const trackingId = 'TRK' + nanoid();
    const eta = new Date();
    eta.setDate(eta.getDate() + (req.body.priority === 'Overnight' ? 1 : req.body.priority === 'Express' ? 3 : 7));

    const parcel = await Parcel.create({
      ...req.body,
      trackingId,
      userId: req.user._id,
      estimatedDelivery: eta,
      trackingHistory: [{ status: 'Booked', location: req.body.senderAddress, description: 'Parcel booked successfully' }]
    });

    // Add notification to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { notifications: { message: `Parcel ${trackingId} booked successfully!` } }
    });

    res.status(201).json(parcel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.trackParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ trackingId: req.params.trackingId })
      .populate('userId', 'name email')
      .populate('carrierId', 'name phone location');
      
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    
    // Transform to maintain compatibility with the frontend's deliveryAgent expectation
    const parcelObj = parcel.toObject();
    
    // Add securityCode if the requester is authorized
    if (req.user) {
      const parcelOwnerId = parcel.userId._id ? parcel.userId._id.toString() : parcel.userId.toString();
      const isSender = parcelOwnerId === req.user._id.toString();
      const isReceiver = (parcel.receiverEmail && parcel.receiverEmail.toLowerCase() === req.user.email.toLowerCase()) || 
                         (parcel.receiverPhone === req.user.phone);
      
      if (isSender && parcel.status === 'Booked') {
        parcelObj.securityCode = parcel.pickupCode;
      } else if (isReceiver && parcel.status === 'Out for Delivery') {
        parcelObj.securityCode = parcel.deliveryCode;
      }
    }

    // Clean up sensitive fields
    delete parcelObj.pickupCode;
    delete parcelObj.deliveryCode;

    if (parcel.carrierId) {
      parcelObj.deliveryAgent = {
        name: parcel.carrierId.name,
        phone: parcel.carrierId.phone,
        currentLocation: parcel.carrierId.location,
        lastUpdated: parcel.carrierId.location?.lastUpdated
      };
    } else {
      parcelObj.deliveryAgent = { name: 'Assigning...', currentLocation: { lat: 17.3850, lng: 78.4867 } };
    }
    
    res.json(parcelObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserParcels = async (req, res) => {
  try {
    // Senders can see pickupCode but not deliveryCode
    const parcels = await Parcel.find({ userId: req.user._id })
      .select('-deliveryCode')
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIncomingParcels = async (req, res) => {
  try {
    // Receivers can see deliveryCode but not pickupCode
    // We match by email, phone, or name (ignoring formatting for phone)
    const parcels = await Parcel.find({ 
      $or: [
        { receiverEmail: req.user.email },
        { receiverPhone: req.user.phone },
        { receiverName: req.user.name } // Fallback for demo
      ]
    })
    .select('-pickupCode')
    .sort({ createdAt: -1 });
    
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const phone = req.user.phone;
    
    // Total as sender
    const total = await Parcel.countDocuments({ userId });
    const delivered = await Parcel.countDocuments({ userId, status: 'Delivered' });
    
    // Incoming for receiver
    const incoming = await Parcel.countDocuments({ receiverPhone: phone, status: { $ne: 'Delivered' } });
    
    const pending = await Parcel.countDocuments({ userId, status: { $in: ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery'] } });
    const cancelled = await Parcel.countDocuments({ userId, status: 'Cancelled' });
    const recent = await Parcel.find({ userId }).sort({ createdAt: -1 }).limit(5);
    
    res.json({ total, delivered, pending, cancelled, recent, incoming });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
