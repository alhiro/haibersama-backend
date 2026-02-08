const admin = require('firebase-admin');
const User = require('../models/haiuser');

async function generateFirebaseToken(user) {
  if (!user || !user.id) {
    throw new Error("User ID is required for Firebase UID");
  }

  // UID Firebase (string, unique, konsisten)
  let uid = user.uid_firebase;
  console.log("user data profile");
  console.log(user);

  // 🔥 MIGRASI USER LAMA
  if (!uid) {
    const setUid = `user_${user.id}`;

    // simpan ke DB (WAJIB)
    await User.update(
      { uid_firebase: setUid },
      { where: { id: user.id } }
    );
  } else {
    // simpan ke DB (WAJIB)
    await User.update(
      { uid_firebase: uid },
      { where: { id: user.id } }
    );
  }

  const additionalClaims = {
    role: user.type === 1 ? "user" : "partner",
    email: user.email,
    serverUserId: user.id // 🔥 opsional tapi berguna
  };

  const firebaseToken = await admin.auth().createCustomToken(
    uid,
    additionalClaims
  );

  return firebaseToken;
}

module.exports = { generateFirebaseToken };
