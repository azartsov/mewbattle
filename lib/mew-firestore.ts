import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit as firestoreLimit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  writeBatch,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { BattleLogDoc, CardRarity, Deck, MewCard, UserCard, UserProfile } from "./mew-types"

export const BOOSTER_PACK_COST = 120
export interface BoosterOffer {
  id: "starter" | "hunter" | "royal"
  title: string
  subtitle: string
  cost: number
  rarityWeights: Record<CardRarity, number>
}

export const BOOSTER_OFFERS: BoosterOffer[] = [
  {
    id: "starter",
    title: "Starter Paw",
    subtitle: "Budget booster with mostly common cards",
    cost: 80,
    rarityWeights: {
      common: 0.7,
      rare: 0.2,
      epic: 0.08,
      legendary: 0.02,
    },
  },
  {
    id: "hunter",
    title: "Hunter Pack",
    subtitle: "Balanced chance for rare and epic cats",
    cost: 120,
    rarityWeights: {
      common: 0.55,
      rare: 0.25,
      epic: 0.15,
      legendary: 0.05,
    },
  },
  {
    id: "royal",
    title: "Royal Crown",
    subtitle: "Premium booster with better high-rarity odds",
    cost: 190,
    rarityWeights: {
      common: 0.4,
      rare: 0.3,
      epic: 0.2,
      legendary: 0.1,
    },
  },
]

export interface UserBattleLog {
  id: string
  winnerId: string
  bossId?: string
  turns: number
  createdAtMs: number
  rewardCoins: number
}

export const DECK_SLOT_KEYS = ["deck1", "deck2", "deck3"] as const
export type DeckSlotKey = (typeof DECK_SLOT_KEYS)[number]
const STARTING_COINS = 500
const STARTING_DECK_SIZE = 3
const MAX_DECK_SIZE_UPGRADED = 4
export const BATTLE_ENTRY_COST = 25

const SELL_PRICES: Record<CardRarity, number> = {
  common: 20,
  rare: 45,
  epic: 90,
  legendary: 180,
}

const DEFAULT_DECK_NAMES: Record<DeckSlotKey, string> = {
  deck1: "Колода 1",
  deck2: "Колода 2",
  deck3: "Колода 3",
}

const STARTER_CARDS: MewCard[] = [
  {
    id: "cat_knight",
    name: "Cat Knight",
    attack: 14,
    health: 52,
    rarity: "common",
    imageUrl: "/cards/cat_knight.svg",
    ability: "Shield stance",
    lore: "A loyal temple guard who stands firm against beak and claw.",
    bossAffinities: [],
  },
  {
    id: "cat_alchemist",
    name: "Cat Alchemist",
    attack: 12,
    health: 49,
    rarity: "common",
    imageUrl: "/cards/cat_alchemist.svg",
    ability: "Tonic shield",
    lore: "An apothecary tactician who raises a tonic shield and keeps the line stable.",
    bossAffinities: [],
  },
  {
    id: "cat_phantom",
    name: "Cat Phantom",
    attack: 14,
    health: 39,
    rarity: "common",
    imageUrl: "/cards/cat_phantom.svg",
    ability: "Phantom dodge",
    lore: "A whispering specter that fades between strikes and dodges fatal blows.",
    bossAffinities: [],
  },
  {
    id: "cat_ninja",
    name: "Cat Ninja",
    attack: 16,
    health: 40,
    rarity: "rare",
    imageUrl: "/cards/cat_ninja.svg",
    ability: "30% dodge",
    lore: "Silent hunter of moonlit rooftops, lethal against rushing beasts.",
    bossAffinities: [
      { bossType: "dog", level: 2 },
    ],
  },
  {
    id: "cat_mage",
    name: "Cat Mage",
    attack: 18,
    health: 38,
    rarity: "epic",
    imageUrl: "/cards/cat_mage.svg",
    ability: "Magic shield",
    lore: "Arcane scholar of warding arts, strongest against plague swarms.",
    bossAffinities: [
      { bossType: "rat", level: 2 },
      { bossType: "raven", level: 1 },
    ],
  },
  {
    id: "cat_berserker",
    name: "Cat Berserker",
    attack: 20,
    health: 42,
    rarity: "rare",
    imageUrl: "/cards/cat_berserker.svg",
    ability: "Chance for double strike",
    lore: "War-clan champion who breaks armor with relentless force.",
    bossAffinities: [
      { bossType: "dog", level: 2 },
    ],
  },
  {
    id: "cat_vampire",
    name: "Cat Vampire",
    attack: 17,
    health: 45,
    rarity: "epic",
    imageUrl: "/cards/cat_vampire.svg",
    ability: "Vamp: heal from damage",
    lore: "Ancient night stalker drawing strength from every wound inflicted.",
    bossAffinities: [
      { bossType: "rat", level: 1 },
      { bossType: "raven", level: 2 },
    ],
  },
  {
    id: "cat_dragon",
    name: "Cat Dragon",
    attack: 24,
    health: 58,
    rarity: "legendary",
    imageUrl: "/cards/cat_dragon.svg",
    ability: "Legendary double fire",
    lore: "Mythic flame sovereign feared by all bosses of the cursed wilds.",
    bossAffinities: [
      { bossType: "raven", level: 1 },
      { bossType: "dog", level: 1 },
      { bossType: "rat", level: 1 },
    ],
  },
]

const RARITY_WEIGHTS: Record<CardRarity, number> = {
  common: 0.55,
  rare: 0.25,
  epic: 0.15,
  legendary: 0.05,
}

const LOCAL_CARD_ART_BY_ID: Record<string, string> = {
  cat_knight: "/cards/cat_knight.svg",
  cat_alchemist: "/cards/cat_alchemist.svg",
  cat_phantom: "/cards/cat_phantom.svg",
  cat_ninja: "/cards/cat_ninja.svg",
  cat_mage: "/cards/cat_mage.svg",
  cat_berserker: "/cards/cat_berserker.svg",
  cat_vampire: "/cards/cat_vampire.svg",
  cat_dragon: "/cards/cat_dragon.svg",
}

function withLocalArt(card: MewCard): MewCard {
  const fallback = LOCAL_CARD_ART_BY_ID[card.id]
  if (!fallback) return card

  const isLegacyRemote = card.imageUrl.includes("placehold.co") || card.imageUrl.startsWith("http")
  if (isLegacyRemote || !card.imageUrl) {
    return { ...card, imageUrl: fallback }
  }
  return card
}

function pickUniqueCards(source: MewCard[], count: number): MewCard[] {
  const shuffled = [...source]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)))
}

function getBoosterCardCount(offer: BoosterOffer): number {
  const roll = Math.random()
  if (offer.id === "starter") {
    if (roll < 0.55) return 0
    if (roll < 0.9) return 1
    return 2
  }

  if (offer.id === "hunter") {
    if (roll < 0.35) return 0
    if (roll < 0.8) return 1
    return 2
  }

  if (roll < 0.2) return 0
  if (roll < 0.65) return 1
  return 2
}

function didUnlockFourthSlot(offer: BoosterOffer): boolean {
  const roll = Math.random()
  if (offer.id === "starter") return roll < 0.01
  if (offer.id === "hunter") return roll < 0.03
  return roll < 0.06
}

export interface BoosterOpenResult {
  cards: MewCard[]
  unlockedDeckSlot: boolean
}

export async function ensureCardsSeeded(): Promise<void> {
  const snapshot = await getDocs(collection(db, "cards"))
  if (!snapshot.empty) return

  await Promise.all(
    STARTER_CARDS.map((card) => setDoc(doc(db, "cards", card.id), card)),
  )
}

export async function fetchCards(): Promise<MewCard[]> {
  try {
    const snapshot = await getDocs(collection(db, "cards"))
    if (!snapshot.empty) {
      const fromDb = snapshot.docs.map((d) => withLocalArt(d.data() as MewCard))
      const existingIds = new Set(fromDb.map((card) => card.id))
      const missingStarterCards = STARTER_CARDS.filter((card) => !existingIds.has(card.id))
      return [...fromDb, ...missingStarterCards]
    }
  } catch {
    // Firestore read may be blocked by rules in some environments.
  }

  // Keep app playable even when shared cards collection is not readable/writable.
  return STARTER_CARDS
}

export async function fetchUserCards(userId: string): Promise<UserCard[]> {
  const q = query(collection(db, "user_cards"), where("userId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserCard, "id">) }))
}

export async function addOrIncrementUserCard(userId: string, cardId: string): Promise<void> {
  const ref = doc(db, "user_cards", `${userId}_${cardId}`)
  await setDoc(ref, {
    userId,
    cardId,
    level: 1,
    quantity: increment(1),
  }, { merge: true })
}

async function addCardsToInventory(userId: string, cardIds: string[]): Promise<void> {
  const batch = writeBatch(db)
  cardIds.forEach((cardId) => {
    const ref = doc(db, "user_cards", `${userId}_${cardId}`)
    batch.set(ref, {
      userId,
      cardId,
      level: 1,
      quantity: increment(1),
    }, { merge: true })
  })
  await batch.commit()
}

function profileRef(userId: string) {
  return doc(db, "user_profiles", userId)
}

export function getCardSellPrice(card: MewCard): number {
  return SELL_PRICES[card.rarity]
}

export async function ensureUserProfile(userId: string): Promise<void> {
  const ref = profileRef(userId)
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref)
    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<UserProfile>
      const needsPatch =
        typeof data.coins !== "number" ||
        typeof data.maxDeckSize !== "number" ||
        typeof data.wins !== "number" ||
        typeof data.losses !== "number" ||
        typeof data.streak !== "number" ||
        typeof data.totalEarned !== "number" ||
        typeof data.totalSpent !== "number" ||
        typeof data.cardCount !== "number" ||
        typeof data.nickname !== "string"

      if (!needsPatch) return

      tx.set(ref, {
        userId,
        nickname: data.nickname ?? "",
        coins: data.coins ?? STARTING_COINS,
        maxDeckSize: data.maxDeckSize ?? STARTING_DECK_SIZE,
        wins: data.wins ?? 0,
        losses: data.losses ?? 0,
        streak: data.streak ?? 0,
        totalEarned: data.totalEarned ?? STARTING_COINS,
        totalSpent: data.totalSpent ?? 0,
        cardCount: data.cardCount ?? 0,
        updatedAtMs: Date.now(),
        updatedAt: serverTimestamp(),
      }, { merge: true })
      return
    }

    tx.set(ref, {
      userId,
      nickname: "",
      coins: STARTING_COINS,
      maxDeckSize: STARTING_DECK_SIZE,
      wins: 0,
      losses: 0,
      streak: 0,
      totalEarned: STARTING_COINS,
      totalSpent: 0,
      cardCount: 0,
      updatedAtMs: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  await ensureUserProfile(userId)
  const snapshot = await getDoc(profileRef(userId))
  const data = snapshot.data() as UserProfile
  return {
    ...data,
    nickname: data.nickname ?? "",
    maxDeckSize: data.maxDeckSize ?? STARTING_DECK_SIZE,
    cardCount: data.cardCount ?? 0,
    updatedAtMs: data.updatedAtMs ?? 0,
  }
}

export async function openBoosterWithCoins(userId: string, allCards: MewCard[], count = 5): Promise<BoosterOpenResult> {
  const defaultOffer = BOOSTER_OFFERS.find((offer) => offer.cost === BOOSTER_PACK_COST) ?? BOOSTER_OFFERS[1]
  return openBoosterWithOffer(userId, allCards, defaultOffer.id, count)
}

export async function openBoosterWithOffer(
  userId: string,
  allCards: MewCard[],
  offerId: BoosterOffer["id"],
  count = 5,
): Promise<BoosterOpenResult> {
  if (allCards.length === 0) {
    return {
      cards: [],
      unlockedDeckSlot: false,
    }
  }

  const offer = BOOSTER_OFFERS.find((candidate) => candidate.id === offerId)
  if (!offer) {
    throw new Error("UNKNOWN_BOOSTER")
  }

  await ensureUserProfile(userId)
  await runTransaction(db, async (tx) => {
    const pRef = profileRef(userId)
    const pSnap = await tx.get(pRef)
    const profile = pSnap.data() as UserProfile | undefined
    const coins = profile?.coins ?? STARTING_COINS

    if (coins < offer.cost) {
      throw new Error("INSUFFICIENT_COINS")
    }

    tx.set(pRef, {
      userId,
      coins: coins - offer.cost,
      totalSpent: (profile?.totalSpent ?? 0) + offer.cost,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  })

  const dropCount = Math.max(0, Math.min(2, count, getBoosterCardCount(offer)))
  const dropped = drawBooster(allCards, dropCount, offer.rarityWeights)
  if (dropped.length > 0) {
    await addCardsToInventory(userId, dropped.map((card) => card.id))
    await setDoc(profileRef(userId), {
      userId,
      cardCount: increment(dropped.length),
      updatedAtMs: Date.now(),
    }, { merge: true })
  }

  const unlockRoll = didUnlockFourthSlot(offer)
  let unlockedDeckSlot = false

  if (unlockRoll) {
    await runTransaction(db, async (tx) => {
      const pRef = profileRef(userId)
      const snap = await tx.get(pRef)
      const profile = snap.data() as UserProfile | undefined
      const currentMax = profile?.maxDeckSize ?? STARTING_DECK_SIZE
      if (currentMax >= MAX_DECK_SIZE_UPGRADED) return

      tx.set(pRef, {
        userId,
        maxDeckSize: MAX_DECK_SIZE_UPGRADED,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      unlockedDeckSlot = true
    })
  }

  return {
    cards: dropped,
    unlockedDeckSlot,
  }
}

export async function fetchUserBattleLogs(userId: string, limit = 20): Promise<UserBattleLog[]> {
  const q = query(collection(db, "battles"), where("player1Id", "==", userId))
  const snapshot = await getDocs(q)

  const mapped = snapshot.docs.map((battleDoc) => {
    const data = battleDoc.data() as BattleLogDoc & { createdAt?: { seconds?: number } | number }
    const turns = Array.isArray(data.log)
      ? data.log.reduce((maxTurn, entry) => Math.max(maxTurn, entry.turn), 0)
      : 0

    const createdAt = data.createdAt as number | { seconds?: number } | undefined
    const createdAtMs = typeof createdAt === "number"
      ? createdAt
      : ((createdAt?.seconds ?? 0) * 1000)

    return {
      id: battleDoc.id,
      winnerId: data.winnerId,
      bossId: data.bossId,
      turns,
      createdAtMs,
      rewardCoins: typeof data.rewardCoins === "number" ? data.rewardCoins : 0,
    }
  })

  return mapped
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, limit)
}

export async function sellUserCardForCoins(userId: string, card: MewCard): Promise<number> {
  const reward = getCardSellPrice(card)
  const pRef = profileRef(userId)
  const uRef = doc(db, "user_cards", `${userId}_${card.id}`)

  await ensureUserProfile(userId)

  await runTransaction(db, async (tx) => {
    const [profileSnap, userCardSnap] = await Promise.all([tx.get(pRef), tx.get(uRef)])
    const profile = profileSnap.data() as UserProfile | undefined
    const userCard = userCardSnap.data() as Omit<UserCard, "id"> | undefined

    if (!userCard || (userCard.quantity ?? 0) <= 1) {
      throw new Error("NOT_ENOUGH_CARDS_TO_SELL")
    }

    tx.set(uRef, {
      quantity: (userCard.quantity ?? 0) - 1,
    }, { merge: true })

    tx.set(pRef, {
      userId,
      coins: (profile?.coins ?? STARTING_COINS) + reward,
      totalEarned: (profile?.totalEarned ?? STARTING_COINS) + reward,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  })

  return reward
}

export async function payBattleEntry(userId: string, cost = BATTLE_ENTRY_COST): Promise<void> {
  await ensureUserProfile(userId)
  const ref = profileRef(userId)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const profile = snap.data() as UserProfile | undefined

    const coins = profile?.coins ?? STARTING_COINS
    if (coins < cost) {
      throw new Error("INSUFFICIENT_COINS_FOR_BATTLE")
    }

    tx.set(ref, {
      userId,
      coins: coins - cost,
      totalSpent: (profile?.totalSpent ?? 0) + cost,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  })
}

export async function awardBattleCoins(userId: string, didWin: boolean, rewardOnWin: number): Promise<number> {
  await ensureUserProfile(userId)
  const ref = profileRef(userId)

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const profile = snap.data() as UserProfile | undefined

    const currentStreak = profile?.streak ?? 0
    const nextStreak = didWin ? currentStreak + 1 : 0
    const earned = didWin ? Math.max(50, Math.min(200, Math.round(rewardOnWin))) : 0

    tx.set(ref, {
      userId,
      coins: (profile?.coins ?? STARTING_COINS) + earned,
      wins: (profile?.wins ?? 0) + (didWin ? 1 : 0),
      losses: (profile?.losses ?? 0) + (didWin ? 0 : 1),
      streak: nextStreak,
      totalEarned: (profile?.totalEarned ?? STARTING_COINS) + earned,
      updatedAt: serverTimestamp(),
    }, { merge: true })

    return earned
  })
}

export async function fetchUserDecks(userId: string): Promise<Deck[]> {
  const q = query(collection(db, "decks"), where("userId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Deck, "id">) }))
}

export async function ensureDefaultDeckSlots(userId: string): Promise<void> {
  const existing = await fetchUserDecks(userId)
  const bySlot = new Set(existing.map((deck) => deck.slot).filter((slot): slot is DeckSlotKey => !!slot))

  const missingSlots = DECK_SLOT_KEYS.filter((slotKey) => !bySlot.has(slotKey))
  if (missingSlots.length > 0) {
    const batch = writeBatch(db)
    missingSlots.forEach((slotKey) => {
      const deckId = `${userId}_${slotKey}`
      batch.set(doc(db, "decks", deckId), {
        userId,
        slot: slotKey,
        deckName: DEFAULT_DECK_NAMES[slotKey],
        cards: [],
      }, { merge: true })
    })
    await batch.commit()
  }

  const inventory = await fetchUserCards(userId)
  if (inventory.length > 0) return

  const starterCards = pickUniqueCards(STARTER_CARDS, STARTING_DECK_SIZE)
  const starterIds = starterCards.map((card) => card.id)

  if (starterIds.length > 0) {
    await addCardsToInventory(userId, starterIds)
  }

  const deckOneId = `${userId}_deck1`
  await setDoc(doc(db, "decks", deckOneId), {
    userId,
    slot: "deck1",
    deckName: DEFAULT_DECK_NAMES.deck1,
    cards: starterIds,
  }, { merge: true })

  await setDoc(profileRef(userId), {
    userId,
    cardCount: STARTING_DECK_SIZE,
    updatedAtMs: Date.now(),
  }, { merge: true })
}

export function getDefaultDeckName(slotKey: DeckSlotKey): string {
  return DEFAULT_DECK_NAMES[slotKey]
}

export async function saveDeckToSlot(
  userId: string,
  slotKey: DeckSlotKey,
  deckName: string,
  cards: string[],
  maxDeckSize = STARTING_DECK_SIZE,
): Promise<void> {
  const inventory = await fetchUserCards(userId)
  const ownedByCardId = new Map(inventory.map((item) => [item.cardId, item.quantity]))
  const usedByCardId = new Map<string, number>()

  const safeCards: string[] = []
  for (const cardId of cards) {
    const ownedQty = ownedByCardId.get(cardId) ?? 0
    if (ownedQty <= 0) continue

    const usedQty = usedByCardId.get(cardId) ?? 0
    if (usedQty >= ownedQty) continue

    usedByCardId.set(cardId, usedQty + 1)
    safeCards.push(cardId)
  }

  const deckId = `${userId}_${slotKey}`
  await setDoc(doc(db, "decks", deckId), {
    userId,
    slot: slotKey,
    deckName: deckName.trim() || DEFAULT_DECK_NAMES[slotKey],
    cards: safeCards.slice(0, Math.max(1, Math.min(MAX_DECK_SIZE_UPGRADED, maxDeckSize))),
  }, { merge: true })
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

export function drawBooster(
  cards: MewCard[],
  count = 5,
  rarityWeights: Record<CardRarity, number> = RARITY_WEIGHTS,
): MewCard[] {
  if (count <= 0) return []
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
      acc += rarityWeights[rarity]
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

/**
 * Полностью сбрасывает прогресс пользователя до начального состояния:
 * – профиль: 500 монет, 0 побед/поражений, maxDeckSize = 3
 * – инвентарь: все карты удаляются
 * – колоды: все слоты очищаются
 * – стартовые 3 карты добавляются в инвентарь и deck1
 */
export async function resetUserToInitialState(userId: string): Promise<void> {
  // 1. Получить все пользовательские карты для удаления
  const userCardsSnap = await getDocs(
    query(collection(db, "user_cards"), where("userId", "==", userId)),
  )

  const batch = writeBatch(db)

  // 2. Удалить все карты инвентаря
  userCardsSnap.docs.forEach((cardDoc) => batch.delete(cardDoc.ref))

  // 3. Очистить все слоты колод
  DECK_SLOT_KEYS.forEach((slotKey) => {
    batch.set(doc(db, "decks", `${userId}_${slotKey}`), {
      userId,
      slot: slotKey,
      deckName: DEFAULT_DECK_NAMES[slotKey],
      cards: [],
    })
  })

  // 4. Сбросить профиль
  batch.set(profileRef(userId), {
    userId,
    coins: STARTING_COINS,
    maxDeckSize: STARTING_DECK_SIZE,
    wins: 0,
    losses: 0,
    streak: 0,
    totalEarned: STARTING_COINS,
    totalSpent: 0,
    cardCount: STARTING_DECK_SIZE,
    updatedAtMs: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  await batch.commit()

  // 5. Засеять стартовые карты и заполнить deck1
  const starterCards = pickUniqueCards(STARTER_CARDS, STARTING_DECK_SIZE)
  const starterIds = starterCards.map((c) => c.id)

  await addCardsToInventory(userId, starterIds)

  await setDoc(doc(db, "decks", `${userId}_deck1`), {
    userId,
    slot: "deck1",
    deckName: DEFAULT_DECK_NAMES.deck1,
    cards: starterIds,
  }, { merge: true })
}

export async function saveUserNickname(userId: string, nickname: string): Promise<void> {
  await ensureUserProfile(userId)
  await setDoc(profileRef(userId), {
    userId,
    nickname: nickname.trim().slice(0, 10),
    updatedAtMs: Date.now(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export interface LeaderboardEntry {
  userId: string
  nickname: string
  totalEarned: number
  cardCount: number
  updatedAtMs: number
}

export async function fetchLeaderboard(topN = 25): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, "user_profiles"),
      orderBy("totalEarned", "desc"),
      firestoreLimit(topN),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data() as UserProfile
      return {
        userId: data.userId,
        nickname: data.nickname?.trim() || data.userId.slice(0, 8),
        totalEarned: data.totalEarned ?? 0,
        cardCount: data.cardCount ?? 0,
        updatedAtMs: data.updatedAtMs ?? 0,
      }
    })
  } catch {
    return []
  }
}
