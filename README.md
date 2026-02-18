# Student Management System - MERN Stack

A comprehensive Student Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring role-based authentication, real-time updates, and a clean, minimal UI.

## Features

### Teacher Features
- Student management (add, edit, delete)
- Subject management
- Attendance tracking
- Grade management
- Assignment creation and tracking
- Announcements
- Study material uploads
- Analytics and reporting
- Real-time notifications

### Student Features
- Profile management
- View attendance and grades
- Access assignments and materials
- Study planner with task management
- Weak subject detection
- Study streak tracking
- Progress analytics
- Real-time updates

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Chart.js, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **UI**: Tailwind CSS with custom components

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-management-mern
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Update MONGODB_URI with your MongoDB connection string
   # Set a secure JWT_SECRET
   ```

4. **Database Setup**
   - Ensure MongoDB is running locally or update MONGODB_URI with your cloud MongoDB connection
   - The teacher account will be automatically seeded

5. **Start the Application**
   ```bash
   # From the root directory
   npm run dev
   
   # Or start servers separately
   # Terminal 1 - Backend
   cd server && npm start
   
   # Terminal 2 - Frontend
   cd client && npm start
   ```

## Default Credentials

- **Teacher Login**: kiruthick3238q@gmail.com / 123456
- **Student Registration**: Use the registration form to create student accounts

## Project Structure

```
student-management-mern/
├── server/                 # Backend application
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── client/                # Frontend application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js         # Main App component
├── package.json           # Root package.json
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Teacher Routes
- `GET /api/teacher/students` - Get all students
- `POST /api/teacher/students` - Add new student
- `PUT /api/teacher/students/:id` - Update student
- `DELETE /api/teacher/students/:id` - Delete student
- `GET /api/teacher/subjects` - Get subjects
- `POST /api/teacher/subjects` - Add subject
- `GET /api/teacher/attendance` - Get attendance
- `POST /api/teacher/attendance` - Update attendance
- `GET /api/teacher/marks/:studentId` - Get student marks
- `POST /api/teacher/marks` - Add marks
- `GET /api/teacher/assignments` - Get assignments
- `POST /api/teacher/assignments` - Create assignment
- `GET /api/teacher/announcements` - Get announcements
- `POST /api/teacher/announcements` - Post announcement
- `POST /api/teacher/materials` - Upload material
- `GET /api/teacher/analytics` - Get analytics

### Student Routes
- `GET /api/student/profile` - Get profile
- `GET /api/student/subjects` - Get subjects
- `GET /api/student/attendance` - Get attendance
- `GET /api/student/marks` - Get marks
- `GET /api/student/assignments` - Get assignments
- `POST /api/student/assignments/:id/submit` - Submit assignment
- `GET /api/student/materials` - Get materials
- `GET /api/student/announcements` - Get announcements
- `GET /api/student/study-plan` - Get study plan
- `POST /api/student/study-plan/tasks` - Add study task
- `PUT /api/student/study-plan/tasks/:id/complete` - Complete task
- `POST /api/student/study-plan/weak-subjects` - Add weak subject
- `GET /api/student/analytics` - Get analytics

## Real-time Events

The system uses Socket.io for real-time updates:

### Client Events
- `join_student` - Join student-specific room
- `leave_student` - Leave student-specific room

### Server Events
- `attendance_updated` - Attendance updated
- `marks_updated` - Marks updated
- `assignment_created` - New assignment created
- `announcement_posted` - New announcement posted
- `material_uploaded` - New material uploaded

## Deployment

### Environment Variables for Production

```bash
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-management
JWT_SECRET=your-super-secure-jwt-secret-for-production
NODE_ENV=production
PORT=5000

# Frontend
REACT_APP_API_URL=https://your-backend-url.com
```

### Deployment Options

1. **Heroku** (Backend)
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   git push heroku main
   ```

2. **Vercel** (Frontend)
   ```bash
   # Install Vercel CLI
   vercel --prod
   ```

3. **Docker**
   ```bash
   # Build and run containers
   docker-compose up -d
   ```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet

## Performance Optimizations

- MongoDB indexing for faster queries
- Pagination for large datasets
- Lazy loading of components
- Code splitting
- Image optimization
- Compression middleware
- Caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a production-ready application with comprehensive features. Ensure you update all environment variables with secure values before deploying to production.
