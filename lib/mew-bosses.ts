import type { BossType, FighterCard } from "./mew-types"

export const BOSS_TYPE_ICON: Record<BossType, string> = {
  raven: "/bosses/evil_raven.svg",
  dog: "/bosses/evil_dog.svg",
  rat: "/bosses/evil_rat.svg",
}

export const BOSS_TYPE_LABEL: Record<BossType, string> = {
  raven: "Raven",
  dog: "Dog",
  rat: "Rat",
}

export const BOSS_TYPE_THEME: Record<BossType, {
  chipClass: string
  badgeClass: string
}> = {
  raven: {
    chipClass: "border-violet-300/30 bg-[#3f235f] text-[#f4e8ff]",
    badgeClass: "border-violet-400/55 bg-violet-900/55 text-violet-100",
  },
  dog: {
    chipClass: "border-amber-300/30 bg-[#5f3d14] text-[#fff1d6]",
    badgeClass: "border-amber-400/55 bg-amber-900/55 text-amber-100",
  },
  rat: {
    chipClass: "border-emerald-300/30 bg-[#184330] text-[#dcffef]",
    badgeClass: "border-emerald-400/55 bg-emerald-900/55 text-emerald-100",
  },
}

export const BOSS_FIGHTERS: FighterCard[] = [
  {
    id: "boss_raven",
    entityType: "boss",
    bossType: "raven",
    name: "Evil Raven",
    attack: 13,
    health: 164,
    currentHealth: 164,
    ability: "Ninja dodge and mage shield",
    lore: "A cursed raven sorcerer who controls storm feathers and mirror wards.",
    imageUrl: BOSS_TYPE_ICON.raven,
  },
  {
    id: "boss_dog",
    entityType: "boss",
    bossType: "dog",
    name: "Evil Dog",
    attack: 15,
    health: 178,
    currentHealth: 178,
    ability: "Bite and counterattack",
    lore: "An iron-jawed war dog from the burnt shrine roads.",
    imageUrl: BOSS_TYPE_ICON.dog,
  },
  {
    id: "boss_rat",
    entityType: "boss",
    bossType: "rat",
    name: "Evil Rat",
    attack: 12,
    health: 156,
    currentHealth: 156,
    ability: "Quick dodge and poison-like chip damage",
    lore: "A plague rat master that wins by speed and attrition.",
    imageUrl: BOSS_TYPE_ICON.rat,
  },
]

export function pickRandomBoss(excludeBossId?: string): FighterCard {
  const pool = excludeBossId
    ? BOSS_FIGHTERS.filter((boss) => boss.id !== excludeBossId)
    : BOSS_FIGHTERS
  const source = pool.length > 0 ? pool : BOSS_FIGHTERS
  const picked = source[Math.floor(Math.random() * source.length)]

  return {
    ...picked,
    currentHealth: picked.health,
  }
}

export function scaleBossForPlayer(baseBoss: FighterCard, playerPower: number): FighterCard {
  const clampedPower = Math.max(0, Math.min(10, playerPower))
  const attackMultiplier = 1 + Math.max(0, clampedPower - 1) * 0.045
  const healthMultiplier = 1 + Math.max(0, clampedPower - 0.75) * 0.06

  const attack = Math.max(baseBoss.attack, Math.round(baseBoss.attack * attackMultiplier))
  const health = Math.max(baseBoss.health, Math.round(baseBoss.health * healthMultiplier))

  return {
    ...baseBoss,
    attack,
    health,
    currentHealth: health,
  }
}
