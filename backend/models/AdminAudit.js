const mongoose = require('mongoose');

const adminAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String, default: '' },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetName: { type: String, default: '' },
  targetEmail: { type: String, default: '' },
  details: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
