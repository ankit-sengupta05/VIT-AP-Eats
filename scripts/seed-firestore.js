#!/usr/bin/env node
/**
 * VIT-AP Eats — Firestore Seed Data Script
 *
 * Seeds the Firestore database with sample restaurants and menu items
 * so the app shows real content immediately after setup.
 *
 * Usage:
 *   node scripts/seed-firestore.js
 *
 * Prerequisites:
 *   npm install firebase-admin
 *   Place your serviceAccount.json in scripts/ folder
 */

const admin = require("firebase-admin");

let serviceAccount;
try {
  serviceAccount = require("./serviceAccount.json");
} catch {
  console.error("❌  Could not find scripts/serviceAccount.json");
  console.error("    Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Seed Data ─────────────────────────────────────────────────────────────────
const restaurants = [
  {
    name: "Temptations",
    slug: "temptations",
    cuisine: "Indian",
    rating: 4.5,
    reviewCount: 120,
    deliveryTime: 20,
    deliveryFee: 15,
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    isOpen: true,
    isVeg: false,
    partnerId: "placeholder",
  },
  {
    name: "Night Canteen",
    slug: "night-canteen",
    cuisine: "Fast Food",
    rating: 4.2,
    reviewCount: 89,
    deliveryTime: 15,
    deliveryFee: 10,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    isOpen: true,
    isVeg: false,
    partnerId: "placeholder",
  },
  {
    name: "Green Bowl",
    slug: "green-bowl",
    cuisine: "Healthy",
    rating: 4.6,
    reviewCount: 65,
    deliveryTime: 25,
    deliveryFee: 20,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    isOpen: true,
    isVeg: true,
    partnerId: "placeholder",
  },
];

const menuItemsBySlug = {
  "temptations": [
    { name: "Chicken Biryani", description: "Aromatic basmati rice with tender chicken", price: 120, category: "Biryani", isVeg: false, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400" },
    { name: "Veg Biryani", description: "Fragrant rice with mixed vegetables", price: 90, category: "Biryani", isVeg: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400" },
    { name: "Paneer Butter Masala", description: "Cottage cheese in rich tomato gravy", price: 110, category: "Curries", isVeg: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
    { name: "Dal Fry", description: "Yellow lentils tempered with spices", price: 70, category: "Curries", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Naan", description: "Freshly baked leavened bread", price: 30, category: "Breads", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Gulab Jamun", description: "Milk solid dumplings in sugar syrup", price: 40, category: "Desserts", isVeg: true, isAvailable: true, imageUrl: "" },
  ],
  "night-canteen": [
    { name: "Veg Burger", description: "Crispy veggie patty with fresh veggies", price: 60, category: "Burgers", isVeg: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400" },
    { name: "Chicken Burger", description: "Juicy grilled chicken with lettuce", price: 80, category: "Burgers", isVeg: false, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { name: "Cheese Fries", description: "Crispy fries loaded with cheese sauce", price: 70, category: "Sides", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Masala Maggi", description: "Classic Maggi with campus special spice mix", price: 40, category: "Snacks", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Lemon Tea", description: "Fresh brewed tea with lemon", price: 20, category: "Drinks", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Cold Coffee", description: "Chilled coffee blended to perfection", price: 50, category: "Drinks", isVeg: true, isAvailable: true, imageUrl: "" },
  ],
  "green-bowl": [
    { name: "Greek Salad Bowl", description: "Fresh veggies, olives, feta, and oregano", price: 130, category: "Salads", isVeg: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
    { name: "Quinoa Buddha Bowl", description: "Quinoa, roasted veggies, tahini dressing", price: 160, category: "Bowls", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Fruit Bowl", description: "Seasonal fresh fruits with honey drizzle", price: 80, category: "Snacks", isVeg: true, isAvailable: true, imageUrl: "" },
    { name: "Green Smoothie", description: "Spinach, banana, and apple blend", price: 90, category: "Drinks", isVeg: true, isAvailable: true, imageUrl: "" },
  ],
};

// ── Seed Function ─────────────────────────────────────────────────────────────
async function seedFirestore() {
  console.log("🌱 Starting Firestore seed...\n");

  for (const rest of restaurants) {
    // Check if restaurant already exists
    const existing = await db.collection("restaurants")
      .where("slug", "==", rest.slug).limit(1).get();

    let restId;
    if (!existing.empty) {
      restId = existing.docs[0].id;
      console.log(`⏭️  Skipping restaurant (already exists): ${rest.name}`);
    } else {
      const ref = await db.collection("restaurants").add({
        ...rest,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      restId = ref.id;
      console.log(`✅  Created restaurant: ${rest.name} (${restId})`);
    }

    // Seed menu items
    const items = menuItemsBySlug[rest.slug] ?? [];
    for (const item of items) {
      const existingItem = await db.collection("menu_items")
        .where("restaurantId", "==", restId)
        .where("name", "==", item.name)
        .limit(1).get();

      if (!existingItem.empty) {
        console.log(`   ⏭️  Skipping item (already exists): ${item.name}`);
      } else {
        await db.collection("menu_items").add({
          ...item,
          restaurantId: restId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`   ✅  Added item: ${item.name}`);
      }
    }
    console.log("");
  }

  console.log("✨ Seed complete!");
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
