'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag')
const { notes, folders, tags } = require('../db/seed/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()

    ]);
  })
  .then(results => {
    console.info(`Inserted ${results[0].length} notes`);
    console.info(`Inserted ${results[1].length} folders`);
    console.info(`Inserted ${results[2].length} tags`)
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });