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
    chipClass: "border-violet-400/45 bg-violet-500/15 text-violet-100",
    badgeClass: "border-violet-400/55 bg-violet-900/55 text-violet-100",
  },
  dog: {
    chipClass: "border-amber-400/45 bg-amber-500/15 text-amber-100",
    badgeClass: "border-amber-400/55 bg-amber-900/55 text-amber-100",
  },
  rat: {
    chipClass: "border-emerald-400/45 bg-emerald-500/15 text-emerald-100",
    badgeClass: "border-emerald-400/55 bg-emerald-900/55 text-emerald-100",
  },
}

export const BOSS_FIGHTERS: FighterCard[] = [
  {
    id: "boss_raven",
    entityType: "boss",
    bossType: "raven",
    name: "Evil Raven",
    attack: 14,
    health: 180,
    currentHealth: 180,
    ability: "Ninja dodge and mage shield",
    lore: "A cursed raven sorcerer who controls storm feathers and mirror wards.",
    imageUrl: BOSS_TYPE_ICON.raven,
  },
  {
    id: "boss_dog",
    entityType: "boss",
    bossType: "dog",
    name: "Evil Dog",
    attack: 16,
    health: 195,
    currentHealth: 195,
    ability: "Berserk bite and heavy counterattack",
    lore: "An iron-jawed war dog from the burnt shrine roads.",
    imageUrl: BOSS_TYPE_ICON.dog,
  },
  {
    id: "boss_rat",
    entityType: "boss",
    bossType: "rat",
    name: "Evil Rat",
    attack: 13,
    health: 170,
    currentHealth: 170,
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
  const attackMultiplier = 1 + clampedPower * 0.055
  const healthMultiplier = 1 + clampedPower * 0.075

  const attack = Math.max(baseBoss.attack, Math.round(baseBoss.attack * attackMultiplier))
  const health = Math.max(baseBoss.health, Math.round(baseBoss.health * healthMultiplier))

  return {
    ...baseBoss,
    attack,
    health,
    currentHealth: health,
  }
}
