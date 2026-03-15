"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { BookOpen, CircleHelp, Crown, Gem, Gift, PawPrint, Play, Shield, Sparkles, Swords, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  awardBattleCoins,
  BOOSTER_OFFERS,
  DECK_SLOT_KEYS,
  ensureDefaultDeckSlots,
  fetchCards,
  fetchUserBattleLogs,
  getDefaultDeckName,
  fetchUserProfile,
  fetchUserCards,
  fetchUserDecks,
  getCardSellPrice,
  openBoosterWithOffer,
  saveBattleLog,
  saveDeckToSlot,
  sellUserCardForCoins,
} from "@/lib/mew-firestore"
import type { BattleLogEntry, Deck, MewCard, UserCard, UserProfile } from "@/lib/mew-types"
import type { DeckSlotKey, BoosterOffer, UserBattleLog } from "@/lib/mew-firestore"
import { CardCollection } from "@/components/mew/card-collection"
import { DeckBuilder } from "@/components/mew/deck-builder"
import { BoosterShop } from "@/components/mew/booster-shop"
import { BattleArena } from "@/components/mew/battle-arena"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { HelpPanel } from "@/components/mew/help-panel"
import { LanguageToggle } from "@/components/mew/language-toggle"
import { useMewI18n } from "@/lib/mew-i18n"

type TabKey = "collection" | "deck" | "boosters" | "battle" | "help"

function AuthScreen() {
  const { signIn, signUp, enterGuestMode, error } = useAuth()
  const { t } = useMewI18n()
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
    } catch {
      // Error message is already set in auth context.
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{t.appTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
          </div>
          <LanguageToggle />
        </div>
        <form className="space-y-2" onSubmit={submit}>
          <Input type="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={busy || !email || !password}>
            {busy ? t.pleaseWait : mode === "signin" ? t.signIn : t.signUp}
          </Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}>
          {mode === "signin" ? t.createAccount : t.alreadyHaveAccount}
        </Button>
        <Button variant="ghost" className="w-full" onClick={enterGuestMode}>{t.continueAsGuest}</Button>
      </Card>
    </div>
  )
}

export default function MewBattlePage() {
  const { user, isGuest, loading, signOut } = useAuth()
  const { t } = useMewI18n()
  const [tab, setTab] = useState<TabKey>("collection")
  const [cards, setCards] = useState<MewCard[]>([])
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckSlot, setSelectedDeckSlot] = useState<DeckSlotKey>("deck1")
  const [selectedBattleDeckName, setSelectedBattleDeckName] = useState<string>("Main Deck")
  const [activeBattleDeckName, setActiveBattleDeckName] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [battleHistory, setBattleHistory] = useState<UserBattleLog[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [sellingCardId, setSellingCardId] = useState<string | null>(null)

  const userId = user?.uid ?? null

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoadingData(false)
      return
    }

    setLoadingData(true)
    try {
      const [allCards, owned, loadedDecks, userProfile, battles] = await Promise.all([
        fetchCards(),
        fetchUserCards(userId),
        (async () => {
          await ensureDefaultDeckSlots(userId)
          return fetchUserDecks(userId)
        })(),
        fetchUserProfile(userId),
        fetchUserBattleLogs(userId, 24),
      ])

      const orderedBySlot = DECK_SLOT_KEYS.map((slotKey) => {
        const existingDeck = loadedDecks.find((deck) => deck.slot === slotKey)
        return existingDeck ?? {
          id: `local_${slotKey}`,
          userId,
          slot: slotKey,
          deckName: getDefaultDeckName(slotKey),
          cards: [],
        }
      })

      const selectedDeckName = (orderedBySlot.find((deck) => deck.slot === selectedDeckSlot)?.deckName) ?? orderedBySlot[0].deckName
      const preferredDeck = orderedBySlot.find((deck) => deck.deckName === selectedDeckName) ?? orderedBySlot[0]
      const preferredBattleDeck = orderedBySlot.find((deck) => deck.deckName === selectedBattleDeckName) ?? preferredDeck

      setCards(allCards)
      setUserCards(owned)
      setDecks(orderedBySlot)
      setSelectedBattleDeckName(preferredBattleDeck.deckName)
      setProfile(userProfile)
      setBattleHistory(battles)
    } finally {
      setLoadingData(false)
    }
  }, [selectedBattleDeckName, selectedDeckSlot, userId])

  useEffect(() => {
    if (!loading && userId) {
      loadData().catch(() => setMessage("Failed to load Firestore data"))
    }
  }, [loading, userId, loadData])

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.slot === selectedDeckSlot) ?? decks[0] ?? null,
    [decks, selectedDeckSlot],
  )

  const selectedBattleDeck = useMemo(
    () => decks.find((deck) => deck.deckName === selectedBattleDeckName) ?? decks[0] ?? null,
    [decks, selectedBattleDeckName],
  )

  const handleSaveDeck = useCallback(async (name: string, cardIds: string[]) => {
    if (!userId) return
    await saveDeckToSlot(userId, selectedDeckSlot, name, cardIds)
    setSelectedBattleDeckName(name)
    await loadData()
    setMessage(t.deckSaved)
  }, [loadData, selectedDeckSlot, t.deckSaved, userId])

  const handleOpenBooster = useCallback(async (offerId: BoosterOffer["id"]) => {
    if (!userId) return []
    try {
      const offer = BOOSTER_OFFERS.find((candidate) => candidate.id === offerId)
      const allCards = cards.length > 0 ? cards : await fetchCards()
      const dropped = await openBoosterWithOffer(userId, allCards, offerId, 5)
      await loadData()
      setMessage(`${t.openBooster}: -${offer?.cost ?? 0}`)
      return dropped
    } catch {
      setMessage("Not enough coins or Firestore permissions are missing")
      return []
    }
  }, [cards, loadData, t.openBooster, userId])

  const battleStatsSummary = useMemo(() => {
    const wins = battleHistory.filter((entry) => entry.winnerId === "player").length
    const losses = battleHistory.length - wins
    const avgTurns = battleHistory.length > 0
      ? Math.round((battleHistory.reduce((acc, entry) => acc + Math.max(entry.turns, 1), 0) / battleHistory.length) * 10) / 10
      : 0

    return {
      wins,
      losses,
      avgTurns,
      recent: battleHistory.slice(0, 10),
    }
  }, [battleHistory])

  const localizedBoosterOffers = useMemo<BoosterOffer[]>(() => BOOSTER_OFFERS.map((offer) => {
    if (offer.id === "starter") {
      return {
        ...offer,
        title: t.boosterStarterTitle,
        subtitle: t.boosterStarterSubtitle,
      }
    }
    if (offer.id === "hunter") {
      return {
        ...offer,
        title: t.boosterHunterTitle,
        subtitle: t.boosterHunterSubtitle,
      }
    }
    return {
      ...offer,
      title: t.boosterRoyalTitle,
      subtitle: t.boosterRoyalSubtitle,
    }
  }), [t])

  const battleTierMeta = useMemo(() => ({
    common: { label: t.rarityCommon, icon: Shield, chipClass: "bg-slate-500/15 border-slate-400/35 text-slate-200" },
    rare: { label: t.rarityRare, icon: Gem, chipClass: "bg-sky-500/15 border-sky-400/40 text-sky-200" },
    epic: { label: t.rarityEpic, icon: Sparkles, chipClass: "bg-violet-500/15 border-violet-400/40 text-violet-200" },
    legendary: { label: t.rarityLegendary, icon: Crown, chipClass: "bg-amber-500/15 border-amber-400/45 text-amber-100" },
  }), [t])

  const getBattleTier = (entry: UserBattleLog): "common" | "rare" | "epic" | "legendary" => {
    if (entry.winnerId !== "player") return "common"
    if (entry.turns <= 4) return "legendary"
    if (entry.turns <= 7) return "epic"
    return "rare"
  }

  const handleSellCard = useCallback(async (card: MewCard) => {
    if (!userId) return
    setSellingCardId(card.id)
    try {
      const earned = await sellUserCardForCoins(userId, card)
      await loadData()
      setMessage(`${t.sellDuplicate}: +${earned}`)
    } catch {
      setMessage(t.cannotSell)
    } finally {
      setSellingCardId(null)
    }
  }, [loadData, t.cannotSell, t.sellDuplicate, userId])

  const selectedDeckCards = useMemo(() => {
    const sourceDeck = selectedDeck
    if (!sourceDeck) return []

    const ownedSet = new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId))
    return sourceDeck.cards
      .map((id) => cards.find((c) => c.id === id))
      .filter((card): card is MewCard => !!card)
      .filter((card) => ownedSet.has(card.id))
  }, [cards, selectedDeck, userCards])

  const battleDeckCards = useMemo(() => {
    const sourceDeck = activeBattleDeckName
      ? decks.find((deck) => deck.deckName === activeBattleDeckName) ?? selectedBattleDeck
      : selectedBattleDeck

    if (!sourceDeck) return []

    const ownedSet = new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId))
    const preferred = sourceDeck.cards
      .map((id) => cards.find((c) => c.id === id))
      .filter((card): card is MewCard => !!card)
      .filter((card) => ownedSet.has(card.id))

    return preferred.slice(0, 5)
  }, [activeBattleDeckName, cards, decks, selectedBattleDeck, userCards])

  const saveBattle = useCallback(async (winnerId: string, log: BattleLogEntry[]) => {
    if (!userId) return

    const turns = log.reduce((max, entry) => Math.max(max, entry.turn), 0)
    const didWin = winnerId === "player"
    const reward = await awardBattleCoins(userId, didWin, turns)

    await saveBattleLog({
      player1Id: userId,
      bossId: "evil_raven",
      winnerId,
      rewardCoins: reward,
      log,
      createdAt: Date.now(),
    })

    await loadData()
    setMessage(`${didWin ? t.battleSavedWin : t.battleSavedLoss}: +${reward}`)
  }, [loadData, t.battleSavedLoss, t.battleSavedWin, userId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user && !isGuest) {
    return <AuthScreen />
  }

  const tabs: Array<{
    key: TabKey
    label: string
    icon: typeof PawPrint
    tone: string
  }> = [
    { key: "collection", label: t.collection, icon: PawPrint, tone: "bg-sky-500/15 text-sky-200 border-sky-500/35" },
    { key: "deck", label: t.myDeck, icon: BookOpen, tone: "bg-emerald-500/15 text-emerald-200 border-emerald-500/35" },
    { key: "boosters", label: t.boosters, icon: Gift, tone: "bg-amber-500/15 text-amber-100 border-amber-500/35" },
    { key: "battle", label: t.battle, icon: Swords, tone: "bg-rose-500/15 text-rose-100 border-rose-500/35" },
    { key: "help", label: t.help, icon: CircleHelp, tone: "bg-fuchsia-500/15 text-fuchsia-100 border-fuchsia-500/35" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-primary/40 bg-primary/10">
              <Image src="/cards/cat_knight.svg" alt="Mew mascot" fill className="object-cover" />
            </div>
            <div>
              <h1 className='text-xl font-black tracking-wide text-primary font-["Trebuchet_MS","Verdana",sans-serif]'>{t.appTitle}</h1>
              <p className="text-xs text-muted-foreground font-medium">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile && <CoinPawBadge amount={profile.coins} compact />}
            {user ? <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span> : <span className="text-xs text-muted-foreground">Guest</span>}
            <LanguageToggle />
            <Button size="sm" variant="secondary" onClick={() => signOut()}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {!userId && (
          <Card className="p-3 text-sm text-amber-300 border-amber-500/40">
            {t.guestPreview}
          </Card>
        )}

        {message && (
          <Card className="p-2 text-sm border-primary/40">{message}</Card>
        )}

        {profile && (
          <Card className="border-primary/25 bg-gradient-to-br from-primary/8 via-background to-emerald-500/8 px-2 py-1.5">
            <div className='flex flex-wrap items-center gap-1 font-["Trebuchet_MS","Verdana",sans-serif]'>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[11px] leading-none">
                <span className="text-emerald-100/85">{t.wins}:</span>
                <span className="font-semibold text-emerald-300">{profile.wins}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/35 bg-rose-500/10 px-2 py-0.5 text-[11px] leading-none">
                <span className="text-rose-100/85">{t.losses}:</span>
                <span className="font-semibold text-rose-300">{profile.losses}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/35 bg-sky-500/10 px-2 py-0.5 text-[11px] leading-none">
                <span className="text-sky-100/85">{t.streak}:</span>
                <span className="font-semibold text-sky-300">{profile.streak}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] leading-none text-amber-100">
                <span className="text-amber-100/85">{t.earned}:</span>
                <span className="font-semibold">{profile.totalEarned}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/35 bg-zinc-500/10 px-2 py-0.5 text-[11px] leading-none text-zinc-100">
                <span className="text-zinc-200/85">{t.spent}:</span>
                <span className="font-semibold">{profile.totalSpent}</span>
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="ml-auto h-6 w-6 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20"
                    aria-label={t.statsHistory}
                    title={t.statsHistory}
                  >
                    <TrendingUp className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-amber-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                  <DialogHeader>
                    <DialogTitle className='font-["Trebuchet_MS","Verdana",sans-serif] text-amber-100'>{t.battleStatsHistory}</DialogTitle>
                  </DialogHeader>
                  <div className='grid grid-cols-3 gap-1.5 text-sm font-["Trebuchet_MS","Verdana",sans-serif]'>
                    <Card className="p-1.5 text-center border-emerald-500/35 bg-gradient-to-br from-emerald-500/12 to-emerald-500/0">
                      <p className="text-xs text-emerald-100/80">{t.wins}</p>
                      <p className="text-base font-bold leading-none text-emerald-300">{battleStatsSummary.wins}</p>
                    </Card>
                    <Card className="p-1.5 text-center border-rose-500/35 bg-gradient-to-br from-rose-500/12 to-rose-500/0">
                      <p className="text-xs text-rose-100/80">{t.losses}</p>
                      <p className="text-base font-bold leading-none text-rose-300">{battleStatsSummary.losses}</p>
                    </Card>
                    <Card className="p-1.5 text-center border-sky-500/35 bg-gradient-to-br from-sky-500/12 to-sky-500/0">
                      <p className="text-xs text-sky-100/80">{t.avgTurns}</p>
                      <p className="text-base font-bold leading-none text-sky-300">{battleStatsSummary.avgTurns}</p>
                    </Card>
                  </div>

                  <div className='max-h-[68vh] space-y-1 overflow-auto pr-1 font-["Trebuchet_MS","Verdana",sans-serif]'>
                    {battleStatsSummary.recent.map((entry) => {
                      const won = entry.winnerId === "player"
                      const tier = getBattleTier(entry)
                      const tierInfo = battleTierMeta[tier]
                      const TierIcon = tierInfo.icon
                      return (
                        <Card
                          key={entry.id}
                          className={`p-1.5 border ${won ? "border-emerald-500/35 bg-gradient-to-r from-emerald-500/12 to-transparent" : "border-rose-500/35 bg-gradient-to-r from-rose-500/12 to-transparent"}`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] font-semibold leading-none ${won ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200" : "border-rose-400/50 bg-rose-500/15 text-rose-200"}`}>
                                {won ? t.victory : t.defeat}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] leading-none ${tierInfo.chipClass}`}>
                                <TierIcon className="h-2.5 w-2.5" />
                                {tierInfo.label}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-amber-400/45 bg-amber-500/15 px-1.5 py-0.5 text-[11px] leading-none text-amber-100">
                                {t.battleReward}: +{entry.rewardCoins}
                              </span>
                            </div>
                            <span className="text-[11px] leading-none text-slate-300/80">{new Date(entry.createdAtMs).toLocaleString()}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-tight text-slate-300/80">
                            {t.battleBoss}: {entry.bossId ?? "unknown"} | {t.battleTurns}: {entry.turns}
                          </p>
                        </Card>
                      )
                    })}
                    {battleStatsSummary.recent.length === 0 && <p className="text-sm text-slate-300/70">{t.noBattleHistory}</p>}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.key}
                variant={tab === item.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTab(item.key)}
                className={`rounded-full px-2.5 h-8 gap-1.5 ${tab === item.key ? "" : item.tone}`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs">{item.label}</span>
              </Button>
            )
          })}
        </div>

        {loadingData ? (
          <Card className="p-4">{t.loadingData}</Card>
        ) : (
          <>
            {tab === "collection" && (
              <CardCollection
                cards={cards}
                userCards={userCards}
                onSellCard={handleSellCard}
                sellingCardId={sellingCardId}
                getSellPrice={getCardSellPrice}
              />
            )}
            {tab === "deck" && userId && (
              <DeckBuilder
                cards={cards}
                userCards={userCards}
                deckButtons={[
                  { slot: "deck1", label: t.deckOne },
                  { slot: "deck2", label: t.deckTwo },
                  { slot: "deck3", label: t.deckThree },
                ]}
                selectedDeckSlot={selectedDeckSlot}
                initialDeckName={selectedDeck?.deckName ?? getDefaultDeckName(selectedDeckSlot)}
                initialDeckCardIds={selectedDeckCards.map((card) => card.id)}
                onSelectDeckSlot={setSelectedDeckSlot}
                onSaveDeck={handleSaveDeck}
              />
            )}
            {tab === "boosters" && userId && (
              <BoosterShop onOpen={handleOpenBooster} offers={localizedBoosterOffers} />
            )}
            {tab === "battle" && userId && (
              <div className="space-y-4">
                <Card className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{t.chooseBattleDeck}</h2>
                      <p className="text-sm text-muted-foreground">{t.selectedBattleDeck}: {selectedBattleDeckName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedBattleDeckName}
                        onChange={(event) => {
                          setSelectedBattleDeckName(event.target.value)
                          setActiveBattleDeckName(null)
                        }}
                        className="h-9 rounded-full border border-border bg-background px-3 text-sm"
                      >
                        {decks.map((deck) => (
                          <option key={deck.id} value={deck.deckName}>{deck.deckName}</option>
                        ))}
                      </select>
                      <Button size="sm" className="rounded-full" onClick={() => setActiveBattleDeckName(selectedBattleDeckName)} disabled={battleDeckCards.length === 0}>
                        <Play className="h-3.5 w-3.5" />
                        {t.startBattle}
                      </Button>
                    </div>
                  </div>
                  {battleDeckCards.length === 0 && <p className="text-sm text-muted-foreground">{t.noDeckForBattle}</p>}
                </Card>
                {activeBattleDeckName && battleDeckCards.length > 0 && (
                  <BattleArena
                    key={activeBattleDeckName}
                    deckCards={battleDeckCards}
                    onSaveBattle={saveBattle}
                    deckName={activeBattleDeckName}
                  />
                )}
              </div>
            )}
            {tab === "help" && <HelpPanel />}
          </>
        )}
      </main>
    </div>
  )
}
