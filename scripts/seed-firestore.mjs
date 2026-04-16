/**
 * seed-firestore.mjs
 *
 * Seeds the local Firebase emulators with realistic demo data for development.
 * Run AFTER starting emulators: npm run firebase:emulators
 *
 * Usage:  npm run firebase:seed
 * Clear:  npm run firebase:seed -- --clear   (wipes then re-seeds)
 *
 * Demo credentials after seeding:
 *   owner@demo.com   / password123  (role: owner)
 *   manager@demo.com / password123  (role: manager)
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ─── Point Admin SDK at the local emulators ────────────────────────────────
// Auth emulator runs on 9098 (see firebase.json) — 9099 is default but may
// conflict with other local services (e.g. TourBox Console).
process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8085";
process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9098";

const admin = require(
  path.join(__dirname, "../functions/node_modules/firebase-admin"),
);
admin.initializeApp({ projectId: "stockpot" });

const db = admin.firestore();
const auth = admin.auth();

// ─── Deterministic demo IDs ────────────────────────────────────────────────
const RESTAURANT_ID = "demo-restaurant-001";
const OWNER_UID = "demo-owner-uid-001";
const MANAGER_UID = "demo-manager-uid-001";

/** Raw material document IDs */
const RM = {
  rice: "rm-rice-001",
  oil: "rm-oil-001",
  chicken: "rm-chicken-001",
  pork: "rm-pork-001",
  onion: "rm-onion-001",
  garlic: "rm-garlic-001",
  tomato: "rm-tomato-001",
  soy: "rm-soy-001",
  vinegar: "rm-vinegar-001",
  tamarind: "rm-tamarind-001",
  pepper: "rm-pepper-001",
  laurel: "rm-laurel-001",
};

/** Sub-component document IDs */
const SC = {
  adoboBase: "sc-adobo-base-001",
  sinigangBroth: "sc-sinigang-broth-001",
};

/** Recipe document IDs */
const RCP = {
  chickenAdobo: "rcp-chicken-adobo-001",
  porkSinigang: "rcp-pork-sinigang-001",
  sinangag: "rcp-sinangag-001",
};

// ─── Entry point ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const shouldClear = args.includes("--clear");

async function run() {
  console.log("🌱 StockPot Firestore Seed — starting...\n");

  if (shouldClear) {
    await clearEmulatorData();
  }

  await seedAuthUsers();
  await seedSettings();
  await seedRestaurant();

  console.log("\n✅ Seed complete!\n");
  console.log("  Demo credentials:");
  console.log("    owner@demo.com   / password123  (role: owner)");
  console.log("    manager@demo.com / password123  (role: manager)\n");

  process.exit(0);
}

// ─── Clear emulator data ───────────────────────────────────────────────────
async function clearEmulatorData() {
  console.log("🗑️  Clearing Firestore emulator data...");
  const url =
    "http://127.0.0.1:8080/emulator/v1/projects/stockpot/databases/(default)/documents";
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok && res.status !== 200) {
    console.warn(`  ⚠  Clear returned ${res.status} — continuing anyway`);
  } else {
    console.log("  ✓  Firestore cleared");
  }
}

// ─── Auth users ────────────────────────────────────────────────────────────
async function seedAuthUsers() {
  console.log("👤 Seeding Auth users...");
  await createOrGetUser(
    OWNER_UID,
    "owner@demo.com",
    "Demo Owner",
    "password123",
  );
  await createOrGetUser(
    MANAGER_UID,
    "manager@demo.com",
    "Demo Manager",
    "password123",
  );
}

async function createOrGetUser(uid, email, displayName, password) {
  try {
    await auth.getUser(uid);
    console.log(`  ↩  Already exists: ${email} (${uid})`);
  } catch {
    await auth.createUser({
      uid,
      email,
      displayName,
      password,
      emailVerified: true,
    });
    console.log(`  ✓  Created: ${email} (${uid})`);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────
async function seedSettings() {
  console.log("\n⚙️  Seeding settings...");
  await setDoc("settings", "global", {
    appName: "StockPot",
    theme: "orange_theme",
    maintenanceMode: false,
    featureFlags: { enable_registration: true },
  });
}

// ─── Restaurant + sub-collections ─────────────────────────────────────────
async function seedRestaurant() {
  console.log("\n🏪 Seeding restaurant...");
  const rid = RESTAURANT_ID;

  await setDoc("restaurants", rid, {
    _schemaVersion: 1,
    name: "Demo Restaurant",
    planTier: "starter",
    timezone: "Asia/Manila",
    currency: "PHP",
    address: "123 Rizal Ave, Manila, Philippines",
    createdAt: "2026-04-13T00:00:00.000Z",
  });

  await seedRestaurantUsers(rid);
  await seedRawMaterials(rid);
  await seedSubComponents(rid);
  await seedRecipes(rid);
}

// ─── Restaurant users ──────────────────────────────────────────────────────
async function seedRestaurantUsers(rid) {
  console.log("\n  👥 Restaurant users...");

  await setSubDoc(rid, "users", OWNER_UID, {
    _schemaVersion: 1,
    uid: OWNER_UID,
    restaurantId: rid,
    name: "Demo Owner",
    email: "owner@demo.com",
    role: "owner",
  });

  await setSubDoc(rid, "users", MANAGER_UID, {
    _schemaVersion: 1,
    uid: MANAGER_UID,
    restaurantId: rid,
    name: "Demo Manager",
    email: "manager@demo.com",
    role: "manager",
  });
}

// ─── Raw materials ─────────────────────────────────────────────────────────
async function seedRawMaterials(rid) {
  console.log("\n  🥩 Raw materials...");

  const materials = [
    {
      id: RM.rice,
      name: "Jasmine Rice",
      unit: "kg",
      currentStock: 50,
      parLevel: 20,
      parMinimum: 20,
      unitCost: 55,
      category: "Dry Goods",
    },
    {
      id: RM.oil,
      name: "Cooking Oil",
      unit: "L",
      currentStock: 10,
      parLevel: 4,
      parMinimum: 4,
      unitCost: 80,
      category: "Dry Goods",
    },
    {
      id: RM.chicken,
      name: "Chicken Breast",
      unit: "kg",
      currentStock: 15,
      parLevel: 5,
      parMinimum: 5,
      unitCost: 280,
      category: "Proteins",
      criticalThreshold: 2,
    },
    {
      id: RM.pork,
      name: "Pork Belly",
      unit: "kg",
      currentStock: 12,
      parLevel: 5,
      parMinimum: 5,
      unitCost: 320,
      category: "Proteins",
      criticalThreshold: 2,
    },
    {
      id: RM.onion,
      name: "White Onion",
      unit: "kg",
      currentStock: 8,
      parLevel: 3,
      parMinimum: 3,
      unitCost: 70,
      category: "Vegetables",
    },
    {
      id: RM.garlic,
      name: "Garlic",
      unit: "kg",
      currentStock: 5,
      parLevel: 2,
      parMinimum: 2,
      unitCost: 180,
      category: "Vegetables",
    },
    {
      id: RM.tomato,
      name: "Tomato",
      unit: "kg",
      currentStock: 6,
      parLevel: 3,
      parMinimum: 3,
      unitCost: 60,
      category: "Vegetables",
    },
    {
      id: RM.soy,
      name: "Soy Sauce",
      unit: "L",
      currentStock: 4,
      parLevel: 2,
      parMinimum: 2,
      unitCost: 90,
      category: "Sauces & Condiments",
    },
    {
      id: RM.vinegar,
      name: "Cane Vinegar",
      unit: "L",
      currentStock: 3,
      parLevel: 1,
      parMinimum: 1,
      unitCost: 45,
      category: "Sauces & Condiments",
    },
    {
      id: RM.tamarind,
      name: "Tamarind Paste",
      unit: "kg",
      currentStock: 2.5,
      parLevel: 1,
      parMinimum: 1,
      unitCost: 150,
      category: "Sauces & Condiments",
    },
    {
      id: RM.pepper,
      name: "Black Pepper",
      unit: "kg",
      currentStock: 1,
      parLevel: 0.5,
      parMinimum: 0.5,
      unitCost: 850,
      category: "Spices",
    },
    {
      id: RM.laurel,
      name: "Bay Leaves",
      unit: "kg",
      currentStock: 0.5,
      parLevel: 0.2,
      parMinimum: 0.2,
      unitCost: 400,
      category: "Spices",
    },
  ];

  for (const m of materials) {
    const { id, ...data } = m;
    await setSubDoc(rid, "rawMaterials", id, { _schemaVersion: 2, ...data });
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────
async function seedSubComponents(rid) {
  console.log("\n  🧪 Sub-components...");

  await setSubDoc(rid, "subComponents", SC.adoboBase, {
    _schemaVersion: 2,
    name: "Adobo Marinade Base",
    rawIngredients: [
      { rawMaterialId: RM.soy, qty: 0.1 },
      { rawMaterialId: RM.vinegar, qty: 0.05 },
      { rawMaterialId: RM.garlic, qty: 0.02 },
      { rawMaterialId: RM.pepper, qty: 0.005 },
      { rawMaterialId: RM.laurel, qty: 0.003 },
    ],
    subComponentIngredients: [],
    instructions: [
      "Combine soy sauce and cane vinegar in a bowl.",
      "Crush and mince garlic cloves; add to the mixture.",
      "Add whole black peppercorns and bay leaves.",
      "Stir to combine. Use immediately or store refrigerated up to 3 days.",
    ],
    yieldQty: 0.15,
    yieldUnit: "L",
    yieldPercent: 1.0,
    currentStock: 0,
    calculatedCostPerUnit: 0,
  });

  await setSubDoc(rid, "subComponents", SC.sinigangBroth, {
    _schemaVersion: 2,
    name: "Sinigang Broth Base",
    rawIngredients: [
      { rawMaterialId: RM.tamarind, qty: 0.05 },
      { rawMaterialId: RM.onion, qty: 0.1 },
      { rawMaterialId: RM.tomato, qty: 0.15 },
    ],
    subComponentIngredients: [],
    instructions: [
      "Boil 2L of water in a large pot.",
      "Add quartered onion and tomatoes; simmer 5 minutes.",
      "Stir in tamarind paste until fully dissolved.",
      "Season with fish sauce to taste. Strain and reserve broth.",
    ],
    yieldQty: 1.5,
    yieldUnit: "L",
    yieldPercent: 0.75,
    currentStock: 0,
    calculatedCostPerUnit: 0,
  });
}

// ─── Recipes ───────────────────────────────────────────────────────────────
async function seedRecipes(rid) {
  console.log("\n  📋 Recipes...");

  await setSubDoc(rid, "recipes", RCP.chickenAdobo, {
    _schemaVersion: 3,
    name: "Chicken Adobo",
    recipeType: "COOKED_TO_ORDER",
    sellingPrice: 185,
    portionSize: 300,
    portionUnit: "g",
    rawIngredients: [
      { rawMaterialId: RM.chicken, qty: 0.2 },
      { rawMaterialId: RM.oil, qty: 0.01 },
    ],
    subComponentIngredients: [{ subComponentId: SC.adoboBase, qty: 0.06 }],
    instructions: [
      "Marinate chicken pieces in <b>Adobo Marinade Base</b> for at least 30 minutes.",
      "Heat oil in a heavy pan over medium-high heat.",
      "Sear chicken skin-side down until golden, about 4 minutes per side.",
      "Pour marinade over chicken; bring to a boil.",
      "Reduce heat, cover, and simmer 25 minutes until chicken is cooked through.",
      "Uncover and reduce sauce to a glaze. Serve hot with garlic fried rice.",
    ],
    theoreticalCost: 0,
    actualCost: 0,
    currentStock: 0,
    category: "Mains",
    isActive: true,
    parPortions: 30,
  });

  await setSubDoc(rid, "recipes", RCP.porkSinigang, {
    _schemaVersion: 3,
    name: "Pork Sinigang",
    recipeType: "COOKED_TO_ORDER",
    sellingPrice: 195,
    portionSize: 400,
    portionUnit: "g",
    rawIngredients: [
      { rawMaterialId: RM.pork, qty: 0.25 },
      { rawMaterialId: RM.onion, qty: 0.05 },
    ],
    subComponentIngredients: [{ subComponentId: SC.sinigangBroth, qty: 0.3 }],
    instructions: [
      "Blanch pork belly pieces in boiling water 3 minutes; discard blanching water.",
      "Bring <b>Sinigang Broth Base</b> to a simmer in a large pot.",
      "Add blanched pork; cook 30 minutes until tender.",
      "Add sliced onion and any seasonal vegetables; cook 5 more minutes.",
      "Adjust sourness with additional tamarind paste as needed.",
      "Serve hot in a bowl with steamed rice on the side.",
    ],
    theoreticalCost: 0,
    actualCost: 0,
    currentStock: 0,
    category: "Soups",
    isActive: true,
    parPortions: 25,
  });

  await setSubDoc(rid, "recipes", RCP.sinangag, {
    _schemaVersion: 3,
    name: "Sinangag (Garlic Fried Rice)",
    recipeType: "PRE_MADE",
    sellingPrice: 55,
    portionSize: 200,
    portionUnit: "g",
    rawIngredients: [
      { rawMaterialId: RM.rice, qty: 0.18 },
      { rawMaterialId: RM.garlic, qty: 0.01 },
      { rawMaterialId: RM.oil, qty: 0.01 },
    ],
    subComponentIngredients: [],
    instructions: [
      "Cook jasmine rice one day ahead; refrigerate overnight for best results.",
      "Heat oil in a wok over high heat until smoking.",
      "Fry minced garlic until golden and fragrant, about 30 seconds.",
      "Add chilled cooked rice; toss and stir-fry 3–4 minutes.",
      "Season with salt and ground pepper. Serve as a batch portion.",
    ],
    theoreticalCost: 0,
    actualCost: 0,
    currentStock: 20,
    category: "Rice & Sides",
    isActive: true,
    parPortions: 50,
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────
async function setDoc(collection, docId, data) {
  await db.collection(collection).doc(docId).set(data);
  console.log(`  ✓  ${collection}/${docId}`);
}

async function setSubDoc(restaurantId, subCollection, docId, data) {
  await db
    .collection("restaurants")
    .doc(restaurantId)
    .collection(subCollection)
    .doc(docId)
    .set(data);
  console.log(`  ✓  restaurants/${restaurantId}/${subCollection}/${docId}`);
}

run().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
