const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'doc', 'ppt', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileSize: {
    type: String,
    default: ''
  },
  downloads: {
    type: Number,
    default: 0
  },
  targetClasses: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

studyMaterialSchema.index({ subject: 1 });
studyMaterialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
