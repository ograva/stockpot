/**
 * Cloud Functions for Firebase
 *
 * Example functions for Novus Flexy application
 */

import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Example HTTP function
 *
 * Deploy with: firebase deploy --only functions:helloWorld
 * Test locally: http://localhost:5001/novus-flexy/us-central1/helloWorld
 */
export const helloWorld = onRequest((request, response) => {
  response.json({
    message: 'Hello from Firebase Functions!',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Example Firestore trigger
 *
 * Triggers when a new user document is created
 */
export const onUserCreated = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userData = event.data?.data();
    const userId = event.params.userId;

    console.log(`New user created: ${userId}`, userData);

    // Example: Send welcome email, create user profile, etc.
    // await sendWelcomeEmail(userData);

    return null;
  },
);

/**
 * Example callable function for client apps
 *
 * Call from Angular:
 * const callable = httpsCallable(functions, 'getUserData');
 * const result = await callable({ userId: 'abc123' });
 */
export const getUserData = onRequest(
  { cors: true },
  async (request, response) => {
    const userId = request.body.data?.userId;

    if (!userId) {
      response.status(400).json({ error: 'userId is required' });
      return;
    }

    try {
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        response.status(404).json({ error: 'User not found' });
        return;
      }

      response.json({
        data: userDoc.data(),
      });
    } catch (error) {
      console.error('Error getting user data:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  },
);

/**
 * grantAdminRole — Callable function (production use)
 *
 * Grants or revokes the 'admin' role for a user by:
 *   1. Writing role to the Firestore users/{uid} document.
 *   2. Setting the Firebase Auth custom claim { admin: true } so token-based
 *      rules also work if needed in future.
 *
 * Only existing admins (custom claim) can call this function.
 *
 * Call from Angular:
 *   const fn = httpsCallable(functions, 'grantAdminRole');
 *   await fn({ uid: 'target-user-uid', role: 'admin' });  // or role: 'user'
 */
export const grantAdminRole = onCall(async (request) => {
  // Only allow existing admins (or during initial bootstrap when no admins exist)
  const callerToken = request.auth?.token;
  if (!callerToken?.admin) {
    throw new HttpsError('permission-denied', 'Only admins can grant roles.');
  }

  const { uid, role } = request.data as { uid: string; role: 'admin' | 'user' };

  if (!uid || !role) {
    throw new HttpsError('invalid-argument', 'uid and role are required.');
  }
  if (role !== 'admin' && role !== 'user') {
    throw new HttpsError('invalid-argument', "role must be 'admin' or 'user'.");
  }

  // 1. Update Firestore document
  await admin.firestore().collection('users').doc(uid).update({ role });

  // 2. Set / clear Firebase Auth custom claim
  const customClaims = role === 'admin' ? { admin: true } : { admin: false };
  await admin.auth().setCustomUserClaims(uid, customClaims);

  return { success: true, uid, role };
});

/**
 * bootstrapAdmin — HTTP function (one-time use)
 *
 * Sets the very first admin user when no admins exist yet.
 * Should be disabled (or protected by env var) after initial setup.
 *
 * Usage (emulator):
 *   curl -X POST http://localhost:5001/demo-project/us-central1/bootstrapAdmin \
 *     -H "Content-Type: application/json" \
 *     -d '{"uid":"<your-uid>"}'
 *
 * Usage (production):
 *   curl -X POST https://<region>-<project>.cloudfunctions.net/bootstrapAdmin \
 *     -H "Content-Type: application/json" \
 *     -H "X-Bootstrap-Secret: <BOOTSTRAP_SECRET env var>" \
 *     -d '{"uid":"<your-uid>"}'
 */
export const bootstrapAdmin = onRequest(
  { cors: false },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    // In production, require a secret header to prevent abuse
    const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
    if (bootstrapSecret) {
      const provided = request.headers['x-bootstrap-secret'];
      if (provided !== bootstrapSecret) {
        response.status(403).json({ error: 'Forbidden' });
        return;
      }
    }

    const { uid } = request.body as { uid?: string };
    if (!uid) {
      response.status(400).json({ error: 'uid is required' });
      return;
    }

    try {
      // Verify no admin already exists (prevent privilege escalation)
      const existing = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .limit(1)
        .get();

      if (!existing.empty) {
        response.status(409).json({
          error: 'An admin already exists. Use grantAdminRole instead.',
        });
        return;
      }

      await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .update({ role: 'admin' });
      await admin.auth().setCustomUserClaims(uid, { admin: true });

      response.json({ success: true, uid, role: 'admin' });
    } catch (err: any) {
      console.error('bootstrapAdmin error:', err);
      response
        .status(500)
        .json({ error: err.message ?? 'Internal server error' });
    }
  },
);
