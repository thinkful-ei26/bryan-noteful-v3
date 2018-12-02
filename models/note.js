'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Folder'},
  tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
});
//unfold for hook 

noteSchema.set('timestamps', true);

noteSchema.set('toJSON', {
  virtuals: true,   
  transform: (doc, ret) => {
    delete ret._id; 
    delete ret.__v;
  }
});

noteSchema.pre('find', function(next) {
  this.populate('folderId');
  next();
})

noteSchema.pre('findOne', function(next){
  this.populate('folderId');
  next();
})

module.exports = mongoose.model('Note', noteSchema);
