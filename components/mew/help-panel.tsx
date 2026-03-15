"use client"

import { Card } from "@/components/ui/card"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { useMewI18n } from "@/lib/mew-i18n"

const LEGEND_SAMPLE_CARD = {
  id: "help_sample_epic",
  name: "Arcane Cat",
  attack: 18,
  health: 42,
  rarity: "epic",
  imageUrl: "/cards/cat_mage.svg",
  ability: "Arcane shield",
} as const

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
        <h3 className="font-semibold">Economy</h3>
        <p className="text-sm text-muted-foreground">{t.helpEconomy}</p>
      </Card>
      <Card className="p-4 space-y-2 bg-card/90 border-border">
        <h3 className="font-semibold">Battle Controls</h3>
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
          </div>
        </div>
      </Card>
    </div>
  )
}
