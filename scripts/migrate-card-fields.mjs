import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")

function loadEnvLocal() {
  const envPath = path.join(projectRoot, ".env.local")
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq <= 0) continue

    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvLocal()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
]

const missing = requiredKeys.filter((key) => !firebaseConfig[key])
if (missing.length > 0) {
  console.error("Missing Firebase config keys:", missing.join(", "))
  process.exit(1)
}

const CARD_FIELD_PATCH_BY_ID = {
  cat_knight: {
    lore: "A loyal temple guard who stands firm against beak and claw.",
    bossAffinities: [],
  },
  cat_alchemist: {
    lore: "An apothecary tactician who raises a tonic shield and keeps the line stable.",
    bossAffinities: [],
  },
  cat_phantom: {
    lore: "A whispering specter that fades between strikes and dodges fatal blows.",
    bossAffinities: [],
  },
  cat_ninja: {
    lore: "Silent hunter of moonlit rooftops, lethal against rushing beasts.",
    bossAffinities: [
      { bossType: "dog", level: 2 },
    ],
  },
  cat_mage: {
    lore: "Arcane scholar of warding arts, strongest against plague swarms.",
    bossAffinities: [
      { bossType: "rat", level: 2 },
      { bossType: "raven", level: 1 },
    ],
  },
  cat_berserker: {
    lore: "War-clan champion who breaks armor with relentless force.",
    bossAffinities: [{ bossType: "dog", level: 2 }],
  },
  cat_vampire: {
    lore: "Ancient night stalker drawing strength from every wound inflicted.",
    bossAffinities: [
      { bossType: "rat", level: 1 },
      { bossType: "raven", level: 2 },
    ],
  },
  cat_dragon: {
    lore: "Mythic flame sovereign feared by all bosses of the cursed wilds.",
    bossAffinities: [
      { bossType: "raven", level: 1 },
      { bossType: "dog", level: 1 },
      { bossType: "rat", level: 1 },
    ],
  },
}

function fallbackPatch(cardData) {
  return {
    lore: cardData.lore || `${cardData.name || "This fighter"} enters battle with ${cardData.ability || "a unique combat style"}.`,
    bossAffinities: Array.isArray(cardData.bossAffinities) ? cardData.bossAffinities : [],
  }
}

const dryRun = process.argv.includes("--dry-run")

async function run() {
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  const snap = await getDocs(collection(db, "cards"))
  if (snap.empty) {
    console.log("No cards found in /cards. Nothing to migrate.")
    return
  }

  const docs = snap.docs
  let processed = 0
  let changed = 0

  for (let start = 0; start < docs.length; start += 400) {
    const chunk = docs.slice(start, start + 400)
    const batch = writeBatch(db)
    let chunkChanges = 0

    for (const cardDoc of chunk) {
      processed += 1
      const data = cardDoc.data() || {}
      const patch = CARD_FIELD_PATCH_BY_ID[data.id] || CARD_FIELD_PATCH_BY_ID[cardDoc.id] || fallbackPatch(data)

      const nextLore = typeof patch.lore === "string" ? patch.lore : ""
      const nextAffinities = Array.isArray(patch.bossAffinities) ? patch.bossAffinities : []

      const loreChanged = data.lore !== nextLore
      const affinityChanged = JSON.stringify(data.bossAffinities || []) !== JSON.stringify(nextAffinities)
      if (!loreChanged && !affinityChanged) continue

      chunkChanges += 1
      changed += 1

      if (!dryRun) {
        batch.set(cardDoc.ref, {
          lore: nextLore,
          bossAffinities: nextAffinities,
        }, { merge: true })
      }
    }

    if (!dryRun && chunkChanges > 0) {
      await batch.commit()
    }
  }

  console.log(`Cards scanned: ${processed}`)
  console.log(`Cards updated: ${changed}`)
  console.log(`Mode: ${dryRun ? "dry-run" : "write"}`)
}

run().catch((error) => {
  console.error("Migration failed:", error)
  process.exit(1)
})
