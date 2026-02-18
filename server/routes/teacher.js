const express = require('express');
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/auth');
const { isTeacher } = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and teacher role
router.use(auth, isTeacher);

// Students
router.get('/students', teacherController.getAllStudents);
router.post('/students', teacherController.addStudent);
router.put('/students/:id', teacherController.updateStudent);
router.delete('/students/:id', teacherController.deleteStudent);

// Subjects
router.get('/subjects', teacherController.getSubjects);
router.post('/subjects', teacherController.addSubject);

// Attendance
router.get('/attendance', teacherController.getAttendance);
router.post('/attendance', teacherController.updateAttendance);

// Marks
router.get('/marks/:studentId', teacherController.getStudentMarks);
router.post('/marks', teacherController.addMarks);

// Assignments
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', teacherController.createAssignment);
router.get('/assignments/:id/submissions', teacherController.getAssignmentSubmissions);

// Announcements
router.get('/announcements', teacherController.getAnnouncements);
router.post('/announcements', teacherController.postAnnouncement);

// Study Materials
router.get('/materials', teacherController.getMaterials);
router.post('/materials', teacherController.uploadMaterial);

// Analytics
router.get('/analytics', teacherController.getAnalytics);

module.exports = router;
