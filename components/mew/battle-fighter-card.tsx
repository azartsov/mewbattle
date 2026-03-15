"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { FighterCard } from "@/lib/mew-types"

interface BattleFighterCardProps {
  fighter: FighterCard
  role: "ally" | "boss"
  isDead: boolean
  draggable?: boolean
  droppable?: boolean
  highlighted?: boolean
  onDragStart?: () => void
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop?: () => void
  onTap?: () => void
  className?: string
}

export function BattleFighterCard({
  fighter,
  role,
  isDead,
  draggable,
  droppable,
  highlighted,
  onDragStart,
  onDragOver,
  onDrop,
  onTap,
  className,
}: BattleFighterCardProps) {
  const hpPct = Math.max(0, Math.min(100, Math.round((fighter.currentHealth / fighter.health) * 100)))

  return (
    <div
      draggable={draggable && !isDead}
      onDragStart={() => onDragStart?.()}
      onDragOver={(event) => {
        if (droppable && !isDead) {
          event.preventDefault()
          onDragOver?.(event)
        }
      }}
      onDrop={() => {
        if (droppable && !isDead) onDrop?.()
      }}
      onClick={() => {
        if (!isDead) onTap?.()
      }}
      className={cn(
        "relative w-[140px] sm:w-[152px] overflow-hidden rounded-xl border bg-card/95",
        "shadow-[0_8px_22px_rgba(2,6,23,0.35)] transition-all",
        isDead ? "opacity-45 grayscale" : "hover:-translate-y-0.5",
        role === "boss" ? "border-rose-500/50" : "border-sky-500/35",
        draggable && !isDead && "cursor-grab active:cursor-grabbing",
        droppable && !isDead && "ring-1 ring-dashed ring-primary/45",
        highlighted && "ring-2 ring-primary/70",
        !isDead && onTap && "cursor-pointer",
        className,
      )}
    >
      <div className="relative">
        <Image
          src={fighter.imageUrl || (role === "boss" ? "/bosses/evil_raven.svg" : "/cards/cat_knight.svg")}
          alt={fighter.name}
          width={320}
          height={180}
          className="h-[78px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-slate-100">
          {role === "boss" ? "BOSS" : "ALLY"}
        </span>
      </div>

      <div className="space-y-1.5 p-2">
        <div className="truncate text-xs font-semibold">{fighter.name}</div>

        <div className="flex items-center gap-1.5 text-[10px] font-medium">
          <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-200">ATK {fighter.attack}</span>
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-200">HP {fighter.currentHealth}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded bg-slate-800/70">
          <div
            className={cn(
              "h-full transition-all",
              hpPct > 60 ? "bg-emerald-400" : hpPct > 30 ? "bg-amber-400" : "bg-rose-400",
            )}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
