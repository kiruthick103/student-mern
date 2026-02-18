const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const StudyPlan = require('../models/StudyPlan');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
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
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Register student (teacher only can add students, but this allows self-registration too)
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, fullName, role, phone, class: studentClass, section, rollNumber } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      const user = new User({
        email,
        password,
        fullName,
        role: role || 'student',
        phone: phone || ''
      });

      await user.save();

      // If student, create student profile
      if (user.role === 'student') {
        const studentProfile = new StudentProfile({
          user: user._id,
          rollNumber: rollNumber || `STU${Date.now()}`,
          class: studentClass || '10',
          section: section || 'A'
        });
        await studentProfile.save();

        // Create study plan
        const studyPlan = new StudyPlan({
          student: user._id,
          tasks: [],
          weeklyGoals: []
        });
        await studyPlan.save();
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
      const user = await User.findById(req.user.id).select('-password');
      
      let profile = null;
      if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id })
          .populate('subjects', 'name code')
          .populate('user', '-password');
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
