const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find/Search for notes using note.find
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const searchTerm = 'orci';
    let filter = {};

    if (searchTerm) {
      filter = { $or: [{title : { $regex: searchTerm, $options: 'i' }},
      {content : { $regex: searchTerm, $options: 'i'}}]
      };

    return Note.find(filter).sort({ updatedAt: 'desc' });
  }})
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

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

// Create a new note using Note.create
// mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
//   .then(() => {
//     let noteFiller = {title: "New Title", content: "New Content"};
//     return Note.create(noteFiller)
//   })
//   .then(result => console.log((result)))
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(error => console.log('SpaghettiOs'));

// Update a note by id using Note.findByIdAndUpdate
// mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
//   .then(() => {
//     let id = '000000000000000000000003';
//     let updateTitle = 'Lady Gaga Hates Cats';
//     return Note.findByIdAndUpdate({_id: id}, {$set: {title: updateTitle}}, {new: true}
//     )
//   })
//   .then(result => console.log((result)))
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(error => console.log('SpaghettiOs'));

// Delete a note by id using Note.findByIdAndRemove
// mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
//   .then(() => {
//     let id = '000000000000000000000003';
//     return Note.findByIdAndRemove(id)
//    })
//    .then(result => console.log(result))
//    .then(() => {
//      return mongoose.disconnect()
//    })
//    .catch(error => console.log('Zoinks'));