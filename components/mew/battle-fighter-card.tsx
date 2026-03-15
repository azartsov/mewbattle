"use client"

import Image from "next/image"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FighterCard } from "@/lib/mew-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_TYPE_ICON, BOSS_TYPE_THEME } from "@/lib/mew-bosses"
import { CARD_META_RU } from "@/lib/mew-card-meta"

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
  const { t, language } = useMewI18n()
  const hpPct = Math.max(0, Math.min(100, Math.round((fighter.currentHealth / fighter.health) * 100)))
  const baseId = fighter.id.split("__")[0]
  const metaRu = language === "ru" ? (CARD_META_RU[baseId] ?? null) : null
  const displayName = metaRu?.name ?? fighter.name
  const displayLore = metaRu?.lore ?? fighter.lore ?? fighter.ability
  const displayAbility = metaRu?.ability ?? fighter.ability

  const bossTypeLabel = (bossType: "raven" | "dog" | "rat") => {
    if (bossType === "raven") return t.bossRaven
    if (bossType === "dog") return t.bossDog
    return t.bossRat
  }

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
        {role === "boss" && fighter.bossType && (
          <span
            className={cn(
              "absolute left-2 bottom-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
              BOSS_TYPE_THEME[fighter.bossType].badgeClass,
            )}
          >
            {bossTypeLabel(fighter.bossType)}
          </span>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={t.details}
              title={t.details}
              className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/25 bg-black/45 text-slate-100 hover:bg-black/65"
              onClick={(event) => event.stopPropagation()}
            >
              <Info className="h-3 w-3" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" onClick={(event) => event.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>{displayName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.characterLore}</p>
                <p className="mt-1 text-sm text-foreground/90">{displayLore}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.paramList}</p>
                <ul className="mt-1 space-y-1 text-xs text-foreground/85">
                  <li>ATK {fighter.attack} - {t.paramAttackDesc}</li>
                  <li>HP {fighter.currentHealth}/{fighter.health} - {t.paramHealthDesc}</li>
                  <li>{displayAbility} - {t.paramAbilityDesc}</li>
                  {fighter.bossType && <li>{t.bossType}: {bossTypeLabel(fighter.bossType)}</li>}
                </ul>
              </div>
              {fighter.bossAffinities && fighter.bossAffinities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fighter.bossAffinities.map((affinity) => (
                    <span
                      key={`${fighter.id}-${affinity.bossType}`}
                      className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs", BOSS_TYPE_THEME[affinity.bossType].chipClass)}
                    >
                      <Image src={BOSS_TYPE_ICON[affinity.bossType]} alt={bossTypeLabel(affinity.bossType)} width={14} height={14} className="rounded-sm" />
                      {bossTypeLabel(affinity.bossType)} Lv{affinity.level}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1.5 p-2">
        <div className="truncate text-xs font-semibold">{displayName}</div>

        <div className="flex items-center gap-1.5 text-[10px] font-medium">
          <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-200">ATK {fighter.attack}</span>
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-200">HP {fighter.currentHealth}</span>
        </div>

        {role === "ally" && (
          <div className="flex min-h-[18px] flex-wrap items-start gap-0.5">
            {fighter.bossAffinities && fighter.bossAffinities.length > 0 ? (
              fighter.bossAffinities.map((affinity) => (
                <span
                  key={`${fighter.id}-${affinity.bossType}`}
                  className={cn("inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px]", BOSS_TYPE_THEME[affinity.bossType].chipClass)}
                >
                  <Image src={BOSS_TYPE_ICON[affinity.bossType]} alt={bossTypeLabel(affinity.bossType)} width={10} height={10} className="rounded-sm" />
                  Lv{affinity.level}
                </span>
              ))
            ) : (
              <span className="invisible inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px]">Lv0</span>
            )}
          </div>
        )}

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
