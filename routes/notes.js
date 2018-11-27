'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  
  let filters = {};
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
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
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

  // console.log('Get All Notes');
  // res.json([
  //   { id: 1, title: 'Temp 1' },
  //   { id: 2, title: 'Temp 2' },
  //   { id: 3, title: 'Temp 3' }
  // ]);

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  let id = req.params.id;
  mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  .then(() => {
    return Note.findById(id);
  })
  .then(result => res.json(result))
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const updateObj = {};
  const updateableFields = ['title', 'content'];
  // req.body = {title, content};
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  })

// Validate user input
  if (!updateObj.title) {
    const err = newError(`Yeah. Ummm... We're gonna need a title`);
    err.status = 400;
    return next(err);
  }
  mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  .then(() => {
    return Note.create(updateObj);
  })
  .then(result => res.json((result)))
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(error => console.log('SpaghettiOs'));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;