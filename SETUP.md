# Student Management System - Quick Setup Guide

## MongoDB Setup

Since MongoDB is not installed locally, you have two options:

### Option 1: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Download for Windows
   - Run the installer with default settings

2. **Start MongoDB Service**
   ```powershell
   # Open PowerShell as Administrator
   net start MongoDB
   ```

3. **Update .env file**
   ```
   MONGODB_URI=mongodb://localhost:27017/student-management
   ```

### Option 2: Use MongoDB Atlas (Cloud)

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose "Shared Cluster" (free)
   - Select a cloud provider and region
   - Wait for cluster to be created

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-management?retryWrites=true&w=majority
   ```

## Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend Server** (in new terminal)
   ```bash
   cd client
   npm start
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Login Credentials

- **Teacher**: kiruthick3238q@gmail.com / 123456
- **Student**: Register through the application

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (local) or connection string is correct (Atlas)
- Check firewall settings for local MongoDB
- Verify Atlas cluster is running and accessible

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Once the application is running:

1. **Teacher Dashboard**: Manage students, subjects, attendance, marks, assignments
2. **Student Dashboard**: View profile, marks, attendance, study planner
3. **Real-time Features**: Socket.io for live updates
4. **Analytics**: Performance insights and reports

## Production Deployment

For production deployment:
1. Use MongoDB Atlas for database
2. Deploy backend to Heroku, AWS, or similar
3. Deploy frontend to Vercel, Netlify, or similar
4. Update environment variables with production URLs
5. Set up proper security measures

## Support

If you encounter issues:
1. Check MongoDB connection first
2. Verify all environment variables are set
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Refer to the main README.md for detailed documentation
