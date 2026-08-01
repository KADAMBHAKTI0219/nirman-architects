const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clockInTime: { type: Date, default: Date.now },
  clockOutTime: { type: Date },
  status: { type: String, default: 'PRESENT' }
}, { timestamps: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
