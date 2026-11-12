const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    name: String,
    email: String,
    role: String
  },
  details: {
    type: String,
    default: ''
  },
  targetId: String,
  ip: String
}, {
  timestamps: true
});

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
