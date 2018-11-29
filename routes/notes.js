'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  
  let filters = {};
    if (req.query.searchTerm) {
      filters = { $or: [{title : { $regex: req.query.searchTerm, $options: 'i' }},
      {content : { $regex: req.query.searchTerm, $options: 'i'}}
      ]};
    }
  Note.find(filters).sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
    });
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
  const { title, content } = req.body;
  const note = { title, content }
  Note.create(note)
  // })
  .then(result => {
    if (result) {
      res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);
    } else {
      next();
    }
  })
  .catch(error => {
    next(error);
  })
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title , content} = req.body
    Note.findOneAndUpdate({_id: id}, {$set: {title, content, id}}, 
      {new: true, upsert: true}
    )
  .then(result => {
    res.json(result)})
  .catch(error => {
    console.log('Error');
    res.status(400).json({"Error" : "ID not found"});
  })
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  Note.findOneAndDelete(id)
  //  })
   .then(res.sendStatus(204).end())
   .catch(() => {
  res.status(400).json({"Error": "Note Id not found"});
   })
});
   
    


module.exports = router;