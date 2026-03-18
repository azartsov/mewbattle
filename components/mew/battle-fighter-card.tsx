"use client"

import { useState } from "react"
import Image from "next/image"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FighterCard } from "@/lib/mew-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_TYPE_ICON, getBossAffinityChipLabel, getBossTypeTheme } from "@/lib/mew-bosses"
import { CARD_META_RU, CARD_META_JA, getCardAbilityBadgeLabel } from "@/lib/mew-card-meta"
import { getCardMonogramClass, getCardVisualTheme } from "@/lib/mew-card-visuals"
import { getCardStatBadgeClass } from "@/lib/mew-card-badge-styles"
import { useCardDesign } from "@/lib/mew-card-design"

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
  const { variant } = useCardDesign()
  const badgeStyles = getCardStatBadgeClass(variant)
  const bossTypeTheme = getBossTypeTheme(variant)
  const hpPct = Math.max(0, Math.min(100, Math.round((fighter.currentHealth / fighter.health) * 100)))
  const baseId = fighter.id.split("__")[0]
  const metaRu = language === "ru" ? (CARD_META_RU[baseId] ?? null) : null
  const displayName = metaRu?.name ?? fighter.name
  const displayLore = metaRu?.lore ?? fighter.lore ?? fighter.ability
  const displayAbility = metaRu?.ability ?? fighter.ability
  const badgeAbility = getCardAbilityBadgeLabel(baseId, language, displayAbility)
  const fallbackSrc = role === "boss" ? "/bosses/evil_raven.svg" : "/cards/cat_knight.svg"
  const [imgSrc, setImgSrc] = useState(fighter.imageUrl || fallbackSrc)
  const visualTheme = getCardVisualTheme(baseId, variant)
  const monogramClass = getCardMonogramClass(baseId, variant)

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
        "relative w-[126px] sm:w-[138px] overflow-hidden rounded-xl border transition-all",
        variant === "storybook"
          ? "bg-[#fffaf2]/92 shadow-[0_12px_24px_rgba(110,89,62,0.18)]"
          : "bg-card/95 shadow-[0_8px_22px_rgba(2,6,23,0.35)]",
        isDead ? "opacity-45 grayscale" : "hover:-translate-y-0.5",
        role === "boss" ? "border-rose-500/50" : "border-sky-500/35",
        draggable && !isDead && "cursor-grab active:cursor-grabbing",
        droppable && !isDead && "ring-1 ring-dashed ring-primary/45",
        highlighted && "ring-2 ring-primary/70",
        !isDead && onTap && "cursor-pointer",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-95" style={{ backgroundImage: visualTheme.frameBackground }} />
      <div className="relative">
        <div className="absolute inset-0" style={{ backgroundImage: visualTheme.artBackground }} />
        <div className="relative h-[74px] overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_62%)] sm:h-[80px]">
          <Image
            src={imgSrc}
            alt={fighter.name}
            width={320}
            height={208}
            className={cn(
              "h-full w-full scale-[1.08] object-contain object-center drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]",
              variant === "storybook" && "brightness-[1.04] contrast-[0.84] saturate-[0.8] sepia-[0.14]",
            )}
            sizes="(max-width: 768px) 40vw, 10rem"
            onError={() => setImgSrc(fallbackSrc)}
          />
          {variant === "storybook" && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,_rgba(255,249,240,0.32),_transparent_34%),linear-gradient(180deg,rgba(255,245,233,0.1),rgba(243,226,205,0.24))]" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/54 via-black/8 to-transparent" />
        <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-slate-100">
          {role === "boss" ? "BOSS" : "ALLY"}
        </span>
        {role === "boss" && fighter.bossType && (
          <span
            className={cn(
              "absolute left-2 bottom-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
              bossTypeTheme[fighter.bossType].badgeClass,
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
              <div>
                {CARD_META_JA[baseId] && (
                  <p className="text-xs font-light tracking-[0.18em] text-muted-foreground/60 leading-none mb-1">{CARD_META_JA[baseId]}</p>
                )}
                <DialogTitle>{displayName}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.characterLore}</p>
                <p className="mt-1 text-sm text-foreground/90">{displayLore}</p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{t.paramList}</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center text-xs">
                  <div className="w-fit"><span className={badgeStyles.attack}>ATK {fighter.attack}</span></div>
                  <span className="text-foreground/85">{t.paramAttackDesc}</span>

                  <div className="w-fit"><span className={badgeStyles.health}>HP {fighter.currentHealth}/{fighter.health}</span></div>
                  <span className="text-foreground/85">{t.paramHealthDesc}</span>

                  <div className="w-fit"><span className={badgeStyles.ability}>{displayAbility}</span></div>
                  <span className="text-foreground/85">{t.paramAbilityDesc}</span>

                  {fighter.bossType && (
                    <>
                      <div className="w-fit"><span className="rounded bg-rose-500/15 border border-rose-400/30 px-2 py-0.5 font-medium text-rose-200">{bossTypeLabel(fighter.bossType)}</span></div>
                      <span className="text-foreground/85">{t.bossType}</span>
                    </>
                  )}

                  {fighter.bossAffinities && fighter.bossAffinities.length > 0 && (
                    <>
                      <div className="w-fit flex flex-wrap gap-1">
                        {fighter.bossAffinities.map((affinity) => (
                          <span
                            key={`${fighter.id}-${affinity.bossType}`}
                            className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]", bossTypeTheme[affinity.bossType].chipClass)}
                          >
                            <Image src={BOSS_TYPE_ICON[affinity.bossType]} alt={bossTypeLabel(affinity.bossType)} width={12} height={12} className="rounded-sm" />
                            {bossTypeLabel(affinity.bossType)} Lv{affinity.level}
                          </span>
                        ))}
                      </div>
                      <span className="text-foreground/85">{t.paramAffinityDesc}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative space-y-1 p-1.5 sm:p-2" style={{ backgroundImage: visualTheme.bodyBackground }}>
        {CARD_META_JA[baseId] && (
          <p className={cn("text-[8px] font-light tracking-[0.15em] leading-none mb-0.5", monogramClass)}>{CARD_META_JA[baseId]}</p>
        )}
        <div className={cn(
          "truncate text-[11px] font-semibold sm:text-xs",
          variant === "storybook" ? "text-[#443429] drop-shadow-[0_1px_0_rgba(255,255,255,0.38)]" : "text-foreground",
        )}>{displayName}</div>

        <div className="flex flex-nowrap items-center gap-1 overflow-hidden text-[8px] font-medium sm:text-[9px]">
          <span className={badgeStyles.attackCompact}>ATK {fighter.attack}</span>
          <span className={badgeStyles.healthCompact}>HP {fighter.currentHealth}</span>
        </div>

        <div className="min-h-[18px] sm:min-h-[20px]">
          <span className={cn(badgeStyles.abilityCompact, "px-1 py-0.5 text-[8px] sm:px-1.5 sm:text-[9px]")}>
            <span className="truncate">{badgeAbility}</span>
          </span>
        </div>

        {role === "ally" && (
          <div className="flex min-h-[16px] flex-wrap items-start gap-0.5 sm:min-h-[18px]">
            {fighter.bossAffinities && fighter.bossAffinities.length > 0 ? (
              fighter.bossAffinities.map((affinity) => (
                <span
                  key={`${fighter.id}-${affinity.bossType}`}
                  className={cn("inline-flex items-center rounded border px-1 py-0.5 text-[8px] font-semibold tracking-[0.08em] sm:text-[9px]", bossTypeTheme[affinity.bossType].chipClass)}
                >
                  {getBossAffinityChipLabel(affinity.bossType, language)}Lv{affinity.level}
                </span>
              ))
            ) : (
              <span className="invisible inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[8px] sm:text-[9px]">Lv0</span>
            )}
          </div>
        )}

        <div className="h-1 w-full overflow-hidden rounded bg-slate-800/70 sm:h-1.5">
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
