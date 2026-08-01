const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  status: { type: String, default: 'Active' },
  internalNotes: { type: String },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }
}, { timestamps: true });

module.exports = mongoose.models.Client || mongoose.model('Client', clientSchema);
