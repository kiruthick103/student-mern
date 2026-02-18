const express = require('express');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { isStudent } = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and student role
router.use(auth, isStudent);

// Profile
router.get('/profile', studentController.getMyProfile);

// Subjects
router.get('/subjects', studentController.getSubjects);

// Attendance
router.get('/attendance', studentController.getMyAttendance);

// Marks
router.get('/marks', studentController.getMyMarks);

// Assignments
router.get('/assignments', studentController.getMyAssignments);
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

// Study Materials
router.get('/materials', studentController.getStudyMaterials);

// Announcements
router.get('/announcements', studentController.getAnnouncements);

// Study Plan
router.get('/study-plan', studentController.getStudyPlan);
router.post('/study-plan/tasks', studentController.addStudyTask);
router.put('/study-plan/tasks/:taskId/complete', studentController.completeTask);
router.post('/study-plan/weak-subjects', studentController.addWeakSubject);

// Analytics
router.get('/analytics', studentController.getMyAnalytics);

module.exports = router;
