const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tasks: [{
    title: {
      type: String,
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    duration: {
      type: Number,
      default: 60
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    scheduledTime: {
      type: String,
      default: '09:00'
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  weeklyGoals: [{
    weekStart: Date,
    weekEnd: Date,
    targetHours: {
      type: Number,
      default: 20
    },
    completedHours: {
      type: Number,
      default: 0
    },
    subjects: [{
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      targetHours: Number,
      completedHours: Number
    }]
  }],
  streak: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastStudyDate: {
      type: Date
    }
  },
  weakSubjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    reason: String,
    improvementPlan: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  productivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

studyPlanSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastStudy = this.streak.lastStudyDate;
  if (lastStudy) {
    const lastStudyDate = new Date(lastStudy);
    lastStudyDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      this.streak.currentStreak += 1;
      if (this.streak.currentStreak > this.streak.longestStreak) {
        this.streak.longestStreak = this.streak.currentStreak;
      }
    } else if (diffDays > 1) {
      this.streak.currentStreak = 1;
    }
  } else {
    this.streak.currentStreak = 1;
  }
  this.streak.lastStudyDate = today;
};

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
