'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');

/* ========== GET ALL FOLDERS ========== */
router.get('/', (req, res, next) => {
  
  Folder.find()
    .sort({ name: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      // next(err);
    });
});

/* ========== GET/READ A SINGLE FOLDER ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

// Validate user input 
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder.findById(id)
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

/* ========== POST/CREATE A FOLDER ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const folder = { name };

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }

  Folder.create(folder)
  .then(result => {
    if (result) {
      res.location(`http://${req.headers.host}/folders/${result.id}`).status(201).json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    if (err.code === 11000) {
      err = new Error('The folder name already exists');
      err.status = 400;
    }
    next(err);
  });
});

/* ========== PUT/UPDATE A SINGLE FOLDER ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body

// Validate user input
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The folder id is invalid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }
    Folder.findOneAndUpdate(
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
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE FOLDER ========== */
router.delete('/:id', async (req, res, next) => { 
const { id } = req.params;
// Validate user input
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The folder is invalid');
    err.status = 400;
    return next(err);
  }
  const folder = await Folder.findOneAndDelete(id);
  if (!folder) {
    return next();
  } 
      await Note.deleteMany({folderId: id});
      res.sendStatus(204);
});
       
module.exports = router;