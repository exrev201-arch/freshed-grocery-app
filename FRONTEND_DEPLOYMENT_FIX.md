# 🛠️ Frontend Deployment Fix Guide

## 🎯 Problem Analysis

Your frontend application is showing a "Bad Gateway" error when accessed through the Render URL, even though:
1. Your backend is successfully deployed and running
2. You've set the CORS_ORIGIN to your frontend URL
3. The application works fine on localhost

The issue is that your frontend is binding to localhost instead of 0.0.0.0, which prevents Render from serving it properly.

## ✅ Fixes Applied

### 1. Updated Vite Configuration
Modified [vite.config.ts](file:///C:/Users/PC/Documents/freshed/vite.config.ts) to bind to 0.0.0.0:
```typescript
server: {
    host: true, // This binds to 0.0.0.0
    port: 5173,
    hmr: {
        overlay: false
    }
}
```

### 2. Updated Package.json Preview Script
Modified the preview script in [package.json](file:///C:/Users/PC/Documents/freshed/package.json) to explicitly bind to 0.0.0.0:
```json
"preview": "vite preview --host 0.0.0.0"
```

### 3. Updated Render Configuration
Modified [render.yaml](file:///C:/Users/PC/Documents/freshed/render.yaml) to properly configure the frontend service:
- Changed from static site to web service
- Added startCommand to run the preview server
- Added PORT environment variable

## 🚀 Next Steps

### 1. Redeploy Your Frontend Service
1. Go to your Render dashboard
2. Find your `freshed-grocery-frontend` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for the deployment to complete

### 2. Verify Backend CORS Configuration
Make sure your backend CORS_ORIGIN is set to your actual frontend URL:
1. Go to your backend service in Render
2. Check the `CORS_ORIGIN` environment variable
3. Ensure it matches your frontend URL exactly (e.g., `https://freshed-grocery-frontend.onrender.com`)
4. If you updated it, redeploy the backend service

## 🔍 Troubleshooting Checklist

### If the frontend still doesn't work after redeployment:

1. **Check Render Logs**:
   - Go to your frontend service in Render
   - Click on "Logs" tab
   - Look for any error messages during startup

2. **Verify Build Success**:
   - Check that the build step completes without errors
   - Look for "Build successful" message

3. **Check Port Binding**:
   - Look for messages indicating the server is listening on port 5173
   - Verify it's binding to 0.0.0.0, not localhost

4. **Test API Connection**:
   - Try accessing your backend API directly
   - Verify it's responding correctly

### Common Issues and Solutions:

1. **Port Already in Use**:
   - Change the PORT environment variable in render.yaml
   - Update the port in vite.config.ts to match

2. **CORS Issues**:
   - Double-check that CORS_ORIGIN exactly matches your frontend URL
   - Include `https://` in the URL
   - Redeploy backend after any CORS changes

3. **Environment Variables**:
   - Verify all environment variables in [.env.render](file:///C:/Users/PC/Documents/freshed/.env.render) are correctly set in Render
   - Check for any missing or incorrect values

## 🧪 Testing Your Fix

After redeployment, test these aspects:

1. **Frontend Loading**:
   - Visit your frontend URL directly
   - Check that the main page loads without errors

2. **API Communication**:
   - Try logging in or registering a user
   - Verify that API calls are successful

3. **CORS Verification**:
   - Check browser console for any CORS errors
   - Verify that requests to backend are working

## 🆘 If Issues Persist

If you're still experiencing problems after these fixes:

1. **Check Render Documentation**:
   - https://render.com/docs/web-services#port-binding
   - https://render.com/docs/node-version

2. **Contact Render Support**:
   - Provide them with your deployment logs
   - Include the Request ID from the error message

3. **Verify Repository Changes**:
   - Ensure all changes have been pushed to GitHub
   - Check that the correct branch is being deployed

## 📚 Additional Resources

- [Vite Preview Documentation](https://vitejs.dev/guide/preview.html)
- [Render Web Services Documentation](https://render.com/docs/web-services)
- [CORS Configuration Guide](https://render.com/docs/cors)

---

**Fix Applied**: September 27, 2025  
**Status**: ✅ Configuration Updated - Ready for Redeployment