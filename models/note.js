const mongoose = require('mongoose');

let now = new Date();

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  createdAt: {type: Date, default: now},
  updatedAt: { type: Date, default: now}});

// Add 'createdAt' and 'updatedAt' fields
noteSchema.set('timestamps', true);

module.exports = mongoose.model('Note', noteSchema);

