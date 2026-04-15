# Admin Access Setup

## Overview

The admin app requires a user with `role: "admin"` set in their Firestore `users/{uid}` document. Firestore security rules use a document-based role check — no Firebase Auth custom claim is needed to get started.

---

## How Firestore Role Checking Works

The `firestore.rules` file uses an `isAdmin()` helper that reads the requesting user's `role` field directly from Firestore at rule evaluation time:

```
function isAdmin() {
  return request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

- Setting `role: "admin"` in a user's Firestore document takes effect **immediately** — no token refresh or app restart required.
- Admins can read/write the entire `users` collection and write to `settings/global`.

---

## Getting Admin Access

### In the Emulator (local development)

1. Start the emulators: `npm run firebase:emulators`
2. Start the admin app: `npm start`
3. **Register** a user via the admin app at `/authentication/register`
4. Open the **Emulator UI** at `http://localhost:8080`
5. Go to **Firestore** → `users` collection → find your document (UID matches the Auth tab)
6. Set the `role` field to `"admin"`

That user can now save Settings and manage all users — no restart needed.

---

## Bootstrap the First Admin (production)

A `bootstrapAdmin` Cloud Function provides a safe one-time bootstrap. It only succeeds when **no admin already exists**, preventing privilege escalation.

### Emulator

```bash
# 1. Get your UID from the Emulator UI → Authentication tab
# 2. Call the function:
curl -X POST http://localhost:5001/demo-project/us-central1/bootstrapAdmin \
  -H "Content-Type: application/json" \
  -d '{"uid":"<your-uid>"}'
```

### Production

Set the `BOOTSTRAP_SECRET` environment variable in your Firebase Functions config to protect the endpoint:

```bash
# Set the secret (Firebase CLI)
firebase functions:secrets:set BOOTSTRAP_SECRET

# Then call the endpoint with the secret header:
curl -X POST https://<region>-<project>.cloudfunctions.net/bootstrapAdmin \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Secret: <your-secret>" \
  -d '{"uid":"<your-uid>"}'
```

A successful response looks like:

```json
{ "success": true, "uid": "<your-uid>", "role": "admin" }
```

After bootstrap, disable or delete the function if it is no longer needed.

---

## Grant Admin to Additional Users (production)

Once the first admin exists, use the `grantAdminRole` callable function. Only existing admins can call it.

### From the Angular admin app

```typescript
import { inject } from "@angular/core";
import { Functions, httpsCallable } from "@angular/fire/functions";

const functions = inject(Functions);
const grantRole = httpsCallable(functions, "grantAdminRole");

// Grant admin
await grantRole({ uid: "target-user-uid", role: "admin" });

// Revoke admin
await grantRole({ uid: "target-user-uid", role: "user" });
```

### From Firebase CLI (production)

```bash
firebase functions:call grantAdminRole \
  --data '{"uid":"target-user-uid","role":"admin"}'
```

This updates both the Firestore `role` field and sets the `{ admin: true }` Firebase Auth custom claim on the user's token for any future token-based rules.

---

## Role Summary

| Role    | Can read own profile | Can read all users | Can write users | Can write settings |
| :------ | :------------------- | :----------------- | :-------------- | :----------------- |
| `user`  | ✅                   | ❌                 | ❌              | ❌                 |
| `admin` | ✅                   | ✅                 | ✅              | ✅                 |

---

## Related Files

- [`firestore.rules`](../firestore.rules) — Security rules with `isAdmin()` helper
- [`functions/src/index.ts`](../functions/src/index.ts) — `bootstrapAdmin` and `grantAdminRole` Cloud Functions
- [`projects/admin/src/app/guards/auth.guard.ts`](../projects/admin/src/app/guards/auth.guard.ts) — Route guard protecting `/dashboard`
