"use client"

import { useState } from "react"
import Image from "next/image"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MewCard } from "@/lib/mew-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_TYPE_ICON, BOSS_TYPE_THEME } from "@/lib/mew-bosses"
import { CARD_META_RU, CARD_META_JA } from "@/lib/mew-card-meta"
import { getCardSellPrice } from "@/lib/mew-firestore"
import { getCardVisualTheme } from "@/lib/mew-card-visuals"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"

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
  const { t, language } = useMewI18n()
  const theme = RARITY_THEME[card.rarity]
  const affinities = card.bossAffinities ?? []
  const metaRu = language === "ru" ? (CARD_META_RU[card.id] ?? null) : null
  const displayName = metaRu?.name ?? card.name
  const displayLore = metaRu?.lore ?? card.lore ?? card.ability
  const displayAbility = metaRu?.ability ?? card.ability
  const [imgSrc, setImgSrc] = useState(card.imageUrl)
  const sellPrice = getCardSellPrice(card)
  const visualTheme = getCardVisualTheme(card.id)

  const bossTypeLabel = (bossType: "raven" | "dog" | "rat") => {
    if (bossType === "raven") return t.bossRaven
    if (bossType === "dog") return t.bossDog
    return t.bossRat
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/95 shadow-[0_8px_24px_rgba(2,6,23,0.35)]",
        "transition-transform duration-200 hover:-translate-y-0.5",
        theme.ring,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-95" style={{ backgroundImage: visualTheme.frameBackground }} />
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", theme.glow)} />

      <div className="relative border-b border-black/20">
        <div className="absolute inset-0" style={{ backgroundImage: visualTheme.artBackground }} />
        <Image
          src={imgSrc}
          alt={card.name}
          width={320}
          height={180}
          className="w-full aspect-[16/9] object-cover"
          onError={() => setImgSrc(`/cards/${card.id}.svg`)}
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
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={t.details}
              title={t.details}
              className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/25 bg-black/45 text-slate-100 transition-colors hover:bg-black/65"
              onClick={(event) => event.stopPropagation()}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div>
                {CARD_META_JA[card.id] && (
                  <p className="text-xs font-light tracking-[0.18em] text-muted-foreground/60 leading-none mb-1">{CARD_META_JA[card.id]}</p>
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
                  <div className="w-fit"><span className="rounded-md bg-rose-500/15 px-2 py-1 font-medium text-rose-200">ATK {card.attack}</span></div>
                  <span className="text-foreground/85">{t.paramAttackDesc}</span>

                  <div className="w-fit"><span className="rounded-md bg-emerald-500/15 px-2 py-1 font-medium text-emerald-200">HP {card.health}</span></div>
                  <span className="text-foreground/85">{t.paramHealthDesc}</span>

                  <div className="w-fit"><span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]", theme.badge)}>{card.rarity}</span></div>
                  <span className="text-foreground/85">{t.paramRarityDesc}</span>

                  <div className="w-fit"><span className="rounded border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-sky-200">{displayAbility}</span></div>
                  <span className="text-foreground/85">{t.paramAbilityDesc}</span>

                  {affinities.length > 0 ? (
                    <>
                      <div className="w-fit flex flex-wrap gap-1">
                        {affinities.map((affinity) => (
                          <span
                            key={`dlg-${card.id}-${affinity.bossType}`}
                            className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]", BOSS_TYPE_THEME[affinity.bossType].chipClass)}
                          >
                            <Image src={BOSS_TYPE_ICON[affinity.bossType]} alt={bossTypeLabel(affinity.bossType)} width={12} height={12} className="rounded-sm" />
                            {bossTypeLabel(affinity.bossType)} Lv{affinity.level}
                          </span>
                        ))}
                      </div>
                      <span className="text-foreground/85">{t.paramAffinityDesc}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-fit"><span className="text-muted-foreground">{t.noAffinity}</span></div>
                      <span className="text-foreground/85">{t.paramAffinityDesc}</span>
                    </>
                  )}

                  <div className="w-fit"><CoinPawBadge amount={sellPrice} compact /></div>
                  <span className="text-foreground/85">{t.paramSellPriceDesc}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className={cn("relative space-y-2 p-3", compact && "space-y-1.5 p-2.5")} style={{ backgroundImage: visualTheme.bodyBackground }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            {CARD_META_JA[card.id] && (
              <p className="text-[9px] font-light tracking-[0.18em] text-muted-foreground/55 leading-none mb-0.5">{CARD_META_JA[card.id]}</p>
            )}
            <h4 className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}>{displayName}</h4>
          </div>
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

        <div className="flex min-h-[22px] flex-wrap items-center gap-1.5">
          {affinities.length === 0 && (
            <span className="invisible inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]">Lv0</span>
          )}
          {affinities.map((affinity) => (
            <span
              key={`${card.id}-${affinity.bossType}-chip`}
              className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]", BOSS_TYPE_THEME[affinity.bossType].chipClass)}
            >
              <Image src={BOSS_TYPE_ICON[affinity.bossType]} alt={bossTypeLabel(affinity.bossType)} width={12} height={12} className="rounded-sm" />
              Lv{affinity.level}
            </span>
          ))}
        </div>

        {!compact && <p className="line-clamp-2 text-xs text-muted-foreground">{displayAbility}</p>}
      </div>
    </article>
  )
}
