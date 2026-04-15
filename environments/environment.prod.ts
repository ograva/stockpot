/**
 * Shared Firebase Configuration - Production Environment
 * 
 * This file is used by both admin and user apps in production.
 * Replace with your actual Firebase production project configuration.
 * 
 * SECURITY: Never commit real production credentials to version control.
 * Consider using environment variables or secret management services.
 */

export const environment = {
  production: true,
  useEmulators: false,
  firebase: {
    apiKey: "AIzaSy_YOUR_PRODUCTION_API_KEY",
    authDomain: "your-project-prod.firebaseapp.com",
    projectId: "your-project-prod",
    storageBucket: "your-project-prod.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:xyz789abc123def456"
  }
};
