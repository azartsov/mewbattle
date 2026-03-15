"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MewCard, UserCard } from "@/lib/mew-types"

const MAX_DECK_SIZE = 5

interface DeckBuilderProps {
  cards: MewCard[]
  userCards: UserCard[]
  initialDeckCardIds: string[]
  onSaveDeck: (name: string, cardIds: string[]) => Promise<void>
}

export function DeckBuilder({ cards, userCards, initialDeckCardIds, onSaveDeck }: DeckBuilderProps) {
  const [deckName, setDeckName] = useState("Main Deck")
  const [deck, setDeck] = useState<string[]>(initialDeckCardIds.slice(0, MAX_DECK_SIZE))
  const [saving, setSaving] = useState(false)

  const ownedCardIds = useMemo(() => new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId)), [userCards])
  const ownedCards = useMemo(() => cards.filter((c) => ownedCardIds.has(c.id)), [cards, ownedCardIds])

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    event.preventDefault()
    const cardId = event.dataTransfer.getData("text/plain")
    if (!cardId) return

    setDeck((prev) => {
      const next = [...prev]
      next[slotIndex] = cardId
      return next.slice(0, MAX_DECK_SIZE)
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
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-3 bg-card border-border">
        <h3 className="font-semibold mb-2">Collection (drag cards)</h3>
        <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
          {ownedCards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
              className="rounded border border-border p-2 bg-secondary/40 cursor-grab active:cursor-grabbing"
            >
              <p className="text-sm font-medium">{card.name}</p>
              <p className="text-xs text-muted-foreground">ATK {card.attack} / HP {card.health}</p>
            </div>
          ))}
          {ownedCards.length === 0 && <p className="text-sm text-muted-foreground">Open boosters to get cards.</p>}
        </div>
      </Card>

      <Card className="p-3 bg-card border-border">
        <h3 className="font-semibold mb-2">My Deck (max {MAX_DECK_SIZE})</h3>
        <input
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="mb-3 w-full rounded border border-border bg-background px-2 py-1 text-sm"
          placeholder="Deck name"
        />
        <div className="space-y-2">
          {Array.from({ length: MAX_DECK_SIZE }).map((_, index) => (
            <div
              key={`slot-${index}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              className="rounded border border-dashed border-border p-2 min-h-[54px] bg-secondary/20"
            >
              {deckCards[index] ? (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{deckCards[index]?.name}</p>
                    <p className="text-xs text-muted-foreground">ATK {deckCards[index]?.attack} / HP {deckCards[index]?.health}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeck((prev) => {
                      const next = [...prev]
                      next[index] = ""
                      return next
                    })}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Drop a cat card here</p>
              )}
            </div>
          ))}
        </div>
        <Button className="mt-3 w-full" onClick={handleSave} disabled={saving || deck.filter(Boolean).length === 0}>
          {saving ? "Saving..." : "Save Deck"}
        </Button>
      </Card>
    </div>
  )
}
