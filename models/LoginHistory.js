const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email:      { type: String, required: true },
  success:    { type: Boolean, required: true },
  ipAddress:  { type: String, default: '' },
  userAgent:  { type: String, default: '' },
  loginAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
