const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  course:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  quantity:  { type: Number, required: true, default: 1, min: 1 },
}, { timestamps: true });

cartItemSchema.index({ sessionId: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
