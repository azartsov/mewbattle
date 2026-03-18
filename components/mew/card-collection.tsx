"use client"

import { useMemo } from "react"
import type { MewCard, UserCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { Button } from "@/components/ui/button"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { useMewI18n } from "@/lib/mew-i18n"

interface CardCollectionProps {
  cards: MewCard[]
  userCards: UserCard[]
  totalCardsValue: number
  recentlyAddedCardCounts?: Map<string, number>
  onSellCard: (card: MewCard) => Promise<void>
  sellingCardId: string | null
  getSellPrice: (card: MewCard) => number
}

export function CardCollection({
  cards,
  userCards,
  totalCardsValue,
  recentlyAddedCardCounts,
  onSellCard,
  sellingCardId,
  getSellPrice,
}: CardCollectionProps) {
  const { t } = useMewI18n()
  const qtyByCard = useMemo(() => new Map(userCards.map((c) => [c.cardId, c.quantity])), [userCards])
  const orderedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const aMissing = (qtyByCard.get(a.id) ?? 0) === 0
      const bMissing = (qtyByCard.get(b.id) ?? 0) === 0
      if (aMissing === bMissing) return 0
      return aMissing ? 1 : -1
    })
  }, [cards, qtyByCard])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{t.collectionTitle}</h2>
        <CoinPawBadge amount={totalCardsValue} compact className="border-sky-500/30 bg-sky-500/10 text-sky-100" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-items-center">
        {orderedCards.map((card) => {
          const qty = qtyByCard.get(card.id) ?? 0
          const recentlyAdded = recentlyAddedCardCounts?.get(card.id) ?? 0
          return (
            <div key={card.id} className={`w-full max-w-[210px] space-y-1.5 transition-all duration-200 ${qty === 0 ? "grayscale opacity-50" : ""}`}>
              {recentlyAdded > 0 && (
                <div className="inline-flex rounded-full border border-emerald-400/50 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                  +{recentlyAdded}
                </div>
              )}
              <MewCardFace
                card={card}
                owned={qty}
                compact
                className="max-w-[210px]"
              />
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs justify-between"
                disabled={qty <= 1 || sellingCardId === card.id}
                onClick={() => onSellCard(card)}
              >
                <span>{sellingCardId === card.id ? t.selling : t.sellDuplicate}</span>
                <CoinPawBadge amount={getSellPrice(card)} compact />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
