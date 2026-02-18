const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const StudyPlan = require('../models/StudyPlan');
const localDB = require('../utils/localDB');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Try Local DB first (Demo Mode)
      let user = localDB.findOne('users', { email });

      // If not in local DB, handle default demo users
      if (!user && email === 'kiruthick3238q@gmail.com' && password === '12345') {
        user = localDB.insertOne('users', {
          email: 'kiruthick3238q@gmail.com',
          password: await bcrypt.hash('12345', 10),
          role: 'teacher',
          fullName: 'Kiruthick (Teacher)',
          isActive: true
        });
      } else if (!user && email === 'student@example.com' && password === '12345') {
        user = localDB.insertOne('users', {
          email: 'student@example.com',
          password: await bcrypt.hash('12345', 10),
          role: 'student',
          fullName: 'John Doe (Student)',
          isActive: true
        });
      }

      if (!user) {
        // Try real Mongo if connected
        try {
          user = await User.findOne({ email });
        } catch (e) { /* DB down */ }
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Register student (teacher only can add students, but this allows self-registration too)
  register: async (req, res) => {
    try {
      const { email, password, fullName, role, class: studentClass, section, rollNumber } = req.body;

      // Check if user exists in local DB
      const existingUser = localDB.findOne('users', { email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create in local DB
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = localDB.insertOne('users', {
        email,
        password: hashedPassword,
        fullName,
        role: role || 'student',
        isActive: true
      });

      if (user.role === 'student') {
        localDB.insertOne('studentProfiles', {
          user: user._id,
          rollNumber: rollNumber || `STU${Date.now()}`,
          class: studentClass || '10',
          section: section || 'A',
          subjects: []
        });

        localDB.insertOne('studyPlans', {
          student: user._id,
          tasks: [],
          weeklyGoals: []
        });
      }

      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get current user
  getMe: async (req, res) => {
    try {
      let user = null;
      try {
        user = await User.findById(req.user.id).select('-password');
      } catch (e) { }

      if (!user) {
        user = localDB.findById('users', req.user._id);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          user = userWithoutPassword;
          user.id = user._id;
        }
      }

      if (!user) return res.status(404).json({ message: 'User not found' });

      let profile = null;
      if (user.role === 'student') {
        try {
          profile = await StudentProfile.findOne({ user: user.id || user._id })
            .populate('subjects', 'name code');
        } catch (e) { }

        if (!profile) {
          profile = localDB.findOne('studentProfiles', { user: user.id || user._id });
        }
      }

      res.json({
        user,
        profile
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { fullName, phone, avatar } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { fullName, phone, avatar },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;
