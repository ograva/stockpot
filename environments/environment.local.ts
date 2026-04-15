/**
 * Local Development Environment with Firebase Emulators
 *
 * projectId must match the Firebase project in .firebaserc ("stockpot") so that
 * the app reads/writes to the same namespace the emulator loads from emulator-data/.
 * Using a different projectId (e.g. "demo-project") creates a separate namespace
 * in the emulator and the data will not be visible in the Emulator UI.
 */

export const environment = {
  production: false,
  useEmulators: true,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'stockpot.firebaseapp.com',
    projectId: 'stockpot',
    storageBucket: 'stockpot.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:demo-app-id',
  },
};
