export type CardRarity = "common" | "rare" | "epic" | "legendary"

export interface MewCard {
  id: string
  name: string
  attack: number
  health: number
  rarity: CardRarity
  imageUrl: string
  ability: string
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
  coins: number
  wins: number
  losses: number
  streak: number
  totalEarned: number
  totalSpent: number
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
  name: string
  attack: number
  health: number
  currentHealth: number
  ability: string
  imageUrl?: string
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
