const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

let serviceAccount;
try {
  serviceAccount = require("./serviceAccount.json");
} catch {
  console.error("❌  Could not find scripts/serviceAccount.json");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

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

const menuItems = [
  { name: "Cheese Melt Paneer Wrap", description: "Delicious cheese and paneer", price: 150, category: "Wraps", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Masala Paneer Tikka Wrap", description: "Spicy paneer tikka wrap", price: 130, category: "Wraps", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Zingy Chilly Cheese Manchurian Wrap", description: "Indo-chinese style wrap", price: 130, category: "Wraps", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Egg Cheese Chicken Sausage Wrap", description: "Loaded non-veg wrap", price: 125, category: "Wraps", isVeg: false, isAvailable: true, imageUrl: "" },
  { name: "Mexicana Potato Corn Salsa Wrap", description: "Mexican flavors in a wrap", price: 165, category: "Wraps", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Chilli Manchurian Garlic Wrap", description: "Garlicky and spicy", price: 140, category: "Wraps", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Chicken Extravaganza Wrap", description: "Fully loaded chicken wrap", price: 185, category: "Wraps", isVeg: false, isAvailable: true, imageUrl: "" },
  { name: "Smoky Diced Paneer Salad Wholewheat", description: "Healthy wholewheat wrap", price: 155, category: "Wraps", isVeg: true, isAvailable: true, imageUrl: "" },

  { name: "Margherita Pizza", description: "Classic cheese pizza", price: 130, category: "Pizza", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Cheese & Corn Pizza", description: "Sweet corn and cheese", price: 139, category: "Pizza", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Veggie Farm Pizza", description: "Farm fresh veggies", price: 160, category: "Pizza", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Paneer Golden Delight Pizza", description: "Paneer cubes with golden corn", price: 180, category: "Pizza", isVeg: true, isAvailable: true, imageUrl: "" },
  { name: "Tandoori Paneer Pizza", description: "Tandoori marinated paneer", price: 189, category: "Pizza", isVeg: true, isAvailable: true, imageUrl: "" },
  
  { name: "Golden Chicken Pizza", description: "Golden fried chicken chunks", price: 169, category: "Pizza", isVeg: false, isAvailable: true, imageUrl: "" },
  { name: "Chicken Tikka Pizza", description: "Classic chicken tikka", price: 199, category: "Pizza", isVeg: false, isAvailable: true, imageUrl: "" },
  { name: "BBQ Chicken & Jalapeno Pizza", description: "Spicy BBQ chicken", price: 179, category: "Pizza", isVeg: false, isAvailable: true, imageUrl: "" },
  { name: "Roasted Chicken Pizza", description: "Oven roasted chicken", price: 199, category: "Pizza", isVeg: false, isAvailable: true, imageUrl: "" },
];

async function seed() {
  console.log("🌱 Seeding VIT Bites...");

  const existing = await db.collection("restaurants")
    .where("slug", "==", vitBites.slug).limit(1).get();

  let restId;
  if (!existing.empty) {
    restId = existing.docs[0].id;
    console.log(`⏭️  VIT Bites already exists: ${restId}`);
  } else {
    const ref = await db.collection("restaurants").add({
      ...vitBites,
      createdAt: FieldValue.serverTimestamp(),
    });
    restId = ref.id;
    console.log(`✅  Created VIT Bites: ${restId}`);
  }

  for (const item of menuItems) {
    const existingItem = await db.collection("menu_items")
      .where("restaurantId", "==", restId)
      .where("name", "==", item.name)
      .limit(1).get();

    if (!existingItem.empty) {
      console.log(`   ⏭️  Skipping item: ${item.name}`);
    } else {
      await db.collection("menu_items").add({
        ...item,
        restaurantId: restId,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log(`   ✅  Added item: ${item.name}`);
    }
  }

  console.log("✨ Done!");
  process.exit(0);
}

seed().catch(console.error);
