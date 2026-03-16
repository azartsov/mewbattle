// @vitest-environment jsdom

import React, { useCallback, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DeckBuilder } from "@/components/mew/deck-builder"
import type { MewCard, UserCard } from "@/lib/mew-types"

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}))

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}))

vi.mock("@/components/mew/mew-card-face", () => ({
  MewCardFace: ({ card }: { card: { id: string; name: string } }) => <div data-card-id={card.id}>{card.name}</div>,
}))

vi.mock("@/lib/mew-i18n", () => ({
  useMewI18n: () => ({
    t: {
      deckCollectionHint: "Collection",
      noCardsYet: "No cards",
      myDeck: "My Deck",
      savingDeck: "Saving",
      saveDeck: "Save Deck",
      selectedCard: "Selected",
      tapSlotToPlace: "Tap slot",
      deckName: "Deck name",
      remove: "Remove",
      emptyDeckSlot: "Empty slot",
    },
  }),
}))

const cards: MewCard[] = [
  {
    id: "cat_knight",
    name: "Cat Knight",
    attack: 5,
    health: 7,
    rarity: "common",
    imageUrl: "/cards/cat_knight.svg",
    ability: "Guard",
  },
]

const userCards: UserCard[] = [
  {
    id: "uc_1",
    userId: "user_1",
    cardId: "cat_knight",
    level: 1,
    quantity: 1,
  },
]

function Harness() {
  const [draftName, setDraftName] = useState("")
  const [dirty, setDirty] = useState(false)
  const [tick, setTick] = useState(0)
  const initialDeckCardIds = useMemo(() => ["cat_knight"], [])

  const handleDraftChange = useCallback((name: string) => {
    setDraftName(name)
  }, [])

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setDirty(isDirty)
  }, [])

  return (
    <div>
      <div id="draft-name">{draftName}</div>
      <div id="dirty">{dirty ? "dirty" : "clean"}</div>
      <button id="rerender" onClick={() => setTick((value) => value + 1)}>rerender</button>
      <div id="tick">{tick}</div>
      <DeckBuilder
        cards={cards}
        userCards={userCards}
        maxDeckSize={3}
        deckButtons={[{ slot: "deck1", label: "Deck 1" }]}
        selectedDeckSlot="deck1"
        initialDeckName="Deck 1"
        initialDeckCardIds={initialDeckCardIds}
        onSelectDeckSlot={() => {}}
        onSaveDeck={async () => {}}
        onDraftChange={handleDraftChange}
        onDirtyChange={handleDirtyChange}
      />
    </div>
  )
}

describe("DeckBuilder", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("does not enter an infinite update loop on mount or parent rerenders", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    flushSync(() => {
      root.render(<Harness />)
    })

    expect(container.querySelector("#dirty")?.textContent).toBe("clean")

    const rerenderButton = container.querySelector("#rerender") as HTMLButtonElement | null
    expect(rerenderButton).not.toBeNull()

    flushSync(() => {
      rerenderButton!.click()
      rerenderButton!.click()
      rerenderButton!.click()
    })

    expect(container.querySelector("#tick")?.textContent).toBe("3")
    expect(container.querySelector("#dirty")?.textContent).toBe("clean")
    const consoleMessages = consoleError.mock.calls.map((args) => args.join(" ")).join("\n")
    expect(consoleMessages).not.toContain("Maximum update depth exceeded")

    flushSync(() => {
      root.unmount()
    })
  })
})
