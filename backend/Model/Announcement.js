const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  important: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
