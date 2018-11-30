'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let filters = {};
    if (searchTerm) {
      const rx = new RegExp(searchTerm, 'i');
      filters.$or = [{'title' : rx},{'content' : rx}]
    };
    
  Note.find(filters).sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
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
  const { id } = req.params;

  Note.findById(id)
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

// router.delete('/:id', async (req, res, next) => {
  
//   const { id } = req.params;
//   // Validate user input
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       const err = new Error('The folder is is invalid');
//       err.status = 400;
//       return next(err);
//     }
//     const folder = await Folder.findOneAndDelete(id);
//     if (!folder) {
//       return next();
//     }
//         await Note.deleteMany({folderId: id});
//         res.sendStatus(204);
//   });
module.exports = router;