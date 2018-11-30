'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }
  if (folderId) {
    filter.folderId = folderId
  }

  if(tagId) {
    filter.tags = tagId
  }

  return Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .populate('folderId')
    .populate('tags')
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;
  const newNote = { title, content};

  if(folderId) { // If folderId is valid, assign to new object
     newNote.folderId = folderId
  }

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing title in request body');
    err.status = 400;
    return next(err);
  }
  // Validate user input
  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The folder is invalid');
    err.status = 400;
    return next(err);
  }

  Note.create(newNote)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId } = req.body;

  const newNote = { title, content};

  if(folderId) { // If folderId is valid, assign to new object
     newNote.folderId = folderId
  }
  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing title in request body');
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  } 
  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The folder is invalid');
    err.status = 400;
    return next(err);
  } 

  const updateNote = { title, content, folderId };

  if (folderId === '') {
    delete updateNote.folderId
    updateNote.$unset = { folderId: ''};
  }

  Note.findByIdAndUpdate(id, updateNote, { new: true })
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

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;