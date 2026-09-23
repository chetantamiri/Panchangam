# 🚀 Deploying the Delete User Cloud Function

## Why This Is Needed

Firebase Auth user accounts **cannot be deleted from the mobile app** (client SDK).  
You need the **Firebase Admin SDK**, which only runs server-side via Cloud Functions.

The function `deleteAuthUser` handles:

1. ✅ Verifies the caller is an admin (Firestore `role: 'admin'` check)
2. ✅ Deletes the Firebase Auth user → **removes their email/password login**
3. ✅ Deletes the Firestore user document → **removes their profile data**

---

## One-Time Setup (Do Once)

### Step 1 — Install Firebase CLI

Open a terminal and run:

```bash
npm install -g firebase-tools
```

### Step 2 — Login to Firebase

```bash
firebase login
```

This opens a browser to log in with the Google account that owns your Firebase project.

### Step 3 — Set your Firebase Project

Inside the `panchangam-app` folder:

```bash
firebase use --add
```

Select your Firebase project from the list.

---

## Deploy the Function and Firestore Rules

### Step 4 — Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 5 — Deploy

```bash
firebase deploy --only functions,firestore:rules
```

You'll see output like:

```
✔  functions[deleteAuthUser]: Successful create operation.
Function URL: https://us-central1-YOUR_PROJECT.cloudfunctions.net/deleteAuthUser
```

> **Note:** Cloud Functions require the **Blaze (pay-as-you-go)** Firebase plan.  
> The free Spark plan does not support outbound network calls from functions.  
> However, Firebase gives a generous free tier — you won't be charged for normal usage.

The current Firestore rules are intentionally unrestricted for testing. They allow anyone to read, create, update, and delete any document. Replace them with authenticated rules before production use.

---

## After Deployment

Once deployed, the **Delete** button in the Admin → Manage Users screen will:

- Remove the user from Firebase Authentication (they can no longer log in)
- Delete their Firestore profile document
- The user must register again from scratch if they want access

---

## Updating the Function

After any changes to `functions/src/index.ts`, just run:

```bash
firebase deploy --only functions
```
