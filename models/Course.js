const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String, default: '' },
  price:        { type: Number, required: true },
  logoKey:      { type: String, required: true },
  externalLink: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
