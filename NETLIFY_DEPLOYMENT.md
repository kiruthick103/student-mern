# Netlify Deployment Guide - Student Management System

## Overview
This guide will help you deploy the MERN Student Management System to Netlify (frontend) and a suitable backend service.

## Step 1: Prepare Frontend for Netlify

1. **Update API URL in .env**
   ```bash
   # In client/.env
   REACT_APP_API_URL=https://your-backend-url.com
   ```

2. **Build the Application**
   ```bash
   cd client
   npm run build
   ```

## Step 2: Deploy Frontend to Netlify

### Option A: Drag and Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag the `client/build` folder into the drop zone
3. Your site will be deployed instantly

### Option B: Git Integration (Recommended)
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/student-management-mern.git
   git push -u origin main
   ```

2. **Connect Netlify to GitHub**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Choose GitHub repository
   - Configure build settings:
     - Build command: `cd client && npm run build`
     - Publish directory: `client/build`
   - Click "Deploy site"

## Step 3: Deploy Backend

Since Netlify doesn't support Node.js backends, you have these options:

### Option A: Heroku (Free Tier)
1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/student-management
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option B: Render (Free Tier)
1. **Go to https://render.com**
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add your MongoDB URI and JWT secret

### Option C: Vercel (Backend)
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd server
   vercel --prod
   ```

## Step 4: Update Frontend API URL

After deploying your backend, update the frontend:

1. **Update netlify.toml**
   ```toml
   [build.environment]
     REACT_APP_API_URL = "https://your-backend-url.com"
   ```

2. **Or set in Netlify Dashboard**
   - Go to Site settings > Environment variables
   - Add `REACT_APP_API_URL` with your backend URL

3. **Redeploy** Netlify site to apply changes

## Step 5: Configure CORS

In your backend `server.js`, ensure CORS allows your Netlify domain:

```javascript
app.use(cors({
  origin: ['https://your-netlify-site.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

## Step 6: Test Deployment

1. **Visit your Netlify site**
2. **Test login** with teacher credentials:
   - Email: kiruthick3238q@gmail.com
   - Password: 123456
3. **Verify all features** work correctly

## Environment Variables Summary

### Backend Environment
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/student-management
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production
PORT=5000
```

### Frontend Environment (Netlify)
```bash
REACT_APP_API_URL=https://your-backend-url.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows your Netlify domain
   - Check API URL is correct in frontend

2. **API Calls Failing**
   - Verify backend is running and accessible
   - Check environment variables are set correctly

3. **Build Fails**
   - Ensure all dependencies are installed
   - Check for any syntax errors

4. **MongoDB Connection Issues**
   - Verify connection string is correct
   - Ensure MongoDB Atlas allows connections from anywhere

### Debug Steps

1. **Check Browser Console** for frontend errors
2. **Check Network Tab** for failed API calls
3. **Check Backend Logs** for server errors
4. **Test API endpoints** directly with Postman

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed to Netlify
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Netlify/Heroku)
- [ ] Database connection working
- [ ] All features tested
- [ ] Default login credentials working

## URLs After Deployment

- **Frontend**: https://your-site-name.netlify.app
- **Backend**: https://your-app-name.herokuapp.com (or Render/Vercel URL)

## Cost

- **Netlify**: Free tier available
- **Heroku**: Free tier available (with limitations)
- **Render**: Free tier available
- **MongoDB Atlas**: Free tier available (512MB)

## Next Steps

1. Deploy frontend to Netlify
2. Deploy backend to chosen service
3. Update API URLs
4. Test thoroughly
5. Set up custom domain (optional)
6. Configure monitoring (optional)
