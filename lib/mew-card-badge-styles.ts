import type { MewCard } from "@/lib/mew-types"
import type { CardDesignVariant } from "@/lib/mew-card-design"

const CLASSIC_CARD_STAT_BADGE_CLASS = {
  attack: "rounded-md border border-rose-200/28 bg-[#5a2731]/78 px-2 py-1 font-medium text-[#ffe4e8]",
  health: "rounded-md border border-emerald-200/28 bg-[#214639]/78 px-2 py-1 font-medium text-[#e4fff1]",
  ability: "rounded border border-sky-200/30 bg-[#24465f]/78 px-2 py-0.5 text-[#e4f5ff]",
  abilityCompact: "inline-flex max-w-full items-center rounded-md border border-sky-200/30 bg-[#24465f]/78 px-2 py-1 text-[10px] font-medium text-[#e4f5ff]",
  owned: "rounded-md border border-slate-200/22 bg-[#334457]/74 px-2 py-1 text-[11px] font-medium text-[#f2f7ff]",
  attackCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-rose-200/28 bg-[#5a2731]/78 px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#ffe4e8]",
  healthCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-emerald-200/28 bg-[#214639]/78 px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#e4fff1]",
  ownedCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-slate-200/22 bg-[#334457]/74 px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#f2f7ff]",
} as const

const STORYBOOK_CARD_STAT_BADGE_CLASS = {
  attack: "rounded-md border border-rose-300/45 bg-[#f6e0e0]/86 px-2 py-1 font-medium text-[#7c4b53]",
  health: "rounded-md border border-emerald-300/45 bg-[#e3f2e8]/86 px-2 py-1 font-medium text-[#476b5b]",
  ability: "rounded border border-sky-300/45 bg-[#e2eef4]/88 px-2 py-0.5 text-[#466778]",
  abilityCompact: "inline-flex max-w-full items-center rounded-md border border-sky-300/45 bg-[#e2eef4]/88 px-2 py-1 text-[10px] font-medium text-[#466778]",
  owned: "rounded-md border border-stone-300/40 bg-[#ede8df]/84 px-2 py-1 text-[11px] font-medium text-[#5f5c59]",
  attackCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-rose-300/45 bg-[#f6e0e0]/86 px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#7c4b53]",
  healthCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-emerald-300/45 bg-[#e3f2e8]/86 px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#476b5b]",
  ownedCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-stone-300/40 bg-[#ede8df]/84 px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#5f5c59]",
} as const

const CLASSIC_CARD_RARITY_BADGE_CLASS: Record<MewCard["rarity"], string> = {
  common: "bg-[#3f454f] text-[#f4f7fb]",
  rare: "bg-[#124a75] text-[#ebf8ff]",
  epic: "bg-[#5a216d] text-[#fdefff]",
  legendary: "bg-[#7a4a0d] text-[#fff6d6]",
}

const STORYBOOK_CARD_RARITY_BADGE_CLASS: Record<MewCard["rarity"], string> = {
  common: "bg-[#d7d7d1] text-[#585651]",
  rare: "bg-[#d5eaf4] text-[#4b6474]",
  epic: "bg-[#eadcf1] text-[#6e5679]",
  legendary: "bg-[#f4e7c8] text-[#80653e]",
}

type CardRarityTheme = {
  ring: string
  badge: string
  glow: string
}

const CLASSIC_RARITY_THEME: Record<MewCard["rarity"], CardRarityTheme> = {
  common: {
    ring: "border-zinc-700/80",
    badge: CLASSIC_CARD_RARITY_BADGE_CLASS.common,
    glow: "from-zinc-400/15 via-transparent to-transparent",
  },
  rare: {
    ring: "border-sky-500/50",
    badge: CLASSIC_CARD_RARITY_BADGE_CLASS.rare,
    glow: "from-sky-400/25 via-transparent to-transparent",
  },
  epic: {
    ring: "border-fuchsia-500/50",
    badge: CLASSIC_CARD_RARITY_BADGE_CLASS.epic,
    glow: "from-fuchsia-400/25 via-transparent to-transparent",
  },
  legendary: {
    ring: "border-amber-500/60",
    badge: CLASSIC_CARD_RARITY_BADGE_CLASS.legendary,
    glow: "from-amber-300/35 via-transparent to-transparent",
  },
}

const STORYBOOK_RARITY_THEME: Record<MewCard["rarity"], CardRarityTheme> = {
  common: {
    ring: "border-stone-300/75",
    badge: STORYBOOK_CARD_RARITY_BADGE_CLASS.common,
    glow: "from-white/35 via-transparent to-transparent",
  },
  rare: {
    ring: "border-sky-200/75",
    badge: STORYBOOK_CARD_RARITY_BADGE_CLASS.rare,
    glow: "from-sky-100/40 via-transparent to-transparent",
  },
  epic: {
    ring: "border-violet-200/75",
    badge: STORYBOOK_CARD_RARITY_BADGE_CLASS.epic,
    glow: "from-violet-100/40 via-transparent to-transparent",
  },
  legendary: {
    ring: "border-amber-200/80",
    badge: STORYBOOK_CARD_RARITY_BADGE_CLASS.legendary,
    glow: "from-amber-100/45 via-transparent to-transparent",
  },
}

export function getCardStatBadgeClass(variant: CardDesignVariant = "classic") {
  return variant === "storybook" ? STORYBOOK_CARD_STAT_BADGE_CLASS : CLASSIC_CARD_STAT_BADGE_CLASS
}

export function getCardRarityBadgeClass(variant: CardDesignVariant = "classic") {
  return variant === "storybook" ? STORYBOOK_CARD_RARITY_BADGE_CLASS : CLASSIC_CARD_RARITY_BADGE_CLASS
}

export function getCardRarityTheme(rarity: MewCard["rarity"], variant: CardDesignVariant = "classic") {
  return variant === "storybook" ? STORYBOOK_RARITY_THEME[rarity] : CLASSIC_RARITY_THEME[rarity]
}

export const CARD_STAT_BADGE_CLASS = CLASSIC_CARD_STAT_BADGE_CLASS
export const CARD_RARITY_BADGE_CLASS = CLASSIC_CARD_RARITY_BADGE_CLASS