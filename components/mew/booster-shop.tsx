"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MewCard } from "@/lib/mew-types"
import Image from "next/image"

interface BoosterShopProps {
  onOpen: () => Promise<MewCard[]>
}

export function BoosterShop({ onOpen }: BoosterShopProps) {
  const [opening, setOpening] = useState(false)
  const [cards, setCards] = useState<MewCard[]>([])

  const open = async () => {
    setOpening(true)
    try {
      const pulled = await onOpen()
      setCards(pulled)
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Boosters</h2>
      <Button onClick={open} disabled={opening}>{opening ? "Opening..." : "Open Booster"}</Button>
      {cards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card, idx) => (
            <Card key={`${card.id}-${idx}`} className="p-3">
              <Image
                src={card.imageUrl}
                alt={card.name}
                width={320}
                height={180}
                className="w-full h-28 object-cover rounded"
              />
              <p className="mt-2 font-medium">{card.name}</p>
              <p className="text-xs text-muted-foreground uppercase">{card.rarity}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
