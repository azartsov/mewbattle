"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  addOrIncrementUserCard,
  drawBooster,
  fetchCards,
  fetchUserCards,
  fetchUserDecks,
  saveBattleLog,
  saveDeck,
} from "@/lib/mew-firestore"
import type { BattleLogEntry, MewCard, UserCard } from "@/lib/mew-types"
import { CardCollection } from "@/components/mew/card-collection"
import { DeckBuilder } from "@/components/mew/deck-builder"
import { BoosterShop } from "@/components/mew/booster-shop"
import { BattleArena } from "@/components/mew/battle-arena"

type TabKey = "collection" | "deck" | "boosters" | "battle"

function AuthScreen() {
  const { signIn, signUp, enterGuestMode, error } = useAuth()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm p-4 space-y-3">
        <h1 className="text-2xl font-bold">MewBattle</h1>
        <p className="text-sm text-muted-foreground">Turn-based card RPG with cats</p>
        <form className="space-y-2" onSubmit={submit}>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={busy || !email || !password}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}>
          {mode === "signin" ? "Create account" : "I already have account"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={enterGuestMode}>Continue as Guest</Button>
      </Card>
    </div>
  )
}

export default function MewBattlePage() {
  const { user, isGuest, loading, signOut } = useAuth()
  const [tab, setTab] = useState<TabKey>("collection")
  const [cards, setCards] = useState<MewCard[]>([])
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [deckIds, setDeckIds] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const userId = user?.uid ?? null

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoadingData(false)
      return
    }

    setLoadingData(true)
    try {
      const [allCards, owned, decks] = await Promise.all([
        fetchCards(),
        fetchUserCards(userId),
        fetchUserDecks(userId),
      ])
      setCards(allCards)
      setUserCards(owned)
      const mainDeck = decks.find((d) => d.deckName.toLowerCase() === "main deck") ?? decks[0]
      setDeckIds(mainDeck?.cards ?? [])
    } finally {
      setLoadingData(false)
    }
  }, [userId])

  useEffect(() => {
    if (!loading && userId) {
      loadData().catch(() => setMessage("Failed to load Firestore data"))
    }
  }, [loading, userId, loadData])

  const handleSaveDeck = useCallback(async (name: string, cardIds: string[]) => {
    if (!userId) return
    await saveDeck(userId, name, cardIds)
    setDeckIds(cardIds)
    setMessage("Deck saved")
  }, [userId])

  const handleOpenBooster = useCallback(async () => {
    if (!userId) return []
    const allCards = cards.length > 0 ? cards : await fetchCards()
    const dropped = drawBooster(allCards, 5)
    await Promise.all(dropped.map((card) => addOrIncrementUserCard(userId, card.id)))
    await loadData()
    setMessage("Booster opened")
    return dropped
  }, [cards, loadData, userId])

  const battleDeckCards = useMemo(() => {
    const ownedSet = new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId))
    const preferred = deckIds
      .map((id) => cards.find((c) => c.id === id))
      .filter((c): c is MewCard => !!c)
      .filter((c) => ownedSet.has(c.id))

    if (preferred.length > 0) return preferred
    return cards.filter((c) => ownedSet.has(c.id)).slice(0, 5)
  }, [cards, userCards, deckIds])

  const saveBattle = useCallback(async (winnerId: string, log: BattleLogEntry[]) => {
    if (!userId) return
    await saveBattleLog({
      player1Id: userId,
      bossId: "evil_raven",
      winnerId,
      log,
      createdAt: Date.now(),
    })
    setMessage("Battle saved")
  }, [userId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user && !isGuest) {
    return <AuthScreen />
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "collection", label: "Collection" },
    { key: "deck", label: "My Deck" },
    { key: "boosters", label: "Boosters" },
    { key: "battle", label: "Battle" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">MewBattle</h1>
            <p className="text-xs text-muted-foreground">Card RPG Arena</p>
          </div>
          <div className="flex items-center gap-2">
            {user ? <span className="text-xs text-muted-foreground">{user.email}</span> : <span className="text-xs text-muted-foreground">Guest</span>}
            <Button size="sm" variant="secondary" onClick={() => signOut()}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {!userId && (
          <Card className="p-3 text-sm text-amber-300 border-amber-500/40">
            Guest mode is available for UI preview only. Sign in to save decks, boosters and battles in Firestore.
          </Card>
        )}

        {message && (
          <Card className="p-2 text-sm border-primary/40">{message}</Card>
        )}

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Button
              key={item.key}
              variant={tab === item.key ? "default" : "secondary"}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {loadingData ? (
          <Card className="p-4">Loading Firestore data...</Card>
        ) : (
          <>
            {tab === "collection" && <CardCollection cards={cards} userCards={userCards} />}
            {tab === "deck" && userId && (
              <DeckBuilder
                cards={cards}
                userCards={userCards}
                initialDeckCardIds={deckIds}
                onSaveDeck={handleSaveDeck}
              />
            )}
            {tab === "boosters" && userId && (
              <BoosterShop onOpen={handleOpenBooster} />
            )}
            {tab === "battle" && userId && (
              <BattleArena deckCards={battleDeckCards} onSaveBattle={saveBattle} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
