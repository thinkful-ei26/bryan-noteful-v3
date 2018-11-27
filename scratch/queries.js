const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find/Search for notes using note.find
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm, $options: 'i' };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Find note by id using Note.findById

// mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
//   .then(() => {
//     const id = '000000000000000000000003';
//     return Note.findById(id);
//   })
//   .then(result => console.log(result))
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(error => console.log('ruh-roh'));

// 