#!/usr/bin/env node
/**
 * VIT-AP Eats — Set Admin Role Script
 * 
 * This script sets the `role: "admin"` custom claim on a Firebase user.
 * Run it ONCE after you create your admin account.
 * 
 * Usage:
 *   node scripts/set-admin-role.js <user-email-or-uid>
 * 
 * Prerequisites:
 *   npm install firebase-admin
 *   Set FIREBASE_SERVICE_ACCOUNT_KEY env var OR place serviceAccount.json in this folder
 */

const admin = require("firebase-admin");

// ── Load service account ──────────────────────────────────────────────────────
// Option 1: Set GOOGLE_APPLICATION_CREDENTIALS env var pointing to your JSON key file
// Option 2: Paste the JSON inline below (never commit this to git)
let serviceAccount;
try {
  // Try to load from file in same directory
  serviceAccount = require("./serviceAccount.json");
} catch {
  console.error("❌  Could not find serviceAccount.json");
  console.error("    Download it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
  console.error("    Save it as: scripts/serviceAccount.json (it's in .gitignore)");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ── Main ──────────────────────────────────────────────────────────────────────
async function setAdminRole() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error("Usage: node scripts/set-admin-role.js <email-or-uid>");
    process.exit(1);
  }

  try {
    let user;

    // Check if identifier looks like a UID (no @ symbol) or email
    if (identifier.includes("@")) {
      user = await admin.auth().getUserByEmail(identifier);
    } else {
      user = await admin.auth().getUser(identifier);
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    console.log("✅  Admin role set successfully!");
    console.log(`   User: ${user.email}`);
    console.log(`   UID:  ${user.uid}`);
    console.log("\n⚠️  The user must sign out and sign back in for the role to take effect.");

  } catch (err) {
    console.error("❌  Error:", err.message);
    process.exit(1);
  }

  process.exit(0);
}

setAdminRole();
