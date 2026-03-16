"use client"

import { Card } from "@/components/ui/card"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { useMewI18n } from "@/lib/mew-i18n"
import type { MewCard } from "@/lib/mew-types"

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
        <div className="grid gap-3 md:grid-cols-[190px_1fr] items-start">
          <MewCardFace card={LEGEND_SAMPLE_CARD} owned={1} compact className="max-w-[190px]" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-semibold text-foreground">ATK</span> - {t.helpStatAtk}</p>
            <p><span className="font-semibold text-foreground">HP</span> - {t.helpStatHp}</p>
            <p><span className="font-semibold text-foreground">x1</span> - {t.helpStatOwned}</p>
            <p><span className="font-semibold text-foreground">EPIC</span> - {t.helpStatRarity}</p>
            <p><span className="font-semibold text-foreground">Affinity</span> - {t.paramAffinityDesc}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
