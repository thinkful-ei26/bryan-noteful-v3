'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  
  let filters = {};
  // mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  // .then(() => {
    // queryableFields.forEach(field => {
    //   if (req.query[field]) {
    //     filters[field] = req.query[field]
    //   }
    // })
    if (req.query.searchTerm) {
      filters = { $or: [{title : { $regex: req.query.searchTerm, $options: 'i' }},
      {content : { $regex: req.query.searchTerm, $options: 'i'}}]
      };
    }
    return Note.find(filters).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    // console.log(results);
    res.json(results);
  })
  // .then(() => {
  //   return mongoose.disconnect()
  // })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    // console.error(err);
  });

  // console.log('Get All Notes');
  // res.json([
  //   { id: 1, title: 'Temp 1' },
  //   { id: 2, title: 'Temp 2' },
  //   { id: 3, title: 'Temp 3' }
  // ]);

// });

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  let id = req.params.id;

  Note.findById(id)
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
  });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  // const { title, content } = req.body;
  const newItem = { title, content };
// Validate user input
  if (!newItem.title) {
    const err = new Error(`Yeah. Ummm... We're gonna need a title`);
    err.status = 400;
    return next(err);
  }
//Connect to server
  // mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  // .then(() => {
    return Note.create(newItem)
  // })
  .then(result => {
    if (result) {
      res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);
    } else {
      next();
    }
  })
  // .then(() => {
    // return mongoose.disconnect()
  // })
  .catch(error => {
    next(error);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title , content} = req.body

  // mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  // .then(() => {
    return Note.findByIdAndUpdate(id, {$set: {title, content}}, 
      {new: true}
    )
  // })
  .then(result => res.json(result))
  .catch(error => {
    console.log('Error');
    res.status(400).json({"Error" : "ID not found"});
  })
  // .then(() => {
    // return mongoose.disconnect();
  // })

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  // mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  // .then(() => {
    return Note.findByIdAndRemove(id)
  //  })
   .then(res.sendStatus(204).end())
  //  .then(() => {
    //  return mongoose.disconnect();
  //  })
   .catch(() => {
  res.status(400).json({"Error": "Note Id not found"});
   })
});

module.exports = router;