"use client"

import { Card } from "@/components/ui/card"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { useMewI18n } from "@/lib/mew-i18n"
import type { MewCard } from "@/lib/mew-types"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { BOSS_TYPE_ICON, getBossTypeTheme } from "@/lib/mew-bosses"
import { getCardRarityBadgeClass, getCardStatBadgeClass } from "@/lib/mew-card-badge-styles"
import { useCardDesign } from "@/lib/mew-card-design"

const LEGEND_SAMPLE_CARD: MewCard = {
  id: "cat_mage",
  name: "Cat Mage",
  attack: 18,
  health: 38,
  rarity: "epic",
  imageUrl: "/cards/cat_mage.svg",
  ability: "Magic shield",
  lore: "Arcane scholar of warding arts, strongest against plague swarms.",
  bossAffinities: [
    { bossType: "rat", level: 2 },
    { bossType: "raven", level: 1 },
  ],
}

export function HelpPanel() {
  const { t } = useMewI18n()
  const { variant } = useCardDesign()
  const badgeStyles = getCardStatBadgeClass(variant)
  const rarityBadge = getCardRarityBadgeClass(variant)
  const bossTypeTheme = getBossTypeTheme(variant)

  const bossTypeLabel = (bossType: "raven" | "dog" | "rat") => {
    if (bossType === "raven") return t.bossRaven
    if (bossType === "dog") return t.bossDog
    return t.bossRat
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-card/90 border-border">
        <h2 className="text-lg font-semibold">{t.helpTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.helpIntro}</p>
        <div className="grid gap-2 text-sm">
          <p>{t.helpStep1}</p>
          <p>{t.helpStep2}</p>
          <p>{t.helpStep3}</p>
          <p>{t.helpStep4}</p>
        </div>
      </Card>
      <Card className="p-4 space-y-2 bg-card/90 border-border">
        <h3 className="font-semibold">{t.helpEconomyTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.helpEconomy}</p>
        <p className="text-sm text-muted-foreground">{t.helpRewardRules}</p>
      </Card>
      <Card className="p-4 space-y-2 bg-card/90 border-border">
        <h3 className="font-semibold">{t.helpBattleTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.helpBattle}</p>
      </Card>
      <Card className="p-4 space-y-3 bg-card/90 border-border">
        <h3 className="font-semibold">{t.helpCardLegendTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.helpCardLegendIntro}</p>
        <p className="text-sm text-muted-foreground">{t.helpCardLegendAbilities}</p>
        <p className="text-sm text-muted-foreground">{t.helpRarityOrder}</p>
        <div className="grid gap-3 md:grid-cols-[190px_1fr] items-start">
          <MewCardFace card={LEGEND_SAMPLE_CARD} owned={1} compact className="max-w-[190px]" />
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center text-xs">
            <div className="w-fit"><span className={badgeStyles.attack}>ATK {LEGEND_SAMPLE_CARD.attack}</span></div>
            <span className="text-foreground/85">{t.paramAttackDesc}</span>

            <div className="w-fit"><span className={badgeStyles.health}>HP {LEGEND_SAMPLE_CARD.health}</span></div>
            <span className="text-foreground/85">{t.paramHealthDesc}</span>

            <div className="w-fit"><span className={badgeStyles.owned}>x1</span></div>
            <span className="text-foreground/85">{t.helpStatOwned}</span>

            <div className="w-fit">
              <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]", rarityBadge[LEGEND_SAMPLE_CARD.rarity])}>
                {LEGEND_SAMPLE_CARD.rarity}
              </span>
            </div>
            <span className="text-foreground/85">{t.paramRarityDesc}</span>

            <div className="w-fit"><span className={badgeStyles.ability}>{LEGEND_SAMPLE_CARD.ability}</span></div>
            <span className="text-foreground/85">{t.paramAbilityDesc}</span>

            <div className="w-fit flex flex-wrap gap-1">
              {(LEGEND_SAMPLE_CARD.bossAffinities ?? []).map((affinity) => (
                <span
                  key={`help-legend-${affinity.bossType}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]",
                    bossTypeTheme[affinity.bossType].chipClass,
                  )}
                >
                  <Image
                    src={BOSS_TYPE_ICON[affinity.bossType]}
                    alt={bossTypeLabel(affinity.bossType)}
                    width={12}
                    height={12}
                    className="rounded-sm"
                  />
                  {bossTypeLabel(affinity.bossType)} Lv{affinity.level}
                </span>
              ))}
            </div>
            <span className="text-foreground/85">{t.paramAffinityDesc}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
