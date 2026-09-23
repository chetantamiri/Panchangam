import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

// ─────────────────────────────────────────────────────────────────────────────
// deleteAuthUser
// Callable Cloud Function — securely deletes a Firebase Auth user by UID.
// Only callable by users with role === 'admin' in Firestore.
//
// Client usage:
//   const fn = httpsCallable(functions, 'deleteAuthUser');
//   await fn({ uid: 'user-uid-to-delete' });
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAuthUser = functions.https.onCall(async (request) => {
  const callerUid = request.auth?.uid;

  // 1. Must be authenticated
  if (!callerUid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to perform this action."
    );
  }

  // 2. Verify caller is an admin in Firestore
  const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only administrators can delete user accounts."
    );
  }

  // 3. Validate the target UID
  const targetUid: string = request.data?.uid;
  if (!targetUid || typeof targetUid !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid target user UID is required."
    );
  }

  // 4. Prevent admin from deleting themselves
  if (targetUid === callerUid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "You cannot delete your own account."
    );
  }

  // 5. Delete Firebase Auth user (removes login ability)
  await admin.auth().deleteUser(targetUid);

  // 6. Delete Firestore user document (removes profile data)
  await admin.firestore().collection("users").doc(targetUid).delete();

  return { success: true, message: `User ${targetUid} has been permanently deleted.` };
});
