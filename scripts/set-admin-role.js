const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let serviceAccount;
try {
  serviceAccount = require("./serviceAccount.json");
} catch {
  console.error("❌  Could not find scripts/serviceAccount.json");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();

async function setAdminRole() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error("Usage: node set-admin-role.js <email-or-uid>");
    process.exit(1);
  }

  try {
    let user;
    if (identifier.includes("@")) {
      user = await auth.getUserByEmail(identifier);
    } else {
      user = await auth.getUser(identifier);
    }

    await auth.setCustomUserClaims(user.uid, { role: "admin" });

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
