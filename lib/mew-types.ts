export type CardRarity = "common" | "rare" | "epic" | "legendary"
export type BossType = "raven" | "dog" | "rat"

export interface BossAffinity {
  bossType: BossType
  level: number
}

export interface MewCard {
  id: string
  name: string
  attack: number
  health: number
  rarity: CardRarity
  imageUrl: string
  ability: string
  lore?: string
  bossAffinities?: BossAffinity[]
}

export interface UserCard {
  id: string
  userId: string
  cardId: string
  level: number
  quantity: number
}

export interface Deck {
  id: string
  userId: string
  deckName: string
  cards: string[]
  slot?: "deck1" | "deck2" | "deck3"
}

export interface UserProfile {
  userId: string
  nickname?: string
  coins: number
  maxDeckSize?: number
  wins: number
  losses: number
  streak: number
  totalEarned: number
  totalSpent: number
  cardCount?: number
  updatedAtMs?: number
  battleHistoryResetAtMs?: number
}

export interface BattleLogEntry {
  turn: number
  actor: "player" | "boss"
  text: string
  damage: number
}

export interface BattleLogDoc {
  player1Id: string
  player2Id?: string
  bossId?: string
  winnerId: string
  rewardCoins?: number
  log: BattleLogEntry[]
  createdAt: number
}

export interface FighterCard {
  id: string
  entityType?: "cat" | "boss"
  name: string
  attack: number
  health: number
  currentHealth: number
  ability: string
  imageUrl?: string
  lore?: string
  bossType?: BossType
  bossAffinities?: BossAffinity[]
}

export interface AbilityProcs {
  attackerDoubleHit: boolean
  defenderDodge: boolean
  defenderShield: boolean
  defenderCounter: boolean
}

export interface TurnResult {
  defenderHealth: number
  attackerHealth: number
  damage: number
  dodged: boolean
  shielded: boolean
  doubled: boolean
  countered: boolean
  counterDamage: number
  text: string
}
