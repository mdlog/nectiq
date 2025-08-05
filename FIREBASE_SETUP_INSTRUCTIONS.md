# Firebase Setup Instructions for Nectiq Platform

**Last Updated: August 5, 2025**

## Overview

This document provides step-by-step instructions for configuring Firebase authentication in the Nectiq platform. Firebase integration enables optional email verification linking for enhanced user security by connecting Web3 wallet addresses with Gmail accounts.

### Recent Platform Updates (August 2025)
- ✅ **Enhanced Admin Integration**: Firebase authentication now fully integrated with advanced admin panel
- ✅ **Improved Data Export**: CSV export system includes Firebase authentication status for users
- ✅ **TypeScript Security**: All Firebase-related type safety issues resolved for secure integration
- ✅ **Production Ready Firebase**: Firebase setup verified and tested for production deployment

## Firebase Configuration Requirements

### Purpose of Firebase Integration
- **Enhanced Security**: Link wallet addresses with verified Gmail accounts
- **User Verification**: Optional email verification for additional account security
- **Admin Oversight**: Track email verification status in admin panel
- **Dual Authentication**: Combine Web3 wallet authentication with email verification

### Firebase Services Used
- **Firebase Authentication**: Google Sign-In provider for email verification
- **Firebase Console**: Domain authorization and project management
- **Google OAuth**: Secure email verification flow

## Step-by-Step Setup Process

### Step 1: Create Firebase Project

1. **Navigate to Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**:
   - Click "Add project" or "Create a project"
   - Enter project name: `nectiq` (recommended)
   - Accept Firebase terms and continue
   - Disable Google Analytics (optional for this implementation)
   - Click "Create project"

### Step 2: Configure Web Application

1. **Add Web App to Project**:
   - In Firebase Console, click "Add app" 
   - Select Web platform (</> icon)
   - App nickname: `Nectiq Platform`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Save Configuration Details**:
   - Copy the Firebase configuration object
   - Note down the following values:
     - `apiKey`
     - `projectId` 
     - `appId`

### Step 3: Enable Google Authentication

1. **Navigate to Authentication**:
   - In Firebase Console sidebar, click "Authentication"
   - Go to "Sign-in method" tab

2. **Enable Google Provider**:
   - Click on "Google" sign-in provider
   - Toggle "Enable" switch to ON
   - Set project support email (your email address)
   - Click "Save"

### Step 4: Configure Authorized Domains

1. **Navigate to Authentication Settings**:
   - In Authentication section, click "Settings" tab
   - Go to "Authorized domains" subsection

2. **Add Production Domain**:
   - Click "Add domain"
   - Add your production domain (e.g., `your-domain.com`)
   - Click "Add"

3. **Add Development Domain**:
   - For Replit development, add your current Replit domain
   - Example: `44f8170b-ba82-42ff-ba2d-cad6f3daf3b7-00-s3w0re7yhyrw.spock.replit.dev`
   - This allows testing during development

4. **Add Additional Domains** (if applicable):
   - Custom domains if you have them configured
   - Any additional testing domains
   - Staging environment domains

### Step 5: Environment Variables Configuration

Add the following environment variables to your application:

**In Replit Secrets:**
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=nectiq
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

**Environment Variable Details:**
- `VITE_FIREBASE_API_KEY`: Your Firebase project API key
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID (should be "nectiq")
- `VITE_FIREBASE_APP_ID`: Firebase application ID

## Configuration Verification

### Verify Firebase Configuration

1. **Check Firebase Console**:
   - Ensure Google authentication is enabled
   - Verify authorized domains are correctly added
   - Confirm project settings are saved

2. **Test Environment Variables**:
   ```javascript
   console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
   console.log('Firebase Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
   console.log('Firebase App ID:', import.meta.env.VITE_FIREBASE_APP_ID);
   ```

### Test Firebase Integration

1. **Test Email Verification Dialog**:
   - Connect wallet to Nectiq platform
   - Navigate to user profile or financial section
   - Click "Link Email" button (should appear for users without linked email)
   - Verify Google Sign-In popup appears

2. **Verify Successful Linking**:
   - Complete Google Sign-In flow
   - Check that email appears in user profile
   - Verify email verification status in admin panel

## Troubleshooting Common Issues

### Domain Authorization Issues

**Error**: `auth/unauthorized-domain`

**Solution**:
1. Copy exact domain from browser address bar
2. Add domain to Firebase Console > Authentication > Settings > Authorized domains
3. Wait 5-10 minutes for changes to propagate
4. Test again

**Common Domain Examples**:
- Development: `44f8170b-ba82-42ff-ba2d-cad6f3daf3b7-00-s3w0re7yhyrw.spock.replit.dev`
- Replit App: `your-repl-name.your-replit-username.repl.co`
- Custom Domain: `your-custom-domain.com`

### Configuration Issues

**Error**: Firebase config not found or invalid

**Solution**:
1. Verify all environment variables are set correctly
2. Check for typos in variable names (must start with `VITE_`)
3. Ensure values are copied correctly from Firebase Console
4. Restart application after adding environment variables

### Google Sign-In Issues

**Error**: Google Sign-In popup blocked or doesn't appear

**Solution**:
1. Check browser popup blocker settings
2. Verify authorized domains are correctly configured
3. Test in different browsers (Chrome, Firefox, Safari)
4. Clear browser cache and cookies
5. Ensure Firebase project has Google authentication enabled

## Security Considerations

### API Key Security

**Firebase API Key Exposure**:
- Firebase API keys for client-side authentication are designed to be public
- They identify your Firebase project but don't grant privileged access
- The real security comes from Firebase Security Rules and Authentication

**Best Practices**:
- Use Firebase API keys only for client-side authentication
- Implement proper Firebase Security Rules for database access
- Monitor Firebase usage in Firebase Console
- Regularly review authorized domains list

### Domain Security

**Authorized Domains Best Practices**:
- Only add domains you control and trust
- Remove unused or old domains regularly
- Use HTTPS for all production domains
- Monitor Firebase Console for unauthorized access attempts

### User Data Privacy

**Data Collection Minimization**:
- Only collect necessary user information (email, display name)
- Store minimal user data in Firebase
- Implement proper data retention policies
- Provide users with data deletion options

## Integration Details

### Application Integration

**WalletEmailVerification Component**:
The platform includes a React component that handles Firebase authentication:
- Located in `client/src/components/`
- Triggered automatically for users without linked email
- Integrated with user profile and financial sections

**Database Integration**:
User email data is stored in the main platform database:
- `firebase_uid` - User's Firebase UID
- `firebase_display_name` - User's display name from Google
- `email` - User's verified email address

**Admin Panel Integration**:
Administrators can view email verification status:
- User management section shows linked email status
- Email verification badges indicate verified accounts
- CSV export includes email information

## Maintenance and Updates

### Regular Maintenance Tasks

**Monthly**:
- Review authorized domains list
- Check Firebase usage metrics
- Verify authentication logs for unusual activity
- Update environment variables if needed

**Quarterly**:
- Review Firebase security settings
- Update Firebase SDK versions
- Audit user email verification rates
- Review and clean up unused domains

### Firebase Console Monitoring

**Key Metrics to Monitor**:
- Daily active users with email verification
- Authentication success/failure rates
- Geographic distribution of sign-ins
- Unusual authentication patterns

**Security Monitoring**:
- Failed authentication attempts
- Unauthorized domain access attempts
- Unusual sign-in locations or patterns
- API usage anomalies

## Support and Resources

### Firebase Documentation
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)

### Platform-Specific Support
- Check admin panel for user email verification status
- Review application logs for Firebase-related errors
- Test email verification flow in development environment
- Contact platform administrators for domain authorization issues

### Emergency Procedures

**If Firebase Authentication Fails**:
1. Firebase email verification is optional - users can still access platform with wallet authentication
2. Check Firebase Console for service status
3. Verify authorized domains are correctly configured
4. Test with different browsers and networks
5. Contact Firebase support for service-wide issues

---

**Document Version**: 2.0  
**Last Updated**: July 23, 2025  
**Firebase Project**: nectiq  
**Status**: Optional Integration - Platform Functions Without Firebase