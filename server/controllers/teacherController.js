const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const StudyMaterial = require('../models/StudyMaterial');
const StudyPlan = require('../models/StudyPlan');

const teacherController = {
  // Get all students
  getAllStudents: async (req, res) => {
    try {
      const { class: className, section, search } = req.query;
      
      let query = { role: 'student' };
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query).select('-password');
      
      let studentProfiles = await StudentProfile.find({
        user: { $in: users.map(u => u._id) }
      }).populate('user', '-password').populate('subjects', 'name code');

      if (className) {
        studentProfiles = studentProfiles.filter(p => p.class === className);
      }
      if (section) {
        studentProfiles = studentProfiles.filter(p => p.section === section);
      }

      res.json(studentProfiles);
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add new student
  addStudent: async (req, res) => {
    try {
      const { email, password, fullName, phone, rollNumber, class: studentClass, section, subjects } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Student already exists' });
      }

      const user = new User({
        email,
        password: password || 'student123',
        fullName,
        role: 'student',
        phone: phone || ''
      });
      await user.save();

      const studentProfile = new StudentProfile({
        user: user._id,
        rollNumber,
        class: studentClass,
        section: section || 'A',
        subjects: subjects || []
      });
      await studentProfile.save();

      // Create study plan
      const studyPlan = new StudyPlan({
        student: user._id,
        tasks: [],
        weeklyGoals: []
      });
      await studyPlan.save();

      // Notify via socket
      const io = req.app.get('io');
      io.emit('student_added', { student: studentProfile });

      res.status(201).json({ message: 'Student added successfully', student: studentProfile });
    } catch (error) {
      console.error('Add student error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update student
  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, phone, rollNumber, class: studentClass, section, subjects, isActive } = req.body;

      const profile = await StudentProfile.findById(id).populate('user');
      if (!profile) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Update user
      if (fullName || phone !== undefined || isActive !== undefined) {
        await User.findByIdAndUpdate(profile.user._id, {
          fullName,
          phone,
          isActive
        });
      }

      // Update profile
      profile.rollNumber = rollNumber || profile.rollNumber;
      profile.class = studentClass || profile.class;
      profile.section = section || profile.section;
      if (subjects) profile.subjects = subjects;
      await profile.save();

      const io = req.app.get('io');
      io.emit('student_updated', { student: profile });

      res.json({ message: 'Student updated successfully', student: profile });
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete student
  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;
      
      const profile = await StudentProfile.findById(id);
      if (!profile) {
        return res.status(404).json({ message: 'Student not found' });
      }

      await User.findByIdAndDelete(profile.user);
      await StudentProfile.findByIdAndDelete(id);
      await StudyPlan.findOneAndDelete({ student: profile.user });

      const io = req.app.get('io');
      io.emit('student_deleted', { studentId: id });

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all subjects
  getSubjects: async (req, res) => {
    try {
      const subjects = await Subject.find().sort({ name: 1 });
      res.json(subjects);
    } catch (error) {
      console.error('Get subjects error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add subject
  addSubject: async (req, res) => {
    try {
      const { name, code, description, totalMarks, passMarks, credits } = req.body;

      const existing = await Subject.findOne({ code });
      if (existing) {
        return res.status(400).json({ message: 'Subject code already exists' });
      }

      const subject = new Subject({
        name,
        code,
        description,
        totalMarks: totalMarks || 100,
        passMarks: passMarks || 40,
        credits: credits || 3
      });
      await subject.save();

      res.status(201).json(subject);
    } catch (error) {
      console.error('Add subject error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update attendance
  updateAttendance: async (req, res) => {
    try {
      const { studentId, date, status, subject, notes } = req.body;

      let attendance = await Attendance.findOne({
        student: studentId,
        date: new Date(date)
      });

      if (attendance) {
        attendance.status = status;
        attendance.notes = notes;
        await attendance.save();
      } else {
        attendance = new Attendance({
          student: studentId,
          date: new Date(date),
          status,
          subject,
          markedBy: req.user.id,
          notes
        });
        await attendance.save();
      }

      const io = req.app.get('io');
      io.to(`student_${studentId}`).emit('attendance_updated', { attendance });

      res.json({ message: 'Attendance updated', attendance });
    } catch (error) {
      console.error('Update attendance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get attendance for a date
  getAttendance: async (req, res) => {
    try {
      const { date, class: className } = req.query;
      
      const query = { date: new Date(date) };
      if (className) {
        const students = await StudentProfile.find({ class: className });
        query.student = { $in: students.map(s => s.user) };
      }

      const attendance = await Attendance.find(query)
        .populate('student', 'fullName email')
        .populate('subject', 'name');

      res.json(attendance);
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add/Update marks
  addMarks: async (req, res) => {
    try {
      const { studentId, subject, examType, marksObtained, totalMarks, remarks } = req.body;

      let marks = await Marks.findOne({ student: studentId, subject, examType });

      if (marks) {
        marks.marksObtained = marksObtained;
        marks.totalMarks = totalMarks || 100;
        marks.remarks = remarks;
        await marks.save();
      } else {
        marks = new Marks({
          student: studentId,
          subject,
          examType,
          marksObtained,
          totalMarks: totalMarks || 100,
          remarks,
          markedBy: req.user.id
        });
        await marks.save();
      }

      await marks.populate('subject', 'name code');

      const io = req.app.get('io');
      io.to(`student_${studentId}`).emit('marks_updated', { marks });

      res.json({ message: 'Marks updated', marks });
    } catch (error) {
      console.error('Add marks error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get student marks
  getStudentMarks: async (req, res) => {
    try {
      const { studentId } = req.params;
      
      const marks = await Marks.find({ student: studentId })
        .populate('subject', 'name code')
        .sort({ examDate: -1 });

      res.json(marks);
    } catch (error) {
      console.error('Get marks error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create assignment
  createAssignment: async (req, res) => {
    try {
      const { title, description, subject, dueDate, totalMarks, assignedTo } = req.body;

      const assignment = new Assignment({
        title,
        description,
        subject,
        dueDate: new Date(dueDate),
        totalMarks: totalMarks || 100,
        createdBy: req.user.id,
        assignedTo: assignedTo || [],
        status: 'published'
      });
      await assignment.save();

      await assignment.populate('subject', 'name');

      const io = req.app.get('io');
      io.emit('assignment_created', { assignment });

      res.status(201).json({ message: 'Assignment created', assignment });
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all assignments
  getAssignments: async (req, res) => {
    try {
      const assignments = await Assignment.find()
        .populate('subject', 'name code')
        .populate('createdBy', 'fullName')
        .sort({ dueDate: 1 });

      res.json(assignments);
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Post announcement
  postAnnouncement: async (req, res) => {
    try {
      const { title, content, targetAudience, targetClasses, priority } = req.body;

      const announcement = new Announcement({
        title,
        content,
        postedBy: req.user.id,
        targetAudience: targetAudience || 'all',
        targetClasses: targetClasses || [],
        priority: priority || 'normal'
      });
      await announcement.save();

      const io = req.app.get('io');
      io.emit('announcement_posted', { announcement });

      res.status(201).json({ message: 'Announcement posted', announcement });
    } catch (error) {
      console.error('Post announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all announcements
  getAnnouncements: async (req, res) => {
    try {
      const announcements = await Announcement.find({ isActive: true })
        .populate('postedBy', 'fullName')
        .sort({ createdAt: -1 });

      res.json(announcements);
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Upload study material
  uploadMaterial: async (req, res) => {
    try {
      const { title, description, subject, type, url, targetClasses } = req.body;

      const material = new StudyMaterial({
        title,
        description,
        subject,
        type,
        url,
        uploadedBy: req.user.id,
        targetClasses: targetClasses || []
      });
      await material.save();

      await material.populate('subject', 'name');
      await material.populate('uploadedBy', 'fullName');

      const io = req.app.get('io');
      io.emit('material_uploaded', { material });

      res.status(201).json({ message: 'Material uploaded', material });
    } catch (error) {
      console.error('Upload material error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get analytics
  getAnalytics: async (req, res) => {
    try {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalSubjects = await Subject.countDocuments();
      const totalAssignments = await Assignment.countDocuments();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAttendance = await Attendance.countDocuments({
        date: today,
        status: 'present'
      });

      // Class distribution
      const classDistribution = await StudentProfile.aggregate([
        { $group: { _id: '$class', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // Recent marks average
      const marksData = await Marks.aggregate([
        {
          $group: {
            _id: '$subject',
            avgMarks: { $avg: '$marksObtained' }
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: '_id',
            foreignField: '_id',
            as: 'subject'
          }
        },
        { $unwind: '$subject' },
        {
          $project: {
            subjectName: '$subject.name',
            avgMarks: 1
          }
        }
      ]);

      res.json({
        totalStudents,
        totalSubjects,
        totalAssignments,
        todayAttendance,
        classDistribution,
        marksData
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = teacherController;
