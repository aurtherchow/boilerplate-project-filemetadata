const mongoose = require('mongoose');
const { defineModel } = require('./dbCommon');

const fileModel = defineModel('fileModel', {
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = fileModel;
