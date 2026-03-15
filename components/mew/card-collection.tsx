"use client"

import type { MewCard, UserCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { Button } from "@/components/ui/button"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { useMewI18n } from "@/lib/mew-i18n"

interface CardCollectionProps {
  cards: MewCard[]
  userCards: UserCard[]
  onSellCard: (card: MewCard) => Promise<void>
  sellingCardId: string | null
  getSellPrice: (card: MewCard) => number
}

export function CardCollection({ cards, userCards, onSellCard, sellingCardId, getSellPrice }: CardCollectionProps) {
  const { t } = useMewI18n()
  const qtyByCard = new Map(userCards.map((c) => [c.cardId, c.quantity]))

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t.collectionTitle}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-items-center">
        {cards.map((card) => (
          <div key={card.id} className="w-full max-w-[210px] space-y-1.5">
            <MewCardFace
              card={card}
              owned={qtyByCard.get(card.id) ?? 0}
              compact
              className="max-w-[210px]"
            />
            <Button
              size="sm"
              variant="secondary"
              className="w-full text-xs justify-between"
              disabled={(qtyByCard.get(card.id) ?? 0) <= 1 || sellingCardId === card.id}
              onClick={() => onSellCard(card)}
            >
              <span>{sellingCardId === card.id ? t.selling : t.sellDuplicate}</span>
              <CoinPawBadge amount={getSellPrice(card)} compact />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
