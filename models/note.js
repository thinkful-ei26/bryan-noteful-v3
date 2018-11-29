const mongoose = require('mongoose');

// let now = new Date();

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Folder'}
});

// Add 'createdAt' and 'updatedAt' fields
noteSchema.set('timestamps', true);

module.exports = mongoose.model('Note', noteSchema);

noteSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});
