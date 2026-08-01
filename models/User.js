const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'EMPLOYEE' },
  employeeId: { type: String },
  designation: { type: String },
  department: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
