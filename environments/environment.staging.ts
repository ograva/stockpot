/**
 * Shared Firebase Configuration - Staging Environment
 * 
 * This file is used by both admin and user apps in development/staging.
 * Replace with your actual Firebase project configuration.
 */

export const environment = {
  production: false,
  useEmulators: true, // Set to false when testing against real Firebase staging
  firebase: {
    apiKey: "AIzaSy_YOUR_STAGING_API_KEY",
    authDomain: "your-project-staging.firebaseapp.com",
    projectId: "your-project-staging",
    storageBucket: "your-project-staging.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
  }
};
