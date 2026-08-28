/**
 * clean-and-seed-vitbites.js
 *
 * DESTRUCTIVE. Wipes restaurants, menu_items, orders, users, and
 * partner_applications collections, then seeds a fresh "VIT Bites"
 * restaurant with the full wraps + pizza menu (including size variants).
 *
 * Setup:
 *   1. Place this file in your scripts/ folder.
 *   2. Firebase Console → Project Settings → Service Accounts →
 *      Generate New Private Key → save as scripts/serviceAccount.json
 *   3. From scripts/: npm install firebase-admin (already in scripts/package.json)
 *   4. Run: node clean-and-seed-vitbites.js
 *   5. Type the exact confirmation phrase when prompted.
 *
 * Note: this only deletes Firestore documents. It does NOT delete
 * Firebase Authentication accounts or custom claims (e.g. admin role).
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const readline = require("readline");

let serviceAccount;
try {
    serviceAccount = require("./serviceAccount.json");
} catch {
    console.error("❌  Could not find scripts/serviceAccount.json");
    console.error("    Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
    process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const COLLECTIONS_TO_WIPE = [
    "restaurants",
    "menu_items",
    "orders",
    "users",
    "partner_applications",
];

const CONFIRM_PHRASE = "DELETE ALL DATA";

// ── VIT Bites seed data ─────────────────────────────────────────────────────
const vitBites = {
    name: "VIT Bites",
    slug: "vit-bites",
    cuisine: "Fast Food",
    rating: 4.8,
    reviewCount: 342,
    deliveryTime: 20,
    deliveryFee: 10,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    isOpen: true,
    isVeg: false,
    partnerId: "placeholder",
};

// Wraps — flat price, no variants
const wraps = [
    { name: "Cheese Melt Paneer Wrap", price: 150, isVeg: true },
    { name: "Masala Paneer Tikka Wrap", price: 130, isVeg: true },
    { name: "Zingy Chilly Cheese Manchurian Wrap", price: 130, isVeg: true },
    { name: "Egg Cheese Chicken Sausage Wrap", price: 125, isVeg: false },
    { name: "Mexicana Potato Corn Salsa Wrap", price: 165, isVeg: true },
    { name: "Chilli Manchurian Garlic Wrap", price: 140, isVeg: true },
    { name: "Chicken Extravaganza Wrap", price: 185, isVeg: false },
    { name: "Smoky Diced Paneer Salad Wholewheat Wrap", price: 155, isVeg: true },
].map((w) => ({
    name: w.name,
    description: "",
    price: w.price,
    category: "Wraps",
    isVeg: w.isVeg,
    isAvailable: true,
    imageUrl: "",
}));

// Pizzas with only a Regular price — no variants
const pizzasFlat = [
    { name: "Magic Mushroom Pizza", price: 145, isVeg: true },
    { name: "Golden Chicken Pizza", price: 169, isVeg: false },
    { name: "Chicken Tikka Pizza", price: 199, isVeg: false },
    { name: "BBQ Chicken & Jalapeno Pizza", price: 179, isVeg: false },
].map((p) => ({
    name: p.name,
    description: "",
    price: p.price,
    category: "Pizza",
    isVeg: p.isVeg,
    isAvailable: true,
    imageUrl: "",
}));

// Pizzas with Regular + Medium — use variants
const pizzasWithVariants = [
    { name: "Margherita Pizza", isVeg: true, regular: 130, medium: 179 },
    { name: "Cheese & Corn Pizza", isVeg: true, regular: 139, medium: 199 },
    { name: "Corn & Veggie Pizza", isVeg: true, regular: 149, medium: 209 },
    { name: "Onion & Capsicum Pizza", isVeg: true, regular: 149, medium: 209 },
    { name: "Tomato & Capsicum Pizza", isVeg: true, regular: 149, medium: 199 },
    { name: "Veggie Farm Pizza", isVeg: true, regular: 160, medium: 239 },
    { name: "Garden Fresh Pizza", isVeg: true, regular: 150, medium: 239 },
    { name: "Dragonfire Margherita Pizza", isVeg: true, regular: 150, medium: 209 },
    { name: "Paneer Golden Delight Pizza", isVeg: true, regular: 180, medium: 259 },
    { name: "Double Cheese Margherita Pizza", isVeg: true, regular: 170, medium: 229 },
    { name: "Tandoori Paneer Pizza", isVeg: true, regular: 189, medium: 279 },
    { name: "Makhani Margherita Pizza", isVeg: true, regular: 150, medium: 229 },
    { name: "Makhani Golden Fresh Pizza", isVeg: true, regular: 179, medium: 289 },
    { name: "Makhani Veggie Farmhouse Pizza", isVeg: true, regular: 189, medium: 299 },
    { name: "Smoked Chicken Sausage Pizza", isVeg: false, regular: 150, medium: 259 },
    { name: "BBQ Chicken Pizza", isVeg: false, regular: 189, medium: 279 },
    { name: "Grilled BBQ Chicken Pizza", isVeg: false, regular: 189, medium: 329 },
    { name: "Paneer Tikka Butter Pizza", isVeg: false, regular: 209, medium: 345 }, // ⚠️ confirm veg/non-veg
    { name: "Dragonfire Veg Pizza", isVeg: true, regular: 235, medium: 369 },
    { name: "Maharaja Paneer Pizza", isVeg: true, regular: 249, medium: 379 },
    { name: "Korean Veggie Farm Pizza", isVeg: true, regular: 200, medium: 280 },
    { name: "Death by Cheese Pizza", isVeg: true, regular: 209, medium: 280 },
    { name: "Veg Overloaded Pizza", isVeg: true, regular: 189, medium: 339 },
    { name: "Dragonfire Veggie Farmhouse Pizza", isVeg: true, regular: 209, medium: 319 },
    { name: "Dragonfire Paneer Pizza", isVeg: true, regular: 250, medium: 349 },
    { name: "Signature Korean Paneer Pizza", isVeg: true, regular: 209, medium: 299 },
    { name: "Butter Chicken Pizza", isVeg: false, regular: 209, medium: 299 },
    { name: "Chik-A-Boom Pizza", isVeg: false, regular: 260, medium: 349 },
    { name: "Roasted Chicken Pizza", isVeg: false, regular: 199, medium: 299 },
].map((p) => ({
    name: p.name,
    description: "",
    price: p.regular,
    category: "Pizza",
    isVeg: p.isVeg,
    isAvailable: true,
    imageUrl: "",
    variants: [
        { label: "Regular", price: p.regular },
        { label: "Medium", price: p.medium },
    ],
}));

const menuItems = [...wraps, ...pizzasFlat, ...pizzasWithVariants];

// ── Helpers ──────────────────────────────────────────────────────────────────
function confirm(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

async function deleteCollection(collectionName, batchSize = 400) {
    const collRef = db.collection(collectionName);
    let deletedTotal = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const snap = await collRef.limit(batchSize).get();
        if (snap.empty) break;
        const batch = db.batch();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        deletedTotal += snap.size;
        console.log(`   deleted ${deletedTotal} from ${collectionName}...`);
    }
    console.log(`✅  Cleared "${collectionName}" (${deletedTotal} docs removed)`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log("⚠️  This will PERMANENTLY DELETE all documents in:");
    COLLECTIONS_TO_WIPE.forEach((c) => console.log(`     - ${c}`));
    console.log("    Then reseed a fresh VIT Bites restaurant + menu.\n");
    console.log("    Firebase Authentication accounts are NOT deleted by this script.\n");

    const answer = await confirm(`Type "${CONFIRM_PHRASE}" to proceed: `);
    if (answer.trim() !== CONFIRM_PHRASE) {
        console.log("❌  Confirmation did not match. Aborting — nothing was deleted.");
        process.exit(1);
    }

    console.log("\n🧹 Wiping collections...\n");
    for (const collectionName of COLLECTIONS_TO_WIPE) {
        await deleteCollection(collectionName);
    }

    console.log("\n🌱 Seeding VIT Bites...\n");
    const restRef = await db.collection("restaurants").add({
        ...vitBites,
        createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`✅  Created VIT Bites restaurant (${restRef.id})`);

    for (const item of menuItems) {
        await db.collection("menu_items").add({
            ...item,
            restaurantId: restRef.id,
            createdAt: FieldValue.serverTimestamp(),
        });
        console.log(`   ✅  Added item: ${item.name}`);
    }

    console.log(`\n✨ Done! Wiped ${COLLECTIONS_TO_WIPE.length} collections and seeded ${menuItems.length} menu items under VIT Bites (${restRef.id}).`);
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});