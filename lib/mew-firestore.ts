import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { BattleLogDoc, CardRarity, Deck, MewCard, UserCard } from "./mew-types"

const STARTER_CARDS: MewCard[] = [
  {
    id: "cat_knight",
    name: "Cat Knight",
    attack: 14,
    health: 52,
    rarity: "common",
    imageUrl: "https://placehold.co/320x180?text=Cat+Knight",
    ability: "Shield stance",
  },
  {
    id: "cat_ninja",
    name: "Cat Ninja",
    attack: 16,
    health: 40,
    rarity: "rare",
    imageUrl: "https://placehold.co/320x180?text=Cat+Ninja",
    ability: "30% dodge",
  },
  {
    id: "cat_mage",
    name: "Cat Mage",
    attack: 18,
    health: 38,
    rarity: "epic",
    imageUrl: "https://placehold.co/320x180?text=Cat+Mage",
    ability: "Magic shield",
  },
  {
    id: "cat_berserker",
    name: "Cat Berserker",
    attack: 20,
    health: 42,
    rarity: "rare",
    imageUrl: "https://placehold.co/320x180?text=Cat+Berserker",
    ability: "Chance for double strike",
  },
  {
    id: "cat_vampire",
    name: "Cat Vampire",
    attack: 17,
    health: 45,
    rarity: "epic",
    imageUrl: "https://placehold.co/320x180?text=Cat+Vampire",
    ability: "Vamp: heal from damage",
  },
  {
    id: "cat_dragon",
    name: "Cat Dragon",
    attack: 24,
    health: 58,
    rarity: "legendary",
    imageUrl: "https://placehold.co/320x180?text=Cat+Dragon",
    ability: "Legendary double fire",
  },
]

const RARITY_WEIGHTS: Record<CardRarity, number> = {
  common: 0.55,
  rare: 0.25,
  epic: 0.15,
  legendary: 0.05,
}

export async function ensureCardsSeeded(): Promise<void> {
  const snapshot = await getDocs(collection(db, "cards"))
  if (!snapshot.empty) return

  await Promise.all(
    STARTER_CARDS.map((card) => setDoc(doc(db, "cards", card.id), card)),
  )
}

export async function fetchCards(): Promise<MewCard[]> {
  await ensureCardsSeeded()
  const snapshot = await getDocs(collection(db, "cards"))
  return snapshot.docs.map((d) => d.data() as MewCard)
}

export async function fetchUserCards(userId: string): Promise<UserCard[]> {
  const q = query(collection(db, "user_cards"), where("userId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserCard, "id">) }))
}

export async function addOrIncrementUserCard(userId: string, cardId: string): Promise<void> {
  const ref = doc(db, "user_cards", `${userId}_${cardId}`)
  const existing = await fetchUserCards(userId)
  const found = existing.find((c) => c.cardId === cardId)

  const payload: Omit<UserCard, "id"> = {
    userId,
    cardId,
    level: found?.level ?? 1,
    quantity: (found?.quantity ?? 0) + 1,
  }
  await setDoc(ref, payload)
}

export async function fetchUserDecks(userId: string): Promise<Deck[]> {
  const q = query(collection(db, "decks"), where("userId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Deck, "id">) }))
}

export async function saveDeck(userId: string, deckName: string, cards: string[]): Promise<void> {
  const deckId = `${userId}_${deckName.toLowerCase().replace(/\s+/g, "_")}`
  await setDoc(doc(db, "decks", deckId), {
    userId,
    deckName,
    cards: cards.slice(0, 10),
  })
}

export async function saveBattleLog(payload: BattleLogDoc): Promise<void> {
  await addDoc(collection(db, "battles"), {
    ...payload,
    createdAt: serverTimestamp(),
  })
}

export function drawBooster(cards: MewCard[], count = 5): MewCard[] {
  const byRarity = {
    common: cards.filter((c) => c.rarity === "common"),
    rare: cards.filter((c) => c.rarity === "rare"),
    epic: cards.filter((c) => c.rarity === "epic"),
    legendary: cards.filter((c) => c.rarity === "legendary"),
  }

  const pickRarity = (): CardRarity => {
    const roll = Math.random()
    let acc = 0
    const order: CardRarity[] = ["common", "rare", "epic", "legendary"]
    for (const rarity of order) {
      acc += RARITY_WEIGHTS[rarity]
      if (roll <= acc) return rarity
    }
    return "common"
  }

  const pack: MewCard[] = []
  for (let i = 0; i < count; i++) {
    const rarity = pickRarity()
    const pool = byRarity[rarity]
    const fallback = cards
    const source = pool.length > 0 ? pool : fallback
    const picked = source[Math.floor(Math.random() * source.length)]
    pack.push(picked)
  }
  return pack
}
