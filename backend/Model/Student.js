const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  idCardImage: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  certificateStatus: { type: String, enum: ['not_uploaded', 'valid', 'fake'], default: 'not_uploaded' },
  certificateData: { type: Object },
  certificateFile: { type: String },
  isLoggedIn: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null },
  lastLogoutAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
