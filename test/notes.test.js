'use strict';

// Load requirements
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const { notes } = require('../models/note');
const data = require('../db/seed/notes')

// Expect assertion library
const expect = chai.expect;

// Load chai Http
chai.use(chaiHttp);

// Mocha hooks
describe('hooks', function() {
  // Connect to the DB before all tests
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  // Seed data runs beforeEach test
  beforeEach(function () {
    return Note.insertMany(notes);
  });
  // Drop database runs afterEach test
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  // Disconnect after all tests
  after(function () {
    return mongoose.disconnect();
  });
});

