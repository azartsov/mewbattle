"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MewCard, UserCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { useMewI18n } from "@/lib/mew-i18n"
import type { DeckSlotKey } from "@/lib/mew-firestore"

interface DeckBuilderProps {
  cards: MewCard[]
  userCards: UserCard[]
  maxDeckSize: number
  deckButtons: Array<{ slot: DeckSlotKey; label: string }>
  selectedDeckSlot: DeckSlotKey
  initialDeckName: string
  initialDeckCardIds: string[]
  onSelectDeckSlot: (slot: DeckSlotKey) => void
  onSaveDeck: (name: string, cardIds: string[]) => Promise<void>
}

export function DeckBuilder({
  cards,
  userCards,
  maxDeckSize,
  deckButtons,
  selectedDeckSlot,
  initialDeckName,
  initialDeckCardIds,
  onSelectDeckSlot,
  onSaveDeck,
}: DeckBuilderProps) {
  const { t } = useMewI18n()
  const [deckName, setDeckName] = useState(initialDeckName)
  const [deck, setDeck] = useState<string[]>(initialDeckCardIds.slice(0, maxDeckSize))
  const [saving, setSaving] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  useEffect(() => {
    const ownedById = new Map(userCards.map((card) => [card.cardId, card.quantity]))
    const usedById = new Map<string, number>()
    const safeCards: string[] = []

    for (const cardId of initialDeckCardIds) {
      const ownedQty = ownedById.get(cardId) ?? 0
      if (ownedQty <= 0) continue
      const usedQty = usedById.get(cardId) ?? 0
      if (usedQty >= ownedQty) continue
      usedById.set(cardId, usedQty + 1)
      safeCards.push(cardId)
    }

    setDeckName(initialDeckName)
    setDeck(safeCards.slice(0, maxDeckSize))
    setSelectedCardId(null)
  }, [initialDeckCardIds, initialDeckName, maxDeckSize, userCards])

  const ownedCardsById = useMemo(() => new Map(userCards.map((c) => [c.cardId, c.quantity])), [userCards])
  const ownedCardIds = useMemo(() => new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId)), [userCards])
  const ownedCards = useMemo(() => cards.filter((c) => ownedCardIds.has(c.id)), [cards, ownedCardIds])

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    event.preventDefault()
    const cardId = event.dataTransfer.getData("text/plain")
    if (!cardId) return
    const maxQty = ownedCardsById.get(cardId) ?? 0
    setDeck((prev) => {
      const next = [...prev]
      const usedElsewhere = next.filter((id, i) => id === cardId && i !== slotIndex).length
      if (usedElsewhere >= maxQty) return prev
      next[slotIndex] = cardId
      return next.slice(0, maxDeckSize)
    })
  }

  const handleTapSlot = (slotIndex: number) => {
    if (!selectedCardId) return
    const cardId = selectedCardId
    const maxQty = ownedCardsById.get(cardId) ?? 0
    setDeck((prev) => {
      const next = [...prev]
      const usedElsewhere = next.filter((id, i) => id === cardId && i !== slotIndex).length
      if (usedElsewhere >= maxQty) return prev
      next[slotIndex] = cardId
      return next.slice(0, maxDeckSize)
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSaveDeck(deckName.trim() || "Main Deck", deck.filter(Boolean))
    } finally {
      setSaving(false)
    }
  }

  const deckCards = deck.map((id) => cards.find((c) => c.id === id) ?? null)

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4 items-start">
      <Card className="p-3 bg-card border-border">
        <h3 className="font-semibold mb-2">{t.deckCollectionHint}</h3>
        <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-auto pr-1">
          {ownedCards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
              onClick={() => setSelectedCardId(card.id)}
              className="cursor-grab active:cursor-grabbing"
            >
              <MewCardFace
                card={card}
                owned={ownedCardsById.get(card.id) ?? 0}
                compact
                className={selectedCardId === card.id ? "ring-2 ring-primary/70 max-w-[175px]" : "max-w-[175px]"}
              />
            </div>
          ))}
          {ownedCards.length === 0 && <p className="text-sm text-muted-foreground col-span-2">{t.noCardsYet}</p>}
        </div>
      </Card>

      <Card className="p-3 bg-card border-border">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{t.myDeck} (max {maxDeckSize})</h3>
          <Button size="sm" className="h-7 rounded-full px-3" onClick={handleSave} disabled={saving || deck.filter(Boolean).length === 0}>
            {saving ? t.savingDeck : t.saveDeck}
          </Button>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {deckButtons.map((deckButton) => (
            <Button
              key={deckButton.slot}
              size="sm"
              variant={selectedDeckSlot === deckButton.slot ? "default" : "secondary"}
              className="h-7 rounded-full px-2.5 text-xs"
              onClick={() => onSelectDeckSlot(deckButton.slot)}
            >
              {deckButton.label}
            </Button>
          ))}
        </div>
        {selectedCardId && (
          <p className="mb-2 text-xs text-muted-foreground">{t.selectedCard}: {cards.find((c) => c.id === selectedCardId)?.name}. {t.tapSlotToPlace}</p>
        )}
        <input
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="mb-3 w-full rounded border border-border bg-background px-2 py-1 text-sm"
          placeholder={t.deckName}
        />
        <div className="space-y-3">
          {Array.from({ length: maxDeckSize }).map((_, index) => (
            <div
              key={`slot-${index}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              onClick={() => handleTapSlot(index)}
              className="rounded-xl border border-dashed border-border p-1.5 min-h-[74px] bg-secondary/20"
            >
              {deckCards[index] ? (
                <div className="flex items-start justify-between gap-2">
                  <MewCardFace card={deckCards[index]} compact className="max-w-[130px]" />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setDeck((prev) => {
                      const next = [...prev]
                      next[index] = ""
                      return next
                    })}
                  >
                    {t.remove}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t.emptyDeckSlot}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
      </div>
    </div>
  )
}
