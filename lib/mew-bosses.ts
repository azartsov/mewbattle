import type { BossType, FighterCard } from "./mew-types"
import type { CardDesignVariant } from "./mew-card-design"

const BOSS_AFFINITY_CHIP_LABEL: Record<BossType, { en: string; ru: string }> = {
  raven: { en: "c", ru: "в" },
  dog: { en: "d", ru: "п" },
  rat: { en: "r", ru: "к" },
}

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

const CLASSIC_BOSS_TYPE_THEME: Record<BossType, {
  chipClass: string
  badgeClass: string
}> = {
  raven: {
    chipClass: "border-violet-200/28 bg-[#574270]/76 text-[#f6eeff]",
    badgeClass: "border-violet-400/55 bg-violet-900/55 text-violet-100",
  },
  dog: {
    chipClass: "border-amber-200/28 bg-[#72563a]/76 text-[#fff3e3]",
    badgeClass: "border-amber-400/55 bg-amber-900/55 text-amber-100",
  },
  rat: {
    chipClass: "border-emerald-200/28 bg-[#305648]/76 text-[#e9fff4]",
    badgeClass: "border-emerald-400/55 bg-emerald-900/55 text-emerald-100",
  },
}

const STORYBOOK_BOSS_TYPE_THEME: Record<BossType, {
  chipClass: string
  badgeClass: string
}> = {
  raven: {
    chipClass: "border-violet-300/42 bg-[#ebe5f3]/86 text-[#6b5e7e]",
    badgeClass: "border-violet-300/55 bg-[#ece5f4]/82 text-[#665876]",
  },
  dog: {
    chipClass: "border-amber-300/42 bg-[#f5eadb]/86 text-[#81664a]",
    badgeClass: "border-amber-300/55 bg-[#f7ecd8]/82 text-[#7d6443]",
  },
  rat: {
    chipClass: "border-emerald-300/42 bg-[#e4efe7]/86 text-[#577263]",
    badgeClass: "border-emerald-300/55 bg-[#e7f1e8]/82 text-[#566e61]",
  },
}

export function getBossTypeTheme(variant: CardDesignVariant = "classic") {
  return variant === "storybook" ? STORYBOOK_BOSS_TYPE_THEME : CLASSIC_BOSS_TYPE_THEME
}

export const BOSS_TYPE_THEME = CLASSIC_BOSS_TYPE_THEME

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

export function getBossAffinityChipLabel(bossType: BossType, language: "en" | "ru") {
  return BOSS_AFFINITY_CHIP_LABEL[bossType][language]
}

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
