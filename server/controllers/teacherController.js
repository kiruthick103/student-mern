const localDB = require('../utils/localDB');
const bcrypt = require('bcryptjs');

const teacherController = {
  // Get all students
  getAllStudents: async (req, res) => {
    try {
      const { class: className, section, search } = req.query;
      let users = localDB.find('users', { role: 'student' });
      if (search) {
        users = users.filter(u =>
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      let studentProfiles = localDB.find('studentProfiles', {});
      const attendance = localDB.find('attendance', {});

      studentProfiles = studentProfiles.map(profile => ({
        ...profile,
        user: users.find(u => u._id === profile.user),
        attendance: attendance.filter(a => a.student === profile.user)
      })).filter(p => p.user);

      if (className) studentProfiles = studentProfiles.filter(p => p.class === className);
      if (section) studentProfiles = studentProfiles.filter(p => p.section === section);

      res.json(studentProfiles);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  addStudent: async (req, res) => {
    try {
      const { email, password, fullName, phone, rollNumber, class: studentClass, section, subjects } = req.body;
      if (localDB.findOne('users', { email })) return res.status(400).json({ message: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password || 'student123', 10);
      const user = localDB.insertOne('users', {
        email, password: hashedPassword, fullName, role: 'student', phone: phone || '', isActive: true
      });

      const profile = localDB.insertOne('studentProfiles', {
        user: user._id, rollNumber, class: studentClass, section: section || 'A', subjects: subjects || []
      });

      localDB.insertOne('studyPlans', { student: user._id, tasks: [], streak: { currentStreak: 0 } });
      res.status(201).json({ message: 'Student created', student: profile });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, phone, rollNumber, class: studentClass, section, subjects, isActive } = req.body;
      const profile = localDB.findById('studentProfiles', id);
      if (!profile) return res.status(404).json({ message: 'Not found' });

      localDB.findByIdAndUpdate('users', profile.user, { fullName, phone, isActive });
      const updated = localDB.findByIdAndUpdate('studentProfiles', id, { rollNumber, class: studentClass, section, subjects });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const profile = localDB.findById('studentProfiles', id);
      if (profile) {
        localDB.deleteById('users', profile.user);
        localDB.deleteById('studentProfiles', id);
      }
      res.json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Subjects
  getSubjects: async (req, res) => {
    res.json(localDB.find('subjects', {}));
  },

  addSubject: async (req, res) => {
    try {
      const subject = localDB.insertOne('subjects', req.body);
      res.status(201).json(subject);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Attendance
  getAttendance: async (req, res) => {
    res.json(localDB.find('attendance', {}));
  },

  updateAttendance: async (req, res) => {
    try {
      const { studentId, date, status, subject } = req.body;

      // Upsert: check if record exists for this student and date
      const existing = localDB.findOne('attendance', { student: studentId, date });

      if (existing) {
        localDB.findByIdAndUpdate('attendance', existing._id, { status, markedBy: req.user.id });
      } else {
        localDB.insertOne('attendance', { student: studentId, date, status, subject, markedBy: req.user.id });
      }

      const updatedAttendance = localDB.find('attendance', { student: studentId });
      res.json(updatedAttendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Marks
  getStudentMarks: async (req, res) => {
    res.json(localDB.find('marks', { student: req.params.studentId }));
  },

  addMarks: async (req, res) => {
    try {
      const mark = localDB.insertOne('marks', { ...req.body, markedBy: req.user.id });
      res.json(mark);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Assignments
  getAssignments: async (req, res) => {
    const assignments = localDB.find('assignments', {});
    const subjects = localDB.find('subjects', {});
    res.json(assignments.map(a => ({ ...a, subject: subjects.find(s => s._id === a.subject) })));
  },

  createAssignment: async (req, res) => {
    const assignment = localDB.insertOne('assignments', { ...req.body, createdBy: req.user.id, status: 'published', submissions: [] });
    res.status(201).json(assignment);
  },

  getAssignmentSubmissions: async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = localDB.findById('assignments', id);
      if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

      const users = localDB.find('users', { role: 'student' });
      const submissions = (assignment.submissions || []).map(s => ({
        ...s,
        student: users.find(u => u._id === s.student)
      }));

      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Announcements
  getAnnouncements: async (req, res) => {
    const anns = localDB.find('announcements', {});
    const users = localDB.find('users', {});
    res.json(anns.map(a => ({ ...a, postedBy: users.find(u => u._id === a.postedBy) })));
  },

  postAnnouncement: async (req, res) => {
    const ann = localDB.insertOne('announcements', { ...req.body, postedBy: req.user.id, isActive: true, createdAt: new Date() });
    res.status(201).json(ann);
  },

  // Materials
  getMaterials: async (req, res) => {
    const mats = localDB.find('studyMaterials', {});
    const subs = localDB.find('subjects', {});
    res.json(mats.map(m => ({ ...m, subject: subs.find(s => s._id === m.subject) })));
  },

  uploadMaterial: async (req, res) => {
    const mat = localDB.insertOne('studyMaterials', { ...req.body, uploadedBy: req.user.id, createdAt: new Date() });
    res.status(201).json(mat);
  },

  // Analytics
  getAnalytics: async (req, res) => {
    try {
      const students = localDB.find('users', { role: 'student' });
      const studentProfiles = localDB.find('studentProfiles', {});
      const subjects = localDB.find('subjects', {});
      const assignments = localDB.find('assignments', {});
      const attendance = localDB.find('attendance', {});
      const marks = localDB.find('marks', {});

      // Class distribution
      const classMap = {};
      studentProfiles.forEach(p => {
        classMap[p.class] = (classMap[p.class] || 0) + 1;
      });
      const classDistribution = Object.keys(classMap).map(c => ({ _id: c, count: classMap[c] }));

      // Marks by subject
      const marksBySubject = subjects.map(s => {
        const subjectMarks = marks.filter(m => m.subject === s._id);
        const avg = subjectMarks.length
          ? subjectMarks.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks) * 100, 0) / subjectMarks.length
          : 0;
        return { subjectName: s.name, avgMarks: avg };
      }).filter(m => m.avgMarks > 0);

      res.json({
        totalStudents: students.length,
        totalSubjects: subjects.length,
        totalAssignments: assignments.length,
        todayAttendance: attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
        classDistribution,
        marksData: marksBySubject
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = teacherController;
