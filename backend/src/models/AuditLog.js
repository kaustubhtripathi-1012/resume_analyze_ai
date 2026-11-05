const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: ''
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

