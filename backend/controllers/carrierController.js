const Parcel = require('../models/Parcel');
const User = require('../models/User');

exports.getAssignedParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ carrierId: req.user._id, status: { $ne: 'Delivered' } })
      .select('-pickupCode -deliveryCode') // Secure: Hide codes from delivery agent
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, code } = req.body;
    const parcel = await Parcel.findOne({ _id: req.params.id, carrierId: req.user._id });
    
    if (!parcel) return res.status(404).json({ message: 'Parcel not found or not assigned to you' });

    // Verify PIN for pickup
    if (status === 'Picked Up') {
      if (!code) return res.status(400).json({ message: 'Pickup PIN is required' });
      if (code !== parcel.pickupCode) return res.status(400).json({ message: 'Invalid Pickup PIN' });
    }

    // Verify PIN for delivery
    if (status === 'Delivered') {
      if (!code) return res.status(400).json({ message: 'Delivery PIN is required' });
      if (code !== parcel.deliveryCode) return res.status(400).json({ message: 'Invalid Delivery PIN' });
      parcel.actualDelivery = new Date();
    }

    parcel.status = status;
    parcel.trackingHistory.push({
      status,
      location: 'Handover Location',
      description: `Status updated by delivery agent ${req.user.name}`
    });
    
    await parcel.save();
    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      location: { lat, lng, lastUpdated: new Date() }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
