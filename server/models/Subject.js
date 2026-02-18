const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  passMarks: {
    type: Number,
    default: 40
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  credits: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
