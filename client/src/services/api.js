import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Teacher Service
export const teacherService = {
  // Students
  getStudents: (params) => api.get('/teacher/students', { params }),
  addStudent: (data) => api.post('/teacher/students', data),
  updateStudent: (id, data) => api.put(`/teacher/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/teacher/students/${id}`),

  // Subjects
  getSubjects: () => api.get('/teacher/subjects'),
  addSubject: (data) => api.post('/teacher/subjects', data),

  // Attendance
  getAttendance: (params) => api.get('/teacher/attendance', { params }),
  updateAttendance: (data) => api.post('/teacher/attendance', data),

  // Marks
  getStudentMarks: (studentId) => api.get(`/teacher/marks/${studentId}`),
  addMarks: (data) => api.post('/teacher/marks', data),

  // Assignments
  getAssignments: () => api.get('/teacher/assignments'),
  createAssignment: (data) => api.post('/teacher/assignments', data),
  getAssignmentSubmissions: (id) => api.get(`/teacher/assignments/${id}/submissions`),

  // Announcements
  getAnnouncements: () => api.get('/teacher/announcements'),
  postAnnouncement: (data) => api.post('/teacher/announcements', data),

  // Materials
  getMaterials: () => api.get('/teacher/materials'),
  uploadMaterial: (data) => api.post('/teacher/materials', data),

  // Analytics
  getAnalytics: () => api.get('/teacher/analytics')
};

// Student Service
export const studentService = {
  // Profile
  getProfile: () => api.get('/student/profile'),

  // Subjects
  getSubjects: () => api.get('/student/subjects'),

  // Attendance
  getAttendance: (params) => api.get('/student/attendance', { params }),

  // Marks
  getMarks: () => api.get('/student/marks'),

  // Assignments
  getAssignments: () => api.get('/student/assignments'),
  submitAssignment: (assignmentId, data) => api.post(`/student/assignments/${assignmentId}/submit`, data),

  // Materials
  getMaterials: (params) => api.get('/student/materials', { params }),

  // Announcements
  getAnnouncements: () => api.get('/student/announcements'),

  // Study Plan
  getStudyPlan: () => api.get('/student/study-plan'),
  addStudyTask: (data) => api.post('/student/study-plan/tasks', data),
  completeTask: (taskId) => api.put(`/student/study-plan/tasks/${taskId}/complete`),
  addWeakSubject: (data) => api.post('/student/study-plan/weak-subjects', data),

  // Analytics
  getAnalytics: () => api.get('/student/analytics')
};

export default api;
