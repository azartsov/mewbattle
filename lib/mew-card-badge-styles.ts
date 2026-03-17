import type { MewCard } from "@/lib/mew-types"

export const CARD_STAT_BADGE_CLASS = {
  attack: "rounded-md border border-rose-300/30 bg-[#4a1624] px-2 py-1 font-medium text-[#ffd6df]",
  health: "rounded-md border border-emerald-300/30 bg-[#11372a] px-2 py-1 font-medium text-[#d7ffea]",
  ability: "rounded border border-sky-300/35 bg-[#102f4d] px-2 py-0.5 text-[#d9efff]",
  abilityCompact: "inline-flex max-w-full items-center rounded-md border border-sky-300/35 bg-[#102f4d] px-2 py-1 text-[10px] font-medium text-[#d9efff]",
  owned: "rounded-md border border-slate-300/24 bg-[#243244] px-2 py-1 text-[11px] font-medium text-[#edf4ff]",
  attackCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-rose-300/30 bg-[#4a1624] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#ffd6df]",
  healthCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-emerald-300/30 bg-[#11372a] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#d7ffea]",
  ownedCompact: "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-slate-300/24 bg-[#243244] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#edf4ff]",
} as const

export const CARD_RARITY_BADGE_CLASS: Record<MewCard["rarity"], string> = {
  common: "bg-[#3f454f] text-[#f4f7fb]",
  rare: "bg-[#124a75] text-[#ebf8ff]",
  epic: "bg-[#5a216d] text-[#fdefff]",
  legendary: "bg-[#7a4a0d] text-[#fff6d6]",
}