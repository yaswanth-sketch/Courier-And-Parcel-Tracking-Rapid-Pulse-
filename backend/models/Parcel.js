const mongoose = require('mongoose');

const trackingUpdateSchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const parcelSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, default: '' },
  senderPhone: { type: String, default: '' },
  senderAddress: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverEmail: { type: String, default: '' },
  receiverPhone: { type: String, default: '' },
  receiverAddress: { type: String, required: true },
  parcelType: {
    type: String,
    enum: ['Document', 'Electronics', 'Clothing', 'Food', 'Fragile', 'Medicine', 'Other'],
    default: 'Other'
  },
  weight: { type: Number, default: 1 },
  dimensions: { type: String, default: '' },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Booked'
  },
  priority: { type: String, enum: ['Standard', 'Express', 'Overnight'], default: 'Standard' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryAgent: {
    name: { type: String, default: 'Assigning...' },
    phone: { type: String, default: '' },
    currentLocation: {
      lat: { type: Number, default: 17.3850 },
      lng: { type: Number, default: 78.4867 }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  pickupCode: { type: String, default: () => Math.floor(100000 + Math.random() * 900000).toString() },
  deliveryCode: { type: String, default: () => Math.floor(100000 + Math.random() * 900000).toString() },
  trackingHistory: [trackingUpdateSchema],
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Parcel', parcelSchema);
