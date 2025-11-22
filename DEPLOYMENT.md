# Anime Tracker - Deployment Guide

This guide explains how to deploy the Anime Tracker application with the backend on **Render** and the frontend on **Vercel**, using **MongoDB Atlas** as the database.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Render Account**: Sign up at [https://render.com](https://render.com)
3. **Vercel Account**: Sign up at [https://vercel.com](https://vercel.com)
4. **GitHub Repository**: Your code should be in a GitHub repository

## MongoDB Atlas Setup

1. Create a new cluster in MongoDB Atlas
2. Create a database user with a username and password
3. Whitelist all IP addresses (0.0.0.0/0) for Render access
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. Replace `<username>`, `<password>`, and `<dbname>` with your actual values

## Backend Deployment (Render)

### Option 1: Using Render Dashboard

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: anime-tracker-backend
   - **Environment**: Node
   - **Region**: Choose closest to you
   - **Branch**: main (or your default branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or your preferred plan)

5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string (generate one using: `openssl rand -base64 32`)
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your Vercel frontend URL (you'll get this after deploying frontend)

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy your Render URL (e.g., `https://anime-tracker-backend.onrender.com`)

### Option 2: Using render.yaml (Infrastructure as Code)

1. The repository includes a `render.yaml` file for automated deployment
2. In Render Dashboard, click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Add the required environment variables in the Render dashboard
6. Click "Apply" to deploy

## Frontend Deployment (Vercel)

### Prepare Frontend for Deployment

1. Create a `vercel.json` file in the project root (already included)
2. The frontend needs to know your backend API URL

### Deploy to Vercel

1. Install Vercel CLI (optional): `npm install -g vercel`
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://anime-tracker-backend.onrender.com/api`)

7. Click "Deploy"
8. Wait for deployment to complete
9. Copy your Vercel URL (e.g., `https://anime-tracker.vercel.app`)

### Update Backend CORS

1. Go back to your Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. The backend will automatically redeploy

## Creating an Admin User

After deployment, you need to create an admin user:

### Option 1: Register and Manually Update Database

1. Register a new user through your frontend
2. Connect to your MongoDB Atlas database using MongoDB Compass or the web interface
3. Find the user in the `users` collection
4. Update the `role` field from `"normal"` to `"admin"`

### Option 2: Direct Database Insert

1. Connect to MongoDB Atlas using MongoDB Compass
2. Open the `users` collection
3. Insert a new document:
   ```json
   {
     "username": "admin",
     "email": "admin@example.com",
     "password": "$2a$10$<hashed-password>",
     "role": "admin",
     "profileLinks": {
       "animeSites": [],
       "mangaSites": []
     },
     "createdAt": { "$date": "2025-01-01T00:00:00.000Z" }
   }
   ```
   Note: You'll need to hash the password using bcrypt (use an online bcrypt generator with 10 rounds)

## Environment Variables Summary

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

## Testing the Deployment

1. Visit your Vercel URL
2. Register a new account
3. Start tracking an anime
4. Log in with your admin account
5. Approve the pending entry
6. Check the public feed

## Troubleshooting

### Backend Issues

**"Cannot connect to database"**
- Verify MongoDB Atlas connection string
- Check IP whitelist settings (use 0.0.0.0/0)
- Ensure database user has correct permissions

**CORS Errors**
- Verify `FRONTEND_URL` environment variable is set correctly
- Make sure it matches your Vercel deployment URL exactly

### Frontend Issues

**"Network Error" or "Failed to fetch"**
- Verify `VITE_API_URL` is set correctly
- Check that backend is running (visit `/api/health` endpoint)
- Ensure backend URL includes `/api` suffix

**Build Failures**
- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Ensure TypeScript has no errors

## Updating the Application

### Backend Updates
1. Push changes to your GitHub repository
2. Render will automatically rebuild and redeploy

### Frontend Updates
1. Push changes to your GitHub repository
2. Vercel will automatically rebuild and redeploy

## Cost Considerations

- **MongoDB Atlas**: Free tier includes 512MB storage
- **Render**: Free tier available (may sleep after inactivity)
- **Vercel**: Free tier includes unlimited deployments

Note: Render free tier services may spin down after 15 minutes of inactivity, causing a delay on the first request.

## Support

If you encounter issues:
1. Check the deployment logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Test the backend health endpoint: `https://your-backend.onrender.com/api/health`
