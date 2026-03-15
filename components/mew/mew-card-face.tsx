"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { MewCard } from "@/lib/mew-types"

interface MewCardFaceProps {
  card: MewCard
  owned?: number
  compact?: boolean
  className?: string
}

const RARITY_THEME: Record<MewCard["rarity"], {
  ring: string
  badge: string
  glow: string
}> = {
  common: {
    ring: "border-zinc-700/80",
    badge: "bg-zinc-700/70 text-zinc-100",
    glow: "from-zinc-400/15 via-transparent to-transparent",
  },
  rare: {
    ring: "border-sky-500/50",
    badge: "bg-sky-500/25 text-sky-100",
    glow: "from-sky-400/25 via-transparent to-transparent",
  },
  epic: {
    ring: "border-fuchsia-500/50",
    badge: "bg-fuchsia-500/25 text-fuchsia-100",
    glow: "from-fuchsia-400/25 via-transparent to-transparent",
  },
  legendary: {
    ring: "border-amber-500/60",
    badge: "bg-amber-500/30 text-amber-50",
    glow: "from-amber-300/35 via-transparent to-transparent",
  },
}

export function MewCardFace({ card, owned, compact = false, className }: MewCardFaceProps) {
  const theme = RARITY_THEME[card.rarity]

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/95 shadow-[0_8px_24px_rgba(2,6,23,0.35)]",
        "transition-transform duration-200 hover:-translate-y-0.5",
        theme.ring,
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", theme.glow)} />

      <div className="relative border-b border-black/20">
        <Image
          src={card.imageUrl}
          alt={card.name}
          width={320}
          height={180}
          className="w-full aspect-[16/9] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
            theme.badge,
          )}
        >
          {card.rarity}
        </span>
      </div>

      <div className={cn("space-y-2 p-3", compact && "space-y-1.5 p-2.5")}>
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}>{card.name}</h4>
          {typeof owned === "number" && (
            <span className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
              x{owned}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="rounded-md bg-rose-500/15 px-2 py-1 text-rose-200">ATK {card.attack}</span>
          <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-200">HP {card.health}</span>
        </div>

        {!compact && <p className="line-clamp-2 text-xs text-muted-foreground">{card.ability}</p>}
      </div>
    </article>
  )
}
