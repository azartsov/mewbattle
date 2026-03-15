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
}

export interface AbilityProcs {
  attackerDoubleHit: boolean
  defenderDodge: boolean
  defenderShield: boolean
}

export interface TurnResult {
  defenderHealth: number
  attackerHealth: number
  damage: number
  dodged: boolean
  shielded: boolean
  doubled: boolean
  text: string
}
