'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
// mongoose.set('debug',true);
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Tag = require('../models/tag');
const Note = require('../models/note');
const Folder = require('../models/folder')
const { notes, folders, tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Hooks', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Tag.insertMany(tags);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/tags', function () {

    it('should return the correct number of tags', function () {
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe('GET /api/tags/:id', function () {

    it('should return correct tag', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('name', 'id', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/tags/NOT-A-VALID-ID')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      return chai.request(app)
        .get('/api/tags/DOESNOTEXIST')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('POST /api/tags', function () {

    it('should create and return a new tag when provided valid data', function () {
      const newTag = {
        'name': 'Look at me I\'m a new tag'
      };
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newTag = {
        'name': undefined
      };
      return chai.request(app)
        .post('/api/folders')
        .send(newTag)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing name in request body');
        });
    });

  });

  describe('PUT /api/tags/:id', function () {
// Our UI doesn't allow for PUT requests to tags. But adding this in for future API reasons
    it('should update the tag when provided valid data', function () {
      const updateTag = {
        'name': 'I\'m updated'
      };
      let res, orig;
      return Tag.findOne()
        .then(_orig => {
          orig = _orig;
          return chai.request(app)
            .put(`/api/tags/${orig.id}`)
            .send(updateTag);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then( data => {
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(orig.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      const updateTag = {
        'name': 'Update me'
      };
      return chai.request(app)
        .put('/api/tags/NOT-A-VALID-ID')
        .send(updateTag)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The tag id is invalid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      const updateTag = {
        'name': 'Update me'
      };
      return chai.request(app)
        .put('/api/tags/DOESNOTEXIST')
        .send(updateTag)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "title" field', function () {
      const updateTag = {'name': undefined};
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
          // .then(console.log('--------------' + data + '--------------'))
            .put(`/api/tags/${data.id}`)
            .send(updateTag);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing name in request body');
        });
    });

  });

  describe('DELETE /api/tags/:id', function () {

    it('should delete an existing tag and respond with 204', function () {
      let data;
      return Tag.findOne()
      .then (_data => {
        data = _data;
           chai.request(app).delete(`/api/tags/${data._id}`)
          .then(function (res) {
            expect(res).to.have.status(204);
            return Tag.countDocuments({ _id: data.id });
          })
          .then(count => {
            expect(count).to.equal(0);
          });
        })
    });
  });

});

