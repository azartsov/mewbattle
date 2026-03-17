"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { BookOpen, CircleHelp, Crown, Download, Gem, Gift, LogOut, MoreVertical, PawPrint, Play, RotateCcw, Shield, Sparkles, Swords, TrendingUp, Trophy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  awardBattleCoins,
  BATTLE_ENTRY_COST,
  BOOSTER_OFFERS,
  DECK_SLOT_KEYS,
  ensureNicknameFromEmail,
  ensureDefaultDeckSlots,
  fetchCards,
  fetchLeaderboard,
  fetchUserBattleLogs,
  getDefaultDeckName,
  fetchUserProfile,
  fetchUserCards,
  fetchUserDecks,
  getCardSellPrice,
  openBoosterWithOffer,
  payBattleEntry,
  resetUserToInitialState,
  saveBattleLog,
  saveDeckToSlot,
  sellUserCardForCoins,
  syncLeaderboardAfterBattle,
} from "@/lib/mew-firestore"
import type { BattleLogEntry, Deck, FighterCard, MewCard, UserCard, UserProfile } from "@/lib/mew-types"
import type { BoosterOpenResult, DeckSlotKey, BoosterOffer, LeaderboardEntry, UserBattleLog } from "@/lib/mew-firestore"
import { CardCollection } from "@/components/mew/card-collection"
import { DeckBuilder } from "@/components/mew/deck-builder"
import { UnsavedDeckDialog } from "@/components/mew/unsaved-deck-dialog"
import { BoosterShop } from "@/components/mew/booster-shop"
import { BattleArena } from "@/components/mew/battle-arena"
import { BattleFighterCard } from "@/components/mew/battle-fighter-card"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { HelpPanel } from "@/components/mew/help-panel"
import { LanguageToggle } from "@/components/mew/language-toggle"
import { PawLoader } from "@/components/mew/paw-loader"
import { PreAuthUkiyoeSplash } from "@/components/mew/pre-auth-ukiyoe-splash"
import { VersionHistoryDialog } from "@/components/mew/version-history-dialog"
import { useMewI18n } from "@/lib/mew-i18n"
import { pickRandomBoss, scaleBossForPlayer } from "@/lib/mew-bosses"
import { APP_VERSION } from "@/lib/version"
import { pickCatCodexQuote } from "@/lib/cat-codex"
import { CardDesignProvider, type CardDesignVariant } from "@/lib/mew-card-design"
import { DEFAULT_CARD_DESIGN, loadLocalCardDesign, loadUserCardDesign, normalizeCardDesign, saveLocalCardDesign, saveUserCardDesign } from "@/lib/user-settings"

type TabKey = "collection" | "deck" | "boosters" | "battle" | "help"
type BattleStage = "idle" | "preparing" | "fighting" | "completed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

interface VersionManifest {
  version: string
  generatedAt: string
}

function parseVersionNumber(version: string) {
  const [majorPart, minorPart] = version.split(".")
  const major = Number.parseInt(majorPart ?? "", 10)
  const minor = Number.parseInt(minorPart ?? "", 10)
  if (!Number.isFinite(major) || !Number.isFinite(minor)) return -1
  return major * 100000 + minor
}

function isNewerVersion(candidateVersion: string, currentVersion: string) {
  return parseVersionNumber(candidateVersion) > parseVersionNumber(currentVersion)
}

function AuthScreen() {
  const { signIn, signUp, enterGuestMode, error } = useAuth()
  const { t } = useMewI18n()
  const [showForm, setShowForm] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [busy, setBusy] = useState(false)

  const nicknameValid = nickname.trim().length >= 1 && nickname.trim().length <= 10

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === "signup" && !nicknameValid) return
    setBusy(true)
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password, nickname.trim())
      }
    } catch {
      // Error message is already set in auth context.
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <PreAuthUkiyoeSplash onEnter={() => setShowForm(true)} onShowVersionHistory={() => setShowVersionHistory(true)} />
      <div className={`relative z-10 min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${showForm ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <Card className="w-full max-w-sm p-4 space-y-3 border-amber-300/30 bg-card/92 backdrop-blur-sm shadow-2xl shadow-black/45">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{t.appTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowForm(false)} aria-label={t.backToSplash}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <form className="space-y-2" onSubmit={submit}>
          <Input type="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "signup" && (
            <div className="space-y-1">
              <Input
                placeholder={`${t.nickname} (макс. 10)`}
                value={nickname}
                maxLength={10}
                onChange={(e) => setNickname(e.target.value)}
              />
              {nickname.length > 0 && !nicknameValid && (
                <p className="text-xs text-destructive">1–10 символов</p>
              )}
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={busy || !email || !password || (mode === "signup" && !nicknameValid)}>
            {busy ? t.pleaseWait : mode === "signin" ? t.signIn : t.signUp}
          </Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}>
          {mode === "signin" ? t.createAccount : t.alreadyHaveAccount}
        </Button>
        <Button variant="ghost" className="w-full" onClick={enterGuestMode}>{t.continueAsGuest}</Button>
      </Card>
      </div>
      <VersionHistoryDialog open={showVersionHistory} onOpenChange={setShowVersionHistory} />
    </div>
  )
}

export default function MewBattlePage() {
  const { user, isGuest, loading, signOut } = useAuth()
  const { t, language } = useMewI18n()
  const [cardDesign, setCardDesign] = useState<CardDesignVariant>(DEFAULT_CARD_DESIGN)
  const [cardDesignReady, setCardDesignReady] = useState(false)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [pwaInstalled, setPwaInstalled] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [installDialogMessage, setInstallDialogMessage] = useState<string | null>(null)
  const [availableVersion, setAvailableVersion] = useState<string | null>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [applyingUpdate, setApplyingUpdate] = useState(false)
  const [tab, setTab] = useState<TabKey>("collection")
  const [cards, setCards] = useState<MewCard[]>([])
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckSlot, setSelectedDeckSlot] = useState<DeckSlotKey>("deck1")
  const [battleStage, setBattleStage] = useState<BattleStage>("idle")
  const [battleBoss, setBattleBoss] = useState<FighterCard | null>(null)
  const [battleDeckSlot, setBattleDeckSlot] = useState<DeckSlotKey | null>(null)
  const [previewDeckSlot, setPreviewDeckSlot] = useState<DeckSlotKey | null>(null)
  const [enteringBattle, setEnteringBattle] = useState(false)
  const [startingBattle, setStartingBattle] = useState(false)
  const [battleSessionId, setBattleSessionId] = useState(0)
  const [lastBattleBossId, setLastBattleBossId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [battleHistory, setBattleHistory] = useState<UserBattleLog[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [sellingCardId, setSellingCardId] = useState<string | null>(null)
  const [recentlyDroppedCounts, setRecentlyDroppedCounts] = useState<Map<string, number>>(new Map())
  const [pendingBattleWinReward, setPendingBattleWinReward] = useState<number>(50)
  const [showBankruptcyWarning, setShowBankruptcyWarning] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [deckDraft, setDeckDraft] = useState<{ name: string; cardIds: string[] } | null>(null)
  const [deckDirty, setDeckDirty] = useState(false)
  const [showUnsavedDeckDialog, setShowUnsavedDeckDialog] = useState(false)
  const [pendingTabSwitch, setPendingTabSwitch] = useState<TabKey | null>(null)
  const [savingUnsavedDeck, setSavingUnsavedDeck] = useState(false)
  const [savingGameState, setSavingGameState] = useState(false)

  const userId = user?.uid ?? null

  useEffect(() => {
    if (typeof window === "undefined") return

    const media = window.matchMedia("(display-mode: standalone)")
    const updateInstalledState = () => {
      const navigatorStandalone = typeof navigator !== "undefined" && "standalone" in navigator
        ? Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
        : false
      setPwaInstalled(media.matches || navigatorStandalone)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setPwaInstalled(true)
      setDeferredInstallPrompt(null)
      setInstallDialogMessage(t.pwaAlreadyInstalled)
      setShowInstallDialog(true)
    }

    updateInstalledState()
    media.addEventListener("change", updateInstalledState)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      media.removeEventListener("change", updateInstalledState)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [t.pwaAlreadyInstalled])

  useEffect(() => {
    if (!pwaInstalled || typeof window === "undefined") return

    const abortController = new AbortController()
    let cancelled = false

    const checkForInstalledAppUpdate = async () => {
      try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, {
          cache: "no-store",
          signal: abortController.signal,
        })
        if (!response.ok) return

        const manifest = await response.json() as VersionManifest
        if (cancelled || !manifest.version) return

        if (isNewerVersion(manifest.version, APP_VERSION)) {
          setAvailableVersion(manifest.version)
          setShowUpdateDialog(true)
        }
      } catch {
        // Ignore network errors: offline installed apps should still boot normally.
      }
    }

    void checkForInstalledAppUpdate()

    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [pwaInstalled])

  useEffect(() => {
    setCardDesign(loadLocalCardDesign())
    setCardDesignReady(true)
  }, [])

  useEffect(() => {
    if (!userId || isGuest) return
    let cancelled = false

    void loadUserCardDesign(userId)
      .then((savedDesign) => {
        if (!cancelled && savedDesign) {
          setCardDesign(savedDesign)
        }
      })
      .catch(() => {
        // ignore settings loading errors
      })

    return () => {
      cancelled = true
    }
  }, [isGuest, userId])

  useEffect(() => {
    if (!cardDesignReady) return
    saveLocalCardDesign(cardDesign)
    if (userId && !isGuest) {
      void saveUserCardDesign(userId, cardDesign).catch(() => {
        // ignore settings save errors
      })
    }
  }, [cardDesign, cardDesignReady, isGuest, userId])

  const catCodexQuote = useMemo(() => {
    // Deterministic per battle session to avoid SSR/client hydration mismatches.
    return pickCatCodexQuote(language, battleSessionId)
  }, [battleSessionId, language])

  const isIosInstallFlow = useMemo(() => {
    if (typeof navigator === "undefined") return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }, [])

  const handleInstallGame = useCallback(async () => {
    if (pwaInstalled) {
      setInstallDialogMessage(`${t.pwaAlreadyInstalled} ${t.pwaReinstallHint}`)
      setShowInstallDialog(true)
      return
    }

    if (deferredInstallPrompt) {
      setInstallDialogMessage(t.pwaInstallReady)
      setShowInstallDialog(true)
      await deferredInstallPrompt.prompt()
      const choice = await deferredInstallPrompt.userChoice
      if (choice.outcome === "dismissed") {
        setInstallDialogMessage(t.pwaInstallDismissed)
      }
      setDeferredInstallPrompt(null)
      return
    }

    setInstallDialogMessage(isIosInstallFlow ? t.pwaIosInstallHint : t.pwaGenericInstallHint)
    setShowInstallDialog(true)
  }, [deferredInstallPrompt, isIosInstallFlow, pwaInstalled, t.pwaAlreadyInstalled, t.pwaGenericInstallHint, t.pwaInstallDismissed, t.pwaInstallReady, t.pwaIosInstallHint, t.pwaReinstallHint])

  const handleApplyUpdate = useCallback(async () => {
    if (typeof window === "undefined") return

    setApplyingUpdate(true)
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          registration.waiting?.postMessage({ type: "SKIP_WAITING" })
        }
      }
    } catch {
      // Fall through to reload: fetching the latest app shell is enough in online mode.
    }

    window.location.reload()
  }, [])

  const loadData = useCallback(async (showSpinner = true) => {
    if (!userId) {
      setLoadingData(false)
      return
    }

    if (showSpinner) {
      setLoadingData(true)
    }
    try {
      await ensureNicknameFromEmail(userId, user?.email ?? undefined)
      await ensureDefaultDeckSlots(userId)

      const [allCards, owned, loadedDecks, userProfile, battles] = await Promise.all([
        fetchCards(),
        fetchUserCards(userId),
        fetchUserDecks(userId),
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

      setCards(allCards)
      setUserCards(owned)
      setDecks(orderedBySlot)
      setProfile(userProfile)
      setBattleHistory(battles)
    } finally {
      setLoadingData(false)
    }
  }, [user?.email, userId])

  useEffect(() => {
    if (!loading && userId) {
      loadData().catch(() => setMessage("Failed to load Firestore data"))
    }
  }, [loading, userId, loadData])

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.slot === selectedDeckSlot) ?? decks[0] ?? null,
    [decks, selectedDeckSlot],
  )

  const battleLocked = battleStage === "preparing" || battleStage === "fighting"
  const waitingForBattleDeckChoice = battleStage === "preparing" && !battleDeckSlot
  const canEnterBattle = !battleLocked && !enteringBattle && !startingBattle
  const globalLoaderLabel = resetting
    ? t.resetToInitial
    : savingGameState
      ? t.savingGameState
    : savingUnsavedDeck
      ? t.savingDeck
      : loadingData
        ? t.loadingData
        : null

  const handleSaveDeck = useCallback(async (name: string, cardIds: string[]) => {
    if (!userId) return
    await saveDeckToSlot(userId, selectedDeckSlot, name, cardIds, profile?.maxDeckSize ?? 3)
    await loadData()
    setMessage(t.deckSaved)
  }, [loadData, profile?.maxDeckSize, selectedDeckSlot, t.deckSaved, userId])

  const handleTabChange = useCallback(async (nextTab: TabKey) => {
    if (battleLocked && nextTab !== "battle") return
    if (nextTab === tab) return

    if (tab === "deck" && nextTab !== "deck" && deckDirty) {
      setPendingTabSwitch(nextTab)
      setShowUnsavedDeckDialog(true)
      return
    }

    setTab(nextTab)
  }, [battleLocked, deckDirty, tab])

  const handleUnsavedStay = useCallback(() => {
    setShowUnsavedDeckDialog(false)
    setPendingTabSwitch(null)
  }, [])

  const handleUnsavedDiscard = useCallback(() => {
    const nextTab = pendingTabSwitch
    setShowUnsavedDeckDialog(false)
    setPendingTabSwitch(null)
    setDeckDirty(false)
    setDeckDraft(null)
    if (nextTab) setTab(nextTab)
  }, [pendingTabSwitch])

  const handleUnsavedSave = useCallback(async () => {
    const nextTab = pendingTabSwitch
    if (!nextTab) {
      setShowUnsavedDeckDialog(false)
      return
    }
    if (!deckDraft || !userId) {
      setShowUnsavedDeckDialog(false)
      setPendingTabSwitch(null)
      return
    }

    setSavingUnsavedDeck(true)
    try {
      await handleSaveDeck(deckDraft.name, deckDraft.cardIds)
      setDeckDirty(false)
      setShowUnsavedDeckDialog(false)
      setPendingTabSwitch(null)
      setTab(nextTab)
    } catch {
      setMessage("Failed to save deck")
    } finally {
      setSavingUnsavedDeck(false)
    }
  }, [deckDraft, handleSaveDeck, pendingTabSwitch, userId])

  const handleOpenBooster = useCallback(async (offerId: BoosterOffer["id"]) => {
    if (!userId) {
      return {
        cards: [],
        unlockedDeckSlot: false,
      } satisfies BoosterOpenResult
    }
    try {
      const offer = BOOSTER_OFFERS.find((candidate) => candidate.id === offerId)
      const allCards = cards.length > 0 ? cards : await fetchCards()
      const result = await openBoosterWithOffer(userId, allCards, offerId, 2)
      const counts = new Map<string, number>()
      result.cards.forEach((card) => {
        counts.set(card.id, (counts.get(card.id) ?? 0) + 1)
      })
      setRecentlyDroppedCounts(counts)
      await loadData(false)
      setMessage(
        `${t.openBooster}: -${offer?.cost ?? 0} · выпало ${result.cards.length} карт${result.unlockedDeckSlot ? " · +слот колоды" : ""}`,
      )
      return result
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
        const offer = BOOSTER_OFFERS.find((candidate) => candidate.id === offerId)
        const missingCoins = Math.max(0, (offer?.cost ?? 0) - (profile?.coins ?? 0))
        setMessage(`${t.boosterNotEnoughCoins} ${t.boosterNeedMoreCoins} ${missingCoins} ${t.coins.toLowerCase()}.`)
      } else {
        setMessage("Not enough coins or Firestore permissions are missing")
      }
      return {
        cards: [],
        unlockedDeckSlot: false,
      }
    }
  }, [cards, loadData, profile?.coins, t.boosterNeedMoreCoins, t.boosterNotEnoughCoins, t.coins, t.openBooster, userId])

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
      .slice(0, profile?.maxDeckSize ?? 3)
  }, [cards, profile?.maxDeckSize, selectedDeck, userCards])

  const selectedDeckCardIds = useMemo(() => selectedDeckCards.map((card) => card.id), [selectedDeckCards])

  const handleDeckDraftChange = useCallback((name: string, cardIds: string[]) => {
    setDeckDraft((prev) => {
      if (!prev) return { name, cardIds }
      if (prev.name !== name) return { name, cardIds }
      if (prev.cardIds.length !== cardIds.length) return { name, cardIds }
      for (let i = 0; i < cardIds.length; i += 1) {
        if (prev.cardIds[i] !== cardIds[i]) return { name, cardIds }
      }
      return prev
    })
  }, [])

  const ownedCardIds = useMemo(() => new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId)), [userCards])

  const cardsById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards])

  const decksBySlot = useMemo(() => {
    const map = new Map<DeckSlotKey, Deck>()
    for (const deck of decks) {
      if (!deck.slot) continue
      map.set(deck.slot, deck)
    }
    return map
  }, [decks])

  const battleDeckCardsBySlot = useMemo(() => {
    const result = new Map<DeckSlotKey, MewCard[]>()
    for (const slot of DECK_SLOT_KEYS) {
      const deck = decksBySlot.get(slot)
      const prepared = (deck?.cards ?? [])
        .map((id) => cardsById.get(id))
        .filter((card): card is MewCard => !!card)
        .filter((card) => ownedCardIds.has(card.id))
        .slice(0, profile?.maxDeckSize ?? 3)
      result.set(slot, prepared)
    }
    return result
  }, [cardsById, decksBySlot, ownedCardIds, profile?.maxDeckSize])

  const activeBattleDeckCards = useMemo(() => {
    if (!battleDeckSlot) return []
    return battleDeckCardsBySlot.get(battleDeckSlot) ?? []
  }, [battleDeckSlot, battleDeckCardsBySlot])

  const activeBattleDeckName = useMemo(() => {
    if (!battleDeckSlot) return null
    return decksBySlot.get(battleDeckSlot)?.deckName ?? getDefaultDeckName(battleDeckSlot)
  }, [battleDeckSlot, decksBySlot])

  const previewDeckCards = useMemo(() => {
    if (!battleDeckSlot) return []
    return battleDeckCardsBySlot.get(battleDeckSlot) ?? []
  }, [battleDeckCardsBySlot, battleDeckSlot])

  const canStartBattle = !startingBattle
    && !enteringBattle
    && !!battleDeckSlot
    && (battleDeckCardsBySlot.get(battleDeckSlot)?.length ?? 0) > 0

  const scoreCard = useCallback((card: MewCard) => {
    const rarityScore = card.rarity === "legendary" ? 18 : card.rarity === "epic" ? 12 : card.rarity === "rare" ? 7 : 3
    return card.attack + card.health * 0.55 + rarityScore
  }, [])

  const deckPowerBySlot = useMemo(() => {
    const map = new Map<DeckSlotKey, number>()
    for (const slot of DECK_SLOT_KEYS) {
      const deckCards = battleDeckCardsBySlot.get(slot) ?? []
      const score = deckCards.reduce((sum, card) => sum + scoreCard(card), 0)
      map.set(slot, score)
    }
    return map
  }, [battleDeckCardsBySlot, scoreCard])

  const globalDeckPowerBounds = useMemo(() => {
    const deckSize = profile?.maxDeckSize ?? 3
    const allScores = cards.map((card) => scoreCard(card)).filter((v) => Number.isFinite(v))
    if (allScores.length === 0) return { min: 0, max: 0 }

    const sorted = allScores.toSorted((a, b) => a - b)
    const take = Math.max(1, Math.min(deckSize, sorted.length))
    const min = sorted.slice(0, take).reduce((sum, v) => sum + v, 0)
    const max = sorted.slice(sorted.length - take).reduce((sum, v) => sum + v, 0)
    return { min, max }
  }, [cards, profile?.maxDeckSize, scoreCard])

  const computeRewardForDeckScore = useCallback((deckScore: number) => {
    const minScore = globalDeckPowerBounds.min
    const maxScore = globalDeckPowerBounds.max
    if (!(deckScore > 0) || !(minScore > 0) || !(maxScore > 0)) return 200

    const span = maxScore - minScore
    const normalizedRaw = span > 0 ? (deckScore - minScore) / span : 0.5
    const normalized = Math.max(0, Math.min(1, normalizedRaw))
    return Math.max(50, Math.min(200, Math.round(200 - normalized * 150)))
  }, [globalDeckPowerBounds.max, globalDeckPowerBounds.min])

  const battleRewardRange = useMemo(() => {
    if (!battleDeckSlot) return { min: 50, max: 50 }
    const selectedScore = deckPowerBySlot.get(battleDeckSlot) ?? 0

    const reward = computeRewardForDeckScore(selectedScore)
    return { min: reward, max: reward }
  }, [battleDeckSlot, computeRewardForDeckScore, deckPowerBySlot])

  const deckBuilderPotentialReward = useMemo(() => {
    const currentScore = deckPowerBySlot.get(selectedDeckSlot) ?? 0
    return computeRewardForDeckScore(currentScore)
  }, [computeRewardForDeckScore, selectedDeckSlot, deckPowerBySlot])

  const saveBattle = useCallback(async (winnerId: string, bossId: string, log: BattleLogEntry[], hpBonus = 0) => {
    if (!userId) return 0

    const didWin = winnerId === "player"
    const baseReward = didWin ? pendingBattleWinReward : 0
    const totalReward = baseReward + (didWin ? hpBonus : 0)
    setSavingGameState(true)
    try {
      const settled = await awardBattleCoins(userId, didWin, totalReward)

      await saveBattleLog({
        player1Id: userId,
        bossId,
        winnerId,
        rewardCoins: settled,
        log,
        createdAt: Date.now(),
      })

      await syncLeaderboardAfterBattle(userId, user?.email ?? undefined)

      if (didWin && hpBonus > 0) {
        setMessage(`${t.battleSavedWin}: +${settled} (${t.battleBase}: ${baseReward} + ${t.battleHpBonus}: +${hpBonus})`)
      } else {
        setMessage(`${didWin ? t.battleSavedWin : t.battleSavedLoss}: +${settled}`)
      }
      return settled
    } catch {
      setMessage(didWin
        ? `${t.battleSavedWin}: +${totalReward}`
        : t.battleSavedLoss)
      return totalReward
    } finally {
      setSavingGameState(false)
    }
  }, [pendingBattleWinReward, t.battleBase, t.battleHpBonus, t.battleSavedLoss, t.battleSavedWin, user?.email, userId])

  const playerPower = useMemo(() => {
    if (!profile) return 0
    const winsFactor = profile.wins / 8
    const streakFactor = profile.streak / 4
    const earnedBeyondStart = Math.max(0, profile.totalEarned - 500)
    const economyFactor = Math.log10(earnedBeyondStart + 1) * 0.9
    return Math.max(0, Math.min(10, winsFactor + streakFactor + economyFactor))
  }, [profile])

  // Банкротство: следим за профилем и картами, показываем предупреждение когда бой завершён
  useEffect(() => {
    if (!profile || loadingData) return
    if (battleStage !== "idle") return
    const canAfford = profile.coins >= BATTLE_ENTRY_COST
    const canSell = userCards.some((c) => c.quantity > 1)
    setShowBankruptcyWarning(!canAfford && !canSell)
  }, [profile, userCards, battleStage, loadingData])

  const handleReset = useCallback(async () => {
    if (!userId) return
    setResetting(true)
    try {
      await resetUserToInitialState(userId)
      setShowBankruptcyWarning(false)
      setBattleStage("idle")
      setBattleBoss(null)
      setBattleDeckSlot(null)
      setPreviewDeckSlot(null)
      setRecentlyDroppedCounts(new Map())
      await loadData()
      setMessage(t.battleHistoryCleared)
    } finally {
      setResetting(false)
    }
  }, [loadData, t.battleHistoryCleared, userId])

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true)
    try {
      const entries = await fetchLeaderboard(25)
      setLeaderboard(entries)
    } finally {
      setLeaderboardLoading(false)
    }
  }, [])

  const handleEnterBattle = async () => {
    if (!userId) return
    setEnteringBattle(true)
    try {
      await payBattleEntry(userId, BATTLE_ENTRY_COST)
    } catch {
      setMessage(`Недостаточно монет: нужно ${BATTLE_ENTRY_COST}`)
      setShowBankruptcyWarning(true)
      setEnteringBattle(false)
      return
    }

    try {
      const randomBoss = pickRandomBoss(lastBattleBossId ?? undefined)
      const scaledBoss = scaleBossForPlayer(randomBoss, playerPower)

      await loadData(false)
      setBattleBoss(scaledBoss)
      setLastBattleBossId(randomBoss.id)
      setBattleDeckSlot(null)
      setPreviewDeckSlot(null)
      setShowBankruptcyWarning(false)
      setBattleStage("preparing")
      setBattleSessionId((id) => id + 1)
      setTab("battle")
    } finally {
      setEnteringBattle(false)
    }
  }

  const handleStartBattle = async () => {
    if (!battleDeckSlot) return
    if ((battleDeckCardsBySlot.get(battleDeckSlot) ?? []).length === 0) return
    setStartingBattle(true)
    try {
      const winReward = Math.floor(Math.random() * (battleRewardRange.max - battleRewardRange.min + 1)) + battleRewardRange.min
      setPendingBattleWinReward(winReward)
      await loadData()
      setBattleStage("fighting")
    } finally {
      setStartingBattle(false)
    }
  }

  const handleBattleResolved = () => {
    setBattleStage("idle")
    setBattleBoss(null)
    setBattleDeckSlot(null)
    setPreviewDeckSlot(null)
    void loadData(false)
  }

  if (loading) {
    return (
      <CardDesignProvider variant={cardDesign} setVariant={setCardDesign}>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <PawLoader label={t.loadingData} size="lg" />
        </div>
      </CardDesignProvider>
    )
  }

  if (!user && !isGuest) {
    return (
      <CardDesignProvider variant={cardDesign} setVariant={setCardDesign}>
        <AuthScreen />
      </CardDesignProvider>
    )
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
    <CardDesignProvider variant={cardDesign} setVariant={setCardDesign}>
    <div className="min-h-screen bg-background">
      {globalLoaderLabel ? <PawLoader overlay size="lg" label={globalLoaderLabel} /> : null}

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
            <LanguageToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuItem disabled className="cursor-default opacity-90 focus:bg-transparent">
                  <div className="flex flex-col gap-0.5">
                    {profile?.nickname && (
                      <span className="font-semibold text-foreground">{profile.nickname}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{user?.email ?? "Guest"}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {userId && (
                  <DropdownMenuItem onSelect={() => { void loadLeaderboard(); setShowLeaderboard(true) }}>
                    <Trophy className="h-4 w-4" />
                    {t.leaderboard}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t.cardDesign}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={cardDesign} onValueChange={(value) => setCardDesign(normalizeCardDesign(value))}>
                  <DropdownMenuRadioItem value="classic">{t.cardDesignClassic}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="storybook">{t.cardDesignStorybook}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => { void handleInstallGame() }}>
                  <Download className="h-4 w-4" />
                  {pwaInstalled ? t.reinstallGame : t.installGame}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {userId && (
                  <DropdownMenuItem variant="destructive" onSelect={() => setShowResetDialog(true)}>
                    <RotateCcw className="h-4 w-4" />
                    {t.resetToInitial}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowVersionHistory(true)}>
                  v{APP_VERSION}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {showBankruptcyWarning && (
          <Card className="p-3 border-rose-500/50 bg-rose-500/10 space-y-2">
            <p className="text-sm text-rose-200">{t.bankruptcyWarning}</p>
            <Button
              size="sm"
              variant="destructive"
              disabled={resetting}
              onClick={handleReset}
              className="w-full"
            >
              {resetting ? (
                <>
                  <PawLoader size="sm" />
                  {t.bankruptcyReset}
                </>
              ) : t.bankruptcyReset}
            </Button>
          </Card>
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
                onClick={() => {
                  void handleTabChange(item.key)
                }}
                disabled={battleLocked && item.key !== "battle"}
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
          <Card className="p-8 border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5">
            <PawLoader label={t.loadingData} size="lg" />
          </Card>
        ) : (
          <>
            {tab === "collection" && (
              <CardCollection
                cards={cards}
                userCards={userCards}
                recentlyAddedCardCounts={recentlyDroppedCounts}
                onSellCard={handleSellCard}
                sellingCardId={sellingCardId}
                getSellPrice={getCardSellPrice}
              />
            )}
            {tab === "deck" && userId && (
              <DeckBuilder
                cards={cards}
                userCards={userCards}
                maxDeckSize={profile?.maxDeckSize ?? 3}
                deckButtons={[
                  { slot: "deck1", label: t.deckOne },
                  { slot: "deck2", label: t.deckTwo },
                  { slot: "deck3", label: t.deckThree },
                ]}
                selectedDeckSlot={selectedDeckSlot}
                initialDeckName={selectedDeck?.deckName ?? getDefaultDeckName(selectedDeckSlot)}
                initialDeckCardIds={selectedDeckCardIds}
                onSelectDeckSlot={setSelectedDeckSlot}
                onSaveDeck={handleSaveDeck}
                onDraftChange={handleDeckDraftChange}
                onDirtyChange={setDeckDirty}
                potentialReward={deckBuilderPotentialReward}
              />
            )}
            {tab === "boosters" && userId && (
              <BoosterShop
                onOpen={handleOpenBooster}
                onInsufficientCoins={(offer: BoosterOffer) => {
                  const missingCoins = Math.max(0, offer.cost - (profile?.coins ?? 0))
                  setMessage(`${t.boosterNotEnoughCoins} ${t.boosterNeedMoreCoins} ${missingCoins} ${t.coins.toLowerCase()}.`)
                }}
                currentCoins={profile?.coins ?? 0}
                offers={localizedBoosterOffers}
              />
            )}
            {tab === "battle" && userId && (
              <div className="space-y-4">
                <Card className="p-4 space-y-3">
                  <style>{`
                    @keyframes battle-deck-choice-glow {
                      0%, 100% {
                        box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.18), inset 0 0 0 1px rgba(251, 191, 36, 0.18);
                        border-color: rgba(251, 191, 36, 0.28);
                        background: rgba(251, 191, 36, 0.04);
                      }
                      50% {
                        box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.06), 0 0 28px rgba(251, 191, 36, 0.22), inset 0 0 0 1px rgba(253, 224, 71, 0.42);
                        border-color: rgba(253, 224, 71, 0.55);
                        background: rgba(251, 191, 36, 0.1);
                      }
                    }
                    @keyframes battle-deck-choice-chip {
                      0%, 100% {
                        box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.18);
                        transform: translateY(0);
                      }
                      50% {
                        box-shadow: 0 0 18px rgba(251, 191, 36, 0.28);
                        transform: translateY(-1px);
                      }
                    }
                    @keyframes battle-action-button-glow {
                      0%, 100% {
                        box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.18), 0 10px 24px rgba(0, 0, 0, 0.12);
                        filter: saturate(1);
                      }
                      50% {
                        box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.08), 0 0 24px rgba(250, 204, 21, 0.24), 0 14px 30px rgba(0, 0, 0, 0.16);
                        filter: saturate(1.06);
                      }
                    }
                    .battle-deck-choice-glow {
                      animation: battle-deck-choice-glow 1.45s ease-in-out infinite;
                    }
                    .battle-deck-choice-chip {
                      animation: battle-deck-choice-chip 1.2s ease-in-out infinite;
                    }
                    .battle-action-button-glow {
                      animation: battle-action-button-glow 1.55s ease-in-out infinite;
                    }
                  `}</style>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{t.battleArena}</h2>
                      <p className="text-sm text-muted-foreground">
                        {battleLocked ? t.battleLockedHint : t.battleEnterHint}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={canEnterBattle ? "battle-action-button-glow rounded-full" : "rounded-full"}
                      onClick={() => void handleEnterBattle()}
                      disabled={battleLocked || enteringBattle || startingBattle}
                    >
                      {enteringBattle ? (
                        <>
                          <PawLoader size="sm" />
                          {t.enteringBattle}
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          {t.enterBattle}
                        </>
                      )}
                    </Button>
                  </div>

                  {battleStage === "preparing" && battleBoss && (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <BattleFighterCard
                          fighter={battleBoss}
                          role="boss"
                          isDead={false}
                          className="w-[170px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">{t.chooseBattleDeck}</p>
                        <div className={waitingForBattleDeckChoice ? "battle-deck-choice-glow space-y-2 rounded-2xl border p-3" : "space-y-2"}>
                          {DECK_SLOT_KEYS.map((slotKey) => {
                            const slotDeck = decksBySlot.get(slotKey)
                            const availableCards = battleDeckCardsBySlot.get(slotKey)?.length ?? 0
                            const isSelected = battleDeckSlot === slotKey
                            const shouldHighlightChoice = waitingForBattleDeckChoice && availableCards > 0 && !isSelected
                            return (
                              <div key={slotKey} className="space-y-1">
                                <Button
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  className={shouldHighlightChoice ? "battle-deck-choice-chip rounded-full" : "rounded-full"}
                                  disabled={availableCards === 0}
                                  onClick={() => setBattleDeckSlot((prev) => prev === slotKey ? null : slotKey)}
                                >
                                  {(slotDeck?.deckName ?? getDefaultDeckName(slotKey))} ({availableCards})
                                </Button>
                                {isSelected && previewDeckCards.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-card/40 p-2">
                                    {previewDeckCards.map((card, idx) => (
                                      <MewCardFace key={`preview-${slotKey}-${card.id}-${idx}`} card={card} compact className="max-w-[130px]" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {battleDeckSlot && (battleDeckCardsBySlot.get(battleDeckSlot)?.length ?? 0) > 0 && (
                          <div className="space-y-0.5">
                            <p className="text-sm text-muted-foreground">
                              {t.battleReward}: {battleRewardRange.min} + {t.battleHpBonus} · {t.battleBase} {BATTLE_ENTRY_COST} {t.coins}
                            </p>
                            <p className="text-xs text-muted-foreground/60">{t.rewardInverseTip}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className={canStartBattle ? "battle-action-button-glow rounded-full" : "rounded-full"}
                          onClick={handleStartBattle}
                          disabled={!canStartBattle}
                        >
                          {startingBattle ? (
                            <>
                              <PawLoader size="sm" />
                              {t.startBattle}
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              {t.startBattle}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {battleStage === "fighting" && battleBoss && battleDeckSlot && activeBattleDeckCards.length > 0 && (
                  <>
                    <Card className="p-4 bg-card/80 border-border">
                      <div className="space-y-2 text-center">
                        <p className="text-sm italic text-foreground/90 leading-relaxed">{catCodexQuote}</p>
                        <p className="text-xs text-muted-foreground/70">— {t.catCodexAttribution}</p>
                      </div>
                    </Card>
                    <BattleArena
                      key={`${battleSessionId}-${battleBoss.id}-${battleDeckSlot}`}
                      deckCards={activeBattleDeckCards}
                      onSaveBattle={saveBattle}
                      deckName={activeBattleDeckName ?? getDefaultDeckName(battleDeckSlot)}
                      predictedWinRewardBase={pendingBattleWinReward}
                      initialBoss={battleBoss}
                      showResetButton={false}
                      onBattleResolved={handleBattleResolved}
                    />
                  </>
                )}
              </div>
            )}
            {tab === "help" && <HelpPanel />}
          </>
        )}
      </main>

      {/* Reset Dialog */}
      {userId && (
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="max-w-sm border-rose-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <DialogHeader>
              <DialogTitle className="text-rose-200">{t.resetConfirmTitle}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-300/80">{t.resetConfirmDesc}</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowResetDialog(false)}>Отмена</Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={resetting}
                onClick={async () => { await handleReset(); setShowResetDialog(false) }}
              >
                {resetting ? (
                  <>
                    <PawLoader size="sm" />
                    {t.resetToInitial}
                  </>
                ) : t.resetToInitial}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Leaderboard Dialog */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="max-w-lg border-amber-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <DialogHeader>
            <DialogTitle className='font-["Trebuchet_MS","Verdana",sans-serif] text-amber-100'>{t.leaderboardTitle}</DialogTitle>
          </DialogHeader>
          {leaderboardLoading ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <PawLoader label={t.loadingData} size="md" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.leaderboardEmpty}</p>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground">
                    <th className="py-1 text-left font-medium">#</th>
                    <th className="py-1 text-left font-medium">{t.lbColNickname}</th>
                    <th className="py-1 text-right font-medium">{t.lbColScore}</th>
                    <th className="py-1 text-right font-medium">{t.lbColCards}</th>
                    <th className="py-1 text-right font-medium">{t.lbColDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr
                      key={entry.userId}
                      className={`border-b border-border/20 ${entry.userId === userId ? "font-semibold text-amber-300" : ""}`}
                    >
                      <td className="py-1 text-muted-foreground">{idx + 1}</td>
                      <td className="py-1">{entry.nickname}</td>
                      <td className="py-1 text-right">{entry.scoreCoins}</td>
                      <td className="py-1 text-right">{entry.cardCount}</td>
                      <td className="py-1 text-right text-xs text-muted-foreground">
                        {entry.updatedAtMs ? new Date(entry.updatedAtMs).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <VersionHistoryDialog open={showVersionHistory} onOpenChange={setShowVersionHistory} />

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.pwaInstallTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{installDialogMessage}</p>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setShowInstallDialog(false)}>{t.close}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-sm border-amber-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <DialogHeader>
            <DialogTitle className="text-amber-100">{t.pwaUpdateTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-200/85">
            <p>{t.pwaUpdateBody}</p>
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-100/90">
              <p>{t.pwaCurrentVersion}: v{APP_VERSION}</p>
              <p>{t.pwaLatestVersion}: v{availableVersion ?? APP_VERSION}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setShowVersionHistory(true)}>{t.whatsNew}</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowUpdateDialog(false)}>{t.pwaUpdateLater}</Button>
            <Button size="sm" onClick={() => void handleApplyUpdate()} disabled={applyingUpdate}>
              {applyingUpdate ? t.loadingData : t.pwaInstallUpdate}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UnsavedDeckDialog
        open={showUnsavedDeckDialog}
        onOpenChange={(open) => {
          setShowUnsavedDeckDialog(open)
          if (!open) setPendingTabSwitch(null)
        }}
        title={t.deckUnsavedTitle}
        description={t.deckUnsavedDesc}
        stayLabel={t.deckUnsavedStay}
        discardLabel={t.deckUnsavedDiscard}
        saveLabel={t.deckUnsavedSave}
        saving={savingUnsavedDeck}
        onStay={handleUnsavedStay}
        onDiscard={handleUnsavedDiscard}
        onSave={() => void handleUnsavedSave()}
      />
    </div>
    </CardDesignProvider>
  )
}
