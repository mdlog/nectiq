# Firebase Setup Instructions for Nectiq Platform

## Current Issue: auth/unauthorized-domain

The Firebase Google Sign-In is failing because the current Replit domain needs to be added to Firebase Console.

### Current Domain to Add:
```
44f8170b-ba82-42ff-ba2d-cad6f3daf3b7-00-s3w0re7yhyrw.spock.replit.dev
```

## Step-by-Step Solution:

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your project

### 2. Navigate to Authentication Settings
- Click "Authentication" in left sidebar
- Go to "Settings" tab
- Scroll down to "Authorized domains" section

### 3. Add Current Domain
- Click "Add domain"
- Enter: `44f8170b-ba82-42ff-ba2d-cad6f3daf3b7-00-s3w0re7yhyrw.spock.replit.dev`
- Click "Add"

### 4. Test Firebase Integration
- Return to the application
- Click the red "Test Firebase Dialog" button in top-right corner
- Try Google Sign-In - should work now

## For Production Deployment:
When deploying to production, you'll also need to add:
- `your-app-name.replit.app` (for standard Replit deployment)
- Your custom domain (if any)

## Verification:
After adding the domain, the Firebase Google Sign-In should work correctly and you should see:
- Google Sign-In popup appears
- User can select Gmail account
- Email gets linked to wallet address
- Success message displays

## Current Firebase Configuration:
- Project ID: From VITE_FIREBASE_PROJECT_ID secret
- Auth Domain: `{PROJECT_ID}.firebaseapp.com`
- Current testing domain: `44f8170b-ba82-42ff-ba2d-cad6f3daf3b7-00-s3w0re7yhyrw.spock.replit.dev`