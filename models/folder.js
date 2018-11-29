const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {type: String, 
        required: true, 
        unique: true}
});

folderSchema.set('timestamps', true);

folderSchema.set('toJSON', {
  virtuals: true,
  transform: (foo, bar) => {
    delete bar.__v;
    delete bar._id;
  }
});

module.exports = mongoose.model('Folder', folderSchema);