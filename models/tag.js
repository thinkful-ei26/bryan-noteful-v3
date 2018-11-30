'use strict';

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {type: String, 
        required: true, 
        unique: true}
});

tagSchema.set('timestamps', true);

tagSchema.set('toJSON', {
  virtuals: true,
  transform: (foo, bar) => {
    delete bar.__v;
    delete bar._id;
  }
});

module.exports = mongoose.model('Tag', tagSchema);