# Student Management System - Wireframes

## Project Structure

```
student-management-mern/
├── server/                          # Backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js                 # User model (Teacher/Student)
│   │   ├── StudentProfile.js       # Extended student data
│   │   ├── Subject.js              # Subject/course data
│   │   ├── Attendance.js           # Attendance records
│   │   ├── Marks.js                # Student marks/grades
│   │   ├── Assignment.js           # Assignments
│   │   ├── Announcement.js         # Teacher announcements
│   │   └── StudyPlan.js            # Student study plans
│   ├── controllers/
│   │   ├── authController.js       # Authentication
│   │   ├── teacherController.js    # Teacher operations
│   │   ├── studentController.js    # Student operations
│   │   └── realTimeController.js   # Socket.io handlers
│   ├── routes/
│   │   ├── auth.js                 # Auth routes
│   │   ├── teacher.js              # Teacher routes
│   │   └── student.js              # Student routes
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   └── roleCheck.js            # Role-based access
│   ├── utils/
│   │   └── seedTeacher.js          # Pre-configured teacher
│   └── server.js                   # Main entry
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   └── SkeletonLoader.jsx
│   │   │   ├── teacher/
│   │   │   │   ├── StudentTable.jsx
│   │   │   │   ├── AttendanceManager.jsx
│   │   │   │   ├── MarksManager.jsx
│   │   │   │   ├── AssignmentManager.jsx
│   │   │   │   └── Analytics.jsx
│   │   │   └── student/
│   │   │       ├── ProfileCard.jsx
│   │   │       ├── AttendanceView.jsx
│   │   │       ├── MarksView.jsx
│   │   │       ├── StudyPlanner.jsx
│   │   │       ├── WeakSubjectDetector.jsx
│   │   │       └── ProgressTracker.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── StudyPlanner.jsx
│   │   │   └── Analytics.jsx
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useRealTime.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── teacherService.js
│   │   │   └── studentService.js
│   │   └── utils/
│   │       └── helpers.js
│   └── package.json
└── package.json                    # Root package.json
```

## Wireframes

### 1. Landing Page
```
+------------------------------------------+
|                 [LOGO]                   |
|                                          |
|     Student Management System            |
|     Your Academic Journey, Simplified    |
|                                          |
|            [    Login    ]               |
|                                          |
+------------------------------------------+
```

### 2. Login Page
```
+------------------------------------------+
|                                          |
|              [LOGO]                      |
|                                          |
|     +------------------------+           |
|     |      Login            |           |
|     |                       |           |
|     |  Email: [          ]  |           |
|     |  Password: [     ]  |           |
|     |                       |           |
|     |  [    Sign In    ]    |           |
|     |                       |           |
|     |  Demo: teacher@email  |           |
|     +------------------------+           |
|                                          |
+------------------------------------------+
```

### 3. Teacher Dashboard Layout
```
+------------+-------------------------------------------+
|            |  [Search]        [Notifications] [Profile] |
|   [LOGO]   +-------------------------------------------+
|            |                                           |
|  Dashboard |   +-------+ +-------+ +-------+          |
|  Students  |   |Total  | |Today's| |Pending|          |
|  Subjects  |   |Students| |Attend.| |Tasks  |          |
|  Attendance|   +-------+ +-------+ +-------+          |
|  Marks     |                                           |
|  Assignment|   +----------------------------------+     |
|  Analytics |   |      Student Performance        |     |
|  Announce  |   |         [CHART]                  |     |
|  Materials |   +----------------------------------+     |
|            |                                           |
|  Logout    |   +----------------------------------+     |
|            |   |    Recent Students Table      |     |
|            |   +----------------------------------+     |
+------------+-------------------------------------------+
```

### 4. Student Dashboard Layout
```
+------------+-------------------------------------------+
|            |  [Streak 🔥5] [Notifications] [Profile]    |
|   [LOGO]   +-------------------------------------------+
|            |                                           |
|  Dashboard |   +-------+ +-------+ +-------+          |
|  My Profile|   |Product.| |Attendance| |Avg    |          |
|  Subjects  |   |Score   | |  85%    | |Marks  |          |
|  Attendance|   +-------+ +-------+ +-------+          |
|  Marks     |                                           |
|  Assignment|   +----------------------------------+     |
|  Study Plan|   |      Weak Subjects Alert         |     |
|  Materials |   |   [Math: Needs Improvement]      |     |
|  Analytics |   +----------------------------------+     |
|            |                                           |
|  Logout    |   +----------------------------------+     |
|            |   |      Upcoming Assignments       |     |
|            |   +----------------------------------+     |
+------------+-------------------------------------------+
```

### 5. Study Planner Page
```
+------------+-------------------------------------------+
|            |         Study Planner                     |
|   [LOGO]   +-------------------------------------------+
|            |                                           |
|  ...       |   +------------------+ +---------------+  |
|  ...       |   |    CALENDAR      | |  Today's Plan |  |
|  Study Plan|   |                  | |               |  |
|  ...       |   |  [M] [T] [W] ... | | - Math (2h)   |  |
|            |   |                  | | - Physics(1h) |  |
|            |   |  [Study Streak]  | | - Break       |  |
|            |   |  [Goals]         | | - Chemistry   |  |
|            |   +------------------+ +---------------+  |
|            |                                           |
|            |   +----------------------------------+     |
|            |   |    Weekly Progress Bar          |     |
|            |   +----------------------------------+     |
+------------+-------------------------------------------+
```

## Design System

### Colors
- **Background**: #FFFFFF (pure white)
- **Primary**: #3B82F6 (blue-500)
- **Secondary**: #10B981 (emerald-500)
- **Text Primary**: #1F2937 (gray-800)
- **Text Secondary**: #6B7280 (gray-500)
- **Border**: #E5E7EB (gray-200)
- **Card Background**: #FFFFFF
- **Success**: #10B981
- **Warning**: #F59E0B
- **Danger**: #EF4444

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: font-semibold
- **Body**: font-normal
- **Small**: text-sm

### Spacing
- **Card Padding**: p-6
- **Card Gap**: gap-6
- **Section Gap**: gap-8
- **Border Radius**: rounded-lg (8px), rounded-xl (12px)

### Shadows
- **Card Shadow**: shadow-sm
- **Hover Shadow**: shadow-md
- **Dropdown Shadow**: shadow-lg

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login user
- POST `/api/auth/register` - Register student
- GET `/api/auth/me` - Get current user

### Teacher Routes (Protected)
- GET `/api/teacher/students` - List all students
- POST `/api/teacher/students` - Add student
- PUT `/api/teacher/students/:id` - Update student
- DELETE `/api/teacher/students/:id` - Delete student
- POST `/api/teacher/attendance` - Update attendance
- POST `/api/teacher/marks` - Assign marks
- POST `/api/teacher/assignments` - Create assignment
- POST `/api/teacher/announcements` - Post announcement
- GET `/api/teacher/analytics` - Get analytics

### Student Routes (Protected)
- GET `/api/student/profile` - Get profile
- GET `/api/student/attendance` - View attendance
- GET `/api/student/marks` - View marks
- GET `/api/student/assignments` - View assignments
- GET `/api/student/materials` - View materials
- GET `/api/student/study-plan` - Get study plan
- POST `/api/student/study-plan` - Update study plan

## Real-Time Events (Socket.io)

### Teacher Emits
- `attendance_updated` → All students see update
- `marks_updated` → Affected student sees update
- `assignment_created` → All students see new assignment
- `announcement_posted` → All students see announcement
- `material_uploaded` → All students see new material

### Student Emits
- `study_plan_updated` → Student's own update
- `progress_updated` → Analytics update
