const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  trackingId: { type: String, default: '' },
  issueType: {
    type: String,
    enum: ['Delivery Issue', 'Tracking Mismatch', 'Damaged Parcel', 'Missing Parcel', 'Payment Issue', 'Other'],
    default: 'Other'
  },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Open', 'In Review', 'Resolved'], default: 'Open' },
  adminResponse: { type: String, default: '' },
  respondedByName: { type: String, default: '' },
  respondedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
