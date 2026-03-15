"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { MewCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { useMewI18n } from "@/lib/mew-i18n"
import type { BoosterOffer } from "@/lib/mew-firestore"

interface BoosterShopProps {
  offers: BoosterOffer[]
  onOpen: (offerId: BoosterOffer["id"]) => Promise<MewCard[]>
}

const RARITY_LABEL: Array<"common" | "rare" | "epic" | "legendary"> = ["common", "rare", "epic", "legendary"]

export function BoosterShop({ offers, onOpen }: BoosterShopProps) {
  const { t } = useMewI18n()
  const [selectedOfferId, setSelectedOfferId] = useState<BoosterOffer["id"]>(offers[1]?.id ?? offers[0]?.id ?? "starter")
  const [lastOpenedOfferId, setLastOpenedOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [opening, setOpening] = useState(false)
  const [openingOfferId, setOpeningOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [cards, setCards] = useState<MewCard[]>([])

  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? offers[0]
  const lastOpenedOffer = offers.find((offer) => offer.id === lastOpenedOfferId)
  const rarityLabels: Record<(typeof RARITY_LABEL)[number], string> = {
    common: t.rarityCommon,
    rare: t.rarityRare,
    epic: t.rarityEpic,
    legendary: t.rarityLegendary,
  }

  const open = async (offerId: BoosterOffer["id"]) => {
    setOpening(true)
    setOpeningOfferId(offerId)
    try {
      const pulled = await onOpen(offerId)
      setCards(pulled)
      setLastOpenedOfferId(offerId)
    } finally {
      setOpening(false)
      setOpeningOfferId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t.boosters}</h2>
        {selectedOffer && <CoinPawBadge amount={selectedOffer.cost} compact />}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {offers.map((offer) => {
          const selected = offer.id === selectedOfferId
          return (
            <article
              key={offer.id}
              className={`rounded-2xl border p-3 transition-all ${selected ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(59,130,246,0.24)]" : "border-border bg-card/70"}`}
            >
              <button type="button" className="w-full text-left space-y-1" onClick={() => setSelectedOfferId(offer.id)}>
                <h3 className="font-semibold text-sm">{offer.title}</h3>
                <p className="text-xs text-muted-foreground min-h-8">{offer.subtitle}</p>
              </button>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.boosterCostWarning}</span>
                <CoinPawBadge amount={offer.cost} compact />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                {RARITY_LABEL.map((rarity) => (
                  <span key={`${offer.id}-${rarity}`} className="rounded-md border border-border bg-secondary/25 px-1.5 py-1">
                    {rarityLabels[rarity]}: {Math.round(offer.rarityWeights[rarity] * 100)}%
                  </span>
                ))}
              </div>
              <Button
                className="mt-2 w-full"
                onClick={() => open(offer.id)}
                disabled={opening}
                variant={selected ? "default" : "secondary"}
              >
                {opening && openingOfferId === offer.id ? t.openingBooster : t.openBooster}
              </Button>
            </article>
          )
        })}
      </div>

      {cards.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t.latestDrop}{lastOpenedOffer ? ` - ${lastOpenedOffer.title}` : ""}</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-items-center">
            {cards.map((card, idx) => (
              <MewCardFace
                key={`${card.id}-${idx}`}
                card={card}
                compact
                className="max-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-300"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
