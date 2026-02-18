const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  parentName: {
    type: String,
    default: ''
  },
  parentPhone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
