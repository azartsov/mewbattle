"use client"

import type { MewCard, UserCard } from "@/lib/mew-types"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface CardCollectionProps {
  cards: MewCard[]
  userCards: UserCard[]
}

function rarityClass(rarity: MewCard["rarity"]): string {
  if (rarity === "legendary") return "text-amber-300"
  if (rarity === "epic") return "text-fuchsia-300"
  if (rarity === "rare") return "text-sky-300"
  return "text-zinc-300"
}

export function CardCollection({ cards, userCards }: CardCollectionProps) {
  const qtyByCard = new Map(userCards.map((c) => [c.cardId, c.quantity]))

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">My Cats</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => (
          <Card key={card.id} className="p-3 bg-card border-border">
            <Image
              src={card.imageUrl}
              alt={card.name}
              width={320}
              height={180}
              className="w-full h-28 object-cover rounded"
            />
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{card.name}</p>
                <span className={`text-xs uppercase ${rarityClass(card.rarity)}`}>{card.rarity}</span>
              </div>
              <p className="text-xs text-muted-foreground">ATK {card.attack} / HP {card.health}</p>
              <p className="text-xs text-muted-foreground">{card.ability}</p>
              <p className="text-xs">Owned: <span className="font-semibold">{qtyByCard.get(card.id) ?? 0}</span></p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
