'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');
const Tag = require('../models/tag');

/* ========== GET ALL Tags ========== */
router.get('/', (req, res, next) => {
  
  Tag.find()
    .sort({ name: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      // next(err);
    });
});

/* ========== GET/READ A SINGLE tag ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

// Validate user input 
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE A TAG ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const tag = { name };

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }

  Tag.create(tag)
  .then(result => {
    if (result) {
      res.location(`http://${req.headers.host}/tags/${result.id}`).status(201).json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    if (err.code === 11000) {
      err = new Error('The tag name already exists');
      err.status = 400;
    }
    next(err);
  });
});

// /* ========== PUT/UPDATE A SINGLE TAG ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body

// Validate user input
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The tag id is invalid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }
    Tag.findOneAndUpdate(
      {_id: id}, {$set: {name, id}}, 
      {new: true, upsert: false}
    )
    .then(result => {
      if (result) {
        res.json(result)
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE tag ========== */
router.delete('/:id', async (req, res, next) => { 
const { id } = req.params;
// Validate user input
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The tag is invalid');
    err.status = 400;
    return next(err);
  }
  const tag = await Tag.findOneAndDelete(id);
  if (!tag) {
    return next();
  } 
  await Note.updateMany({tags: id}, {$pull: {tags: id}});
  res.sendStatus(204);
});
       
module.exports = router;