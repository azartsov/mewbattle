"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { MewCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { useMewI18n } from "@/lib/mew-i18n"
import type { BoosterOffer, BoosterOpenResult } from "@/lib/mew-firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BoosterShopProps {
  offers: BoosterOffer[]
  onOpen: (offerId: BoosterOffer["id"]) => Promise<BoosterOpenResult>
}

const RARITY_LABEL: Array<"common" | "rare" | "epic" | "legendary"> = ["common", "rare", "epic", "legendary"]

export function BoosterShop({ offers, onOpen }: BoosterShopProps) {
  const { t } = useMewI18n()
  const [selectedOfferId, setSelectedOfferId] = useState<BoosterOffer["id"]>(offers[1]?.id ?? offers[0]?.id ?? "starter")
  const [lastOpenedOfferId, setLastOpenedOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [opening, setOpening] = useState(false)
  const [openingOfferId, setOpeningOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [cards, setCards] = useState<MewCard[]>([])
  const [unlockedDeckSlot, setUnlockedDeckSlot] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)

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
      const result = await onOpen(offerId)
      setCards(result.cards)
      setUnlockedDeckSlot(result.unlockedDeckSlot)
      setLastOpenedOfferId(offerId)
      setShowResultModal(true)
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

      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t.latestDrop}
              {lastOpenedOffer ? ` - ${lastOpenedOffer.title}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {unlockedDeckSlot ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center">
                <Image
                  src="/ui/sakura-bloom.svg"
                  alt="Deck slot unlocked"
                  width={240}
                  height={160}
                  className="mx-auto h-auto w-full max-w-[240px]"
                />
                <p className="mt-2 text-sm font-medium text-emerald-100">Поздравляем! Открылся 4-й слот колоды.</p>
              </div>
            ) : cards.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 justify-items-center">
                {cards.map((card, idx) => (
                  <MewCardFace
                    key={`${card.id}-${idx}`}
                    card={card}
                    compact
                    className="max-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-300"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-card/60 p-3 text-center">
                <Image
                  src="/ui/sakura-dry.svg"
                  alt="No cards"
                  width={240}
                  height={160}
                  className="mx-auto h-auto w-full max-w-[240px]"
                />
                <p className="mt-2 text-sm text-muted-foreground">В этом бустере карты не выпали.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
