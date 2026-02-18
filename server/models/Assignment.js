const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    files: [{
      name: String,
      url: String
    }],
    marks: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted'
    }
  }]
}, {
  timestamps: true
});

assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ subject: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
