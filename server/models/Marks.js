const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'practical', 'project'],
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    default: 'F'
  },
  remarks: {
    type: String,
    default: ''
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

marksSchema.pre('save', function(next) {
  this.percentage = (this.marksObtained / this.totalMarks) * 100;
  const p = this.percentage;
  if (p >= 90) this.grade = 'A+';
  else if (p >= 80) this.grade = 'A';
  else if (p >= 70) this.grade = 'B+';
  else if (p >= 60) this.grade = 'B';
  else if (p >= 50) this.grade = 'C+';
  else if (p >= 40) this.grade = 'C';
  else if (p >= 33) this.grade = 'D';
  else this.grade = 'F';
  next();
});

marksSchema.index({ student: 1, subject: 1 });
marksSchema.index({ examDate: -1 });

module.exports = mongoose.model('Marks', marksSchema);
