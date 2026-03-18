"use client"

import { useState } from "react"
import Image from "next/image"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MewCard } from "@/lib/mew-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_TYPE_ICON, getBossAffinityChipLabel, getBossTypeTheme } from "@/lib/mew-bosses"
import { CARD_META_RU, CARD_META_JA, getCardAbilityBadgeLabel } from "@/lib/mew-card-meta"
import { getCardSellPrice } from "@/lib/mew-firestore"
import { getCardMonogramClass, getCardVisualTheme } from "@/lib/mew-card-visuals"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { getCardRarityTheme, getCardStatBadgeClass } from "@/lib/mew-card-badge-styles"
import { useCardDesign } from "@/lib/mew-card-design"

interface MewCardFaceProps {
  card: MewCard
  owned?: number
  compact?: boolean
  previewCompact?: boolean
  className?: string
}

export function MewCardFace({ card, owned, compact = false, previewCompact = false, className }: MewCardFaceProps) {
  const { t, language } = useMewI18n()
  const { variant } = useCardDesign()
  const theme = getCardRarityTheme(card.rarity, variant)
  const badgeStyles = getCardStatBadgeClass(variant)
  const bossTypeTheme = getBossTypeTheme(variant)
  const affinities = card.bossAffinities ?? []
  const metaRu = language === "ru" ? (CARD_META_RU[card.id] ?? null) : null
  const displayName = metaRu?.name ?? card.name
  const displayLore = metaRu?.lore ?? card.lore ?? card.ability
  const displayAbility = metaRu?.ability ?? card.ability
  const badgeAbility = getCardAbilityBadgeLabel(card.id, language, displayAbility)
  const [imgSrc, setImgSrc] = useState(card.imageUrl)
  const sellPrice = getCardSellPrice(card)
  const visualTheme = getCardVisualTheme(card.id, variant)
  const monogramClass = getCardMonogramClass(card.id, variant)
  const compactLayout = compact || previewCompact

  const bossTypeLabel = (bossType: "raven" | "dog" | "rat") => {
    if (bossType === "raven") return t.bossRaven
    if (bossType === "dog") return t.bossDog
    return t.bossRat
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-transform duration-200 hover:-translate-y-0.5",
        variant === "storybook"
          ? "bg-[#fffaf2]/92 shadow-[0_12px_28px_rgba(110,89,62,0.18)]"
          : "bg-card/95 shadow-[0_8px_24px_rgba(2,6,23,0.35)]",
        theme.ring,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-95" style={{ backgroundImage: visualTheme.frameBackground }} />
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", theme.glow)} />

      <div className="relative border-b border-black/20">
        <div className="absolute inset-0" style={{ backgroundImage: visualTheme.artBackground }} />
        <div className={cn(
          "relative overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2),_transparent_62%)]",
          previewCompact ? "aspect-[5/3]" : "aspect-[5/4]",
        )}>
          <Image
            src={imgSrc}
            alt={card.name}
            width={320}
            height={256}
            className={cn(
              "h-full w-full scale-[1.08] object-contain object-center drop-shadow-[0_10px_22px_rgba(0,0,0,0.28)]",
              variant === "storybook" && "brightness-[1.04] contrast-[0.84] saturate-[0.8] sepia-[0.14]",
            )}
            sizes="(max-width: 768px) 50vw, 18rem"
            onError={() => setImgSrc(`/cards/${card.id}.svg`)}
          />
          {variant === "storybook" && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,_rgba(255,249,240,0.34),_transparent_34%),linear-gradient(180deg,rgba(255,245,233,0.12),rgba(243,226,205,0.26))]" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-black/6 to-transparent" />
        <span
          className={cn(
            previewCompact ? "absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]" : "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
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
              className={cn(
                "absolute inline-flex items-center justify-center rounded-full border border-white/25 bg-black/45 text-slate-100 transition-colors hover:bg-black/65",
                previewCompact ? "left-1.5 top-1.5 h-5 w-5" : "left-2 top-2 h-6 w-6",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <Info className={previewCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
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
                  <div className="w-fit"><span className={badgeStyles.attack}>ATK {card.attack}</span></div>
                  <span className="text-foreground/85">{t.paramAttackDesc}</span>

                  <div className="w-fit"><span className={badgeStyles.health}>HP {card.health}</span></div>
                  <span className="text-foreground/85">{t.paramHealthDesc}</span>

                  <div className="w-fit"><span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]", theme.badge)}>{card.rarity}</span></div>
                  <span className="text-foreground/85">{t.paramRarityDesc}</span>

                  <div className="w-fit"><span className={badgeStyles.ability}>{displayAbility}</span></div>
                  <span className="text-foreground/85">{t.paramAbilityDesc}</span>

                  {affinities.length > 0 ? (
                    <>
                      <div className="w-fit flex flex-wrap gap-1">
                        {affinities.map((affinity) => (
                          <span
                            key={`dlg-${card.id}-${affinity.bossType}`}
                            className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]", bossTypeTheme[affinity.bossType].chipClass)}
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

      <div className={cn(
        "relative space-y-2 p-3",
        compact && "space-y-1.5 p-2.5",
        previewCompact && "space-y-1 p-1.5",
      )} style={{ backgroundImage: visualTheme.bodyBackground }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            {!previewCompact && CARD_META_JA[card.id] && (
              <p className={cn("text-[9px] font-light tracking-[0.18em] leading-none mb-0.5", monogramClass)}>{CARD_META_JA[card.id]}</p>
            )}
            <h4 className={cn(
              "font-semibold leading-tight",
              previewCompact ? "text-[11px]" : compactLayout ? "text-sm" : "text-base",
              variant === "storybook" ? "text-[#443429] drop-shadow-[0_1px_0_rgba(255,255,255,0.38)]" : "text-foreground",
            )}>{displayName}</h4>
          </div>
          {typeof owned === "number" && (
            <span className={cn(badgeStyles.ownedCompact, previewCompact && "px-1.5 py-0.5 text-[9px]")}>
              x{owned}
            </span>
          )}
        </div>

        <div className={cn("flex flex-nowrap items-center overflow-hidden font-medium", previewCompact ? "gap-0.5 text-[8px]" : "gap-1.5 text-[10px]")}>
          <span className={cn(badgeStyles.attackCompact, previewCompact && "min-w-0 flex-1 justify-center px-1 py-0.5 text-[8px] tracking-tight")}>{previewCompact ? `A${card.attack}` : `ATK ${card.attack}`}</span>
          <span className={cn(badgeStyles.healthCompact, previewCompact && "min-w-0 flex-1 justify-center px-1 py-0.5 text-[8px] tracking-tight")}>{previewCompact ? `HP${card.health}` : `HP ${card.health}`}</span>
        </div>

        <div className={cn("flex flex-wrap items-center", previewCompact ? "min-h-[16px] gap-1" : "min-h-[22px] gap-1.5")}>
          {affinities.length === 0 && (
            <span className={cn("invisible inline-flex items-center rounded-md border", previewCompact ? "gap-0.5 px-1 py-0.5 text-[9px]" : "gap-1 px-1.5 py-0.5 text-[10px]")}>Lv0</span>
          )}
          {affinities.map((affinity) => (
            <span
              key={`${card.id}-${affinity.bossType}-chip`}
              className={cn(
                "inline-flex items-center rounded-md border font-semibold tracking-[0.08em]",
                previewCompact ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[10px]",
                bossTypeTheme[affinity.bossType].chipClass,
              )}
            >
              {getBossAffinityChipLabel(affinity.bossType, language)}Lv{affinity.level}
            </span>
          ))}
        </div>

        <div className={previewCompact ? "min-h-[16px]" : "min-h-[22px]"}>
          <span className={cn(badgeStyles.abilityCompact, compactLayout ? "text-[9px] px-1.5 py-0.5" : "", previewCompact && "text-[8px] px-1 py-0.5") }>
            <span className="truncate">{badgeAbility}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
