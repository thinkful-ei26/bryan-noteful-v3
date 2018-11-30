'use strict';

// Load requirements
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { notes } = require('../db/seed/data');
const data = require('../db/seed/data')
mongoose.set('debug',true);  // Good thing to have


// Expect assertion library
const expect = chai.expect;

// Load chai Http
chai.use(chaiHttp);

// Mocha hooks
describe('hooks', function() {
  // Connect to the DB before all tests
  before(function () {
    mongoose.connect(TEST_MONGODB_URI, {useNewUrlParser: true})
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

// Serial Request - Call API then call DB then compare
  describe('POST /api/notes', function() {
    it('Should create a new note, return 201 status (Created), be a json object with proper content fields', function() {
      const newNote = {
        'title': 'Test title',
        'content': 'Test content',
        'folderId' : '12987238903'
      };
      // Defining res so is available in both .then scope
      let res;
      // Call the API first to pass through 
      chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function (response) {
          //accessing our predefined res
          res = response;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt');
          // Call the database and return the Note with the ID matching the request body
          return Note.findById(res.body.id)
        })
        // Compare the API response with the database response
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          // expect(res.body).to.eql(data);
        })
      })
  });

  describe('GET /api/notes/:id', function() {
    it('Should return the correct note with the correct status', function () {
      let data;
      // 1) First, call the database (we need to access DB because thats were the ID is)
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) We use the ID we received from the DB and feed it into API
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt');

          // 3) Compare results from DB with response from API
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('GET /api/notes', function() {
    it('Should query DB and get all Notes', function() {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
    return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
      // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    })
  });

  describe('DELETE /api/notes/:id', function () {
    it("Should query the DB for the ID and delete the matching note", function() {
      // Add new note to db, should receive id if properly executed through Mongoose model
      let note = new Note ({title: "Delete me", content: "Delete me too"});
      note.save((err, note) => {
        // Query DB for new note
        chai.request(app)
        // Run through API
        .delete(`/api/notes/${note.id}`)
        // Check if executed
        .then((res) => {
          expect(res).to.have.status(204);
        })
      })
    })
  })

  describe('PUT /api/notes/:id', function() {
    it('Should query DB for ID, run PUT request through API and return updated content and title', function () {
      let note = new Note ({title: "Update Me!", content: "Hey you should update me too"})
      note.save((err, note) => {
        chai.request(app)
        .put(`/api/notes/${note.id}`)
        .send({title: "I am updated!", content: "I am updated too!"})
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(note.id);
          // expect(res.body.title).to.equal(note.title);
          // expect(res.body.content).to.equal(note.content);
          // console.log('---' + res.body.createdAt + '---')
          // console.log('---' + note.createdAt + '---')
          // expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
          // expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt); Work on doing this later
        })
      })
    })
  })
                 
});