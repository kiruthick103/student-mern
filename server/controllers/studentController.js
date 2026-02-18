const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const StudyMaterial = require('../models/StudyMaterial');
const StudyPlan = require('../models/StudyPlan');

const studentController = {
  // Get my profile
  getMyProfile: async (req, res) => {
    try {
      const profile = await StudentProfile.findOne({ user: req.user.id })
        .populate('user', '-password')
        .populate('subjects', 'name code totalMarks passMarks');

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get my attendance
  getMyAttendance: async (req, res) => {
    try {
      const { month, year } = req.query;
      
      let query = { student: req.user.id };
      
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        query.date = { $gte: startDate, $lte: endDate };
      }

      const attendance = await Attendance.find(query)
        .populate('subject', 'name')
        .sort({ date: -1 });

      // Calculate statistics
      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

      res.json({
        attendance,
        stats: { total, present, absent, late, percentage }
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get my marks
  getMyMarks: async (req, res) => {
    try {
      const marks = await Marks.find({ student: req.user.id })
        .populate('subject', 'name code totalMarks')
        .sort({ examDate: -1 });

      // Group by subject
      const subjectWise = {};
      marks.forEach(mark => {
        const subjectId = mark.subject._id.toString();
        if (!subjectWise[subjectId]) {
          subjectWise[subjectId] = {
            subject: mark.subject,
            marks: []
          };
        }
        subjectWise[subjectId].marks.push(mark);
      });

      // Calculate overall average
      const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
      const average = marks.length > 0 ? (totalMarks / marks.length).toFixed(2) : 0;

      // Determine weak subjects (below 60%)
      const weakSubjects = Object.values(subjectWise).filter(subject => {
        const avg = subject.marks.reduce((sum, m) => sum + m.percentage, 0) / subject.marks.length;
        return avg < 60;
      });

      res.json({
        marks,
        subjectWise: Object.values(subjectWise),
        average,
        weakSubjects
      });
    } catch (error) {
      console.error('Get marks error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get my assignments
  getMyAssignments: async (req, res) => {
    try {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      
      // Get assignments assigned to me or to my class
      const assignments = await Assignment.find({
        $or: [
          { assignedTo: req.user.id },
          { targetClasses: profile?.class },
          { status: 'published' }
        ]
      })
        .populate('subject', 'name')
        .populate('createdBy', 'fullName')
        .sort({ dueDate: 1 });

      // Check submission status for each
      const assignmentsWithStatus = assignments.map(assignment => {
        const submission = assignment.submissions.find(
          s => s.student.toString() === req.user.id.toString()
        );
        return {
          ...assignment.toObject(),
          mySubmission: submission || null
        };
      });

      res.json(assignmentsWithStatus);
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Submit assignment
  submitAssignment: async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const { files, notes } = req.body;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Check if already submitted
      const existingSubmission = assignment.submissions.find(
        s => s.student.toString() === req.user.id.toString()
      );

      const isLate = new Date() > new Date(assignment.dueDate);

      if (existingSubmission) {
        existingSubmission.files = files;
        existingSubmission.notes = notes;
        existingSubmission.submittedAt = new Date();
        existingSubmission.status = isLate ? 'late' : 'submitted';
      } else {
        assignment.submissions.push({
          student: req.user.id,
          files,
          notes,
          submittedAt: new Date(),
          status: isLate ? 'late' : 'submitted'
        });
      }

      await assignment.save();

      res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
      console.error('Submit assignment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get study materials
  getStudyMaterials: async (req, res) => {
    try {
      const { subject } = req.query;
      
      const profile = await StudentProfile.findOne({ user: req.user.id });
      
      let query = { isActive: true };
      if (subject) {
        query.subject = subject;
      }

      // Show materials for my class or all classes
      query.$or = [
        { targetClasses: { $size: 0 } },
        { targetClasses: profile?.class }
      ];

      const materials = await StudyMaterial.find(query)
        .populate('subject', 'name')
        .populate('uploadedBy', 'fullName')
        .sort({ createdAt: -1 });

      res.json(materials);
    } catch (error) {
      console.error('Get materials error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get announcements
  getAnnouncements: async (req, res) => {
    try {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      
      let query = { isActive: true };
      
      // Filter by target audience
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetClasses: profile?.class }
      ];

      const announcements = await Announcement.find(query)
        .populate('postedBy', 'fullName')
        .sort({ createdAt: -1 });

      // Mark as read for this user
      announcements.forEach(async announcement => {
        const alreadyRead = announcement.readBy.some(
          r => r.user.toString() === req.user.id.toString()
        );
        if (!alreadyRead) {
          announcement.readBy.push({ user: req.user.id });
          await announcement.save();
        }
      });

      res.json(announcements);
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get study plan
  getStudyPlan: async (req, res) => {
    try {
      let studyPlan = await StudyPlan.findOne({ student: req.user.id })
        .populate('tasks.subject', 'name')
        .populate('weakSubjects.subject', 'name');

      if (!studyPlan) {
        studyPlan = new StudyPlan({
          student: req.user.id,
          tasks: [],
          weeklyGoals: []
        });
        await studyPlan.save();
      }

      // Get today's tasks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTasks = studyPlan.tasks.filter(task => {
        const taskDate = new Date(task.scheduledDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });

      // Get upcoming tasks
      const upcomingTasks = studyPlan.tasks
        .filter(task => new Date(task.scheduledDate) > today && !task.completed)
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
        .slice(0, 5);

      // Calculate weekly progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const thisWeekTasks = studyPlan.tasks.filter(task => {
        const taskDate = new Date(task.scheduledDate);
        return taskDate >= weekStart && taskDate <= weekEnd && task.completed;
      });
      
      const completedHours = thisWeekTasks.reduce((sum, t) => sum + (t.duration / 60), 0);

      res.json({
        studyPlan,
        todayTasks,
        upcomingTasks,
        weeklyProgress: {
          completedHours: completedHours.toFixed(1),
          targetHours: 20
        }
      });
    } catch (error) {
      console.error('Get study plan error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add study task
  addStudyTask: async (req, res) => {
    try {
      const { title, subject, priority, duration, scheduledDate, scheduledTime, notes } = req.body;

      let studyPlan = await StudyPlan.findOne({ student: req.user.id });

      if (!studyPlan) {
        studyPlan = new StudyPlan({
          student: req.user.id,
          tasks: [],
          weeklyGoals: []
        });
      }

      studyPlan.tasks.push({
        title,
        subject,
        priority: priority || 'medium',
        duration: duration || 60,
        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || '09:00',
        notes
      });

      await studyPlan.save();

      res.status(201).json({ message: 'Task added', task: studyPlan.tasks[studyPlan.tasks.length - 1] });
    } catch (error) {
      console.error('Add task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Complete task
  completeTask: async (req, res) => {
    try {
      const { taskId } = req.params;

      const studyPlan = await StudyPlan.findOne({ student: req.user.id });
      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }

      const task = studyPlan.tasks.id(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.completed = true;
      task.completedAt = new Date();
      
      // Update streak
      studyPlan.updateStreak();
      
      await studyPlan.save();

      res.json({ message: 'Task completed', streak: studyPlan.streak });
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add weak subject
  addWeakSubject: async (req, res) => {
    try {
      const { subject, reason, priority } = req.body;

      let studyPlan = await StudyPlan.findOne({ student: req.user.id });
      if (!studyPlan) {
        studyPlan = new StudyPlan({
          student: req.user.id,
          tasks: [],
          weeklyGoals: [],
          weakSubjects: []
        });
      }

      studyPlan.weakSubjects.push({
        subject,
        reason,
        priority: priority || 'high',
        improvementPlan: ''
      });

      await studyPlan.save();
      await studyPlan.populate('weakSubjects.subject', 'name');

      res.status(201).json({ message: 'Weak subject added', studyPlan });
    } catch (error) {
      console.error('Add weak subject error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get my analytics
  getMyAnalytics: async (req, res) => {
    try {
      const marks = await Marks.find({ student: req.user.id }).populate('subject', 'name');
      const attendance = await Attendance.find({ student: req.user.id });
      const studyPlan = await StudyPlan.findOne({ student: req.user.id });

      // Calculate grade trend
      const subjectGrades = {};
      marks.forEach(mark => {
        const subjectId = mark.subject._id.toString();
        if (!subjectGrades[subjectId]) {
          subjectGrades[subjectId] = {
            subject: mark.subject.name,
            marks: []
          };
        }
        subjectGrades[subjectId].marks.push(mark.percentage);
      });

      const gradeTrend = Object.values(subjectGrades).map(sg => ({
        subject: sg.subject,
        average: (sg.marks.reduce((a, b) => a + b, 0) / sg.marks.length).toFixed(2)
      }));

      // Attendance trend
      const attendanceStats = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        total: attendance.length,
        percentage: attendance.length > 0 
          ? ((attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length) * 100).toFixed(2)
          : 0
      };

      // Study stats
      const completedTasks = studyPlan?.tasks.filter(t => t.completed).length || 0;
      const totalTasks = studyPlan?.tasks.length || 0;

      res.json({
        gradeTrend,
        attendanceStats,
        studyStats: {
          streak: studyPlan?.streak.currentStreak || 0,
          longestStreak: studyPlan?.streak.longestStreak || 0,
          completedTasks,
          totalTasks,
          productivityScore: studyPlan?.productivityScore || 0
        },
        weakSubjects: studyPlan?.weakSubjects || []
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all subjects for student
  getSubjects: async (req, res) => {
    try {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      
      let subjects;
      if (profile?.subjects?.length > 0) {
        subjects = await Subject.find({ _id: { $in: profile.subjects } });
      } else {
        subjects = await Subject.find({ isActive: true });
      }

      res.json(subjects);
    } catch (error) {
      console.error('Get subjects error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = studentController;
