"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Pencil, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { MewCard, UserCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { PawLoader } from "@/components/mew/paw-loader"
import { useMewI18n } from "@/lib/mew-i18n"
import type { DeckSlotKey } from "@/lib/mew-firestore"

interface DeckBuilderProps {
  cards: MewCard[]
  userCards: UserCard[]
  maxDeckSize: number
  deckButtons: Array<{
    slot: DeckSlotKey
    label: string
    totalHp: number
    avgAttack: number
    totalValue: number
    potentialReward: number
  }>
  selectedDeckSlot: DeckSlotKey
  initialDeckName: string
  initialDeckCardIds: string[]
  onSelectDeckSlot: (slot: DeckSlotKey) => void
  onSaveDeck: (name: string, cardIds: string[]) => Promise<void>
  onDraftChange?: (name: string, cardIds: string[]) => void
  onDirtyChange?: (isDirty: boolean) => void
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
  onDraftChange,
  onDirtyChange,
}: DeckBuilderProps) {
  const { t } = useMewI18n()
  const [deckName, setDeckName] = useState(initialDeckName)
  const [deck, setDeck] = useState<string[]>(initialDeckCardIds.slice(0, maxDeckSize))
  const [saving, setSaving] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingDeckName, setEditingDeckName] = useState(false)
  const [pendingEditSlot, setPendingEditSlot] = useState<DeckSlotKey | null>(null)

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
    setEditingDeckName(false)
  }, [initialDeckCardIds, initialDeckName, maxDeckSize, userCards])

  useEffect(() => {
    if (pendingEditSlot !== selectedDeckSlot) return
    setEditingDeckName(true)
    setPendingEditSlot(null)
  }, [pendingEditSlot, selectedDeckSlot])

  const ownedCardsById = useMemo(() => new Map(userCards.map((c) => [c.cardId, c.quantity])), [userCards])
  const ownedCardIds = useMemo(() => new Set(userCards.filter((c) => c.quantity > 0).map((c) => c.cardId)), [userCards])
  const ownedCards = useMemo(() => cards.filter((c) => ownedCardIds.has(c.id)), [cards, ownedCardIds])

  const assignCardToSlot = (cardId: string, slotIndex: number) => {
    const maxQty = ownedCardsById.get(cardId) ?? 0
    setDeck((prev) => {
      const next = [...prev]
      const usedElsewhere = next.filter((id, index) => id === cardId && index !== slotIndex).length
      if (usedElsewhere >= maxQty) return prev
      next[slotIndex] = cardId
      return next.slice(0, maxDeckSize)
    })
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    event.preventDefault()
    const cardId = event.dataTransfer.getData("text/plain")
    if (!cardId) return
    assignCardToSlot(cardId, slotIndex)
  }

  const handleTapSlot = (slotIndex: number) => {
    if (!selectedCardId) return
    assignCardToSlot(selectedCardId, slotIndex)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSaveDeck(deckName.trim().slice(0, 10) || "Main Deck", deck.filter(Boolean))
    } finally {
      setSaving(false)
    }
  }

  const handleFinishDeckNameEdit = () => {
    const nextName = deckName.slice(0, 10)
    setEditingDeckName(false)
    setDeckName(nextName)
  }

  const deckCards = deck.map((id) => cards.find((c) => c.id === id) ?? null)
  const draftCardIds = useMemo(() => deck.filter((id): id is string => Boolean(id)), [deck])

  const isDirty = useMemo(() => {
    const initialName = initialDeckName.trim()
    const draftName = deckName.trim()
    if (initialName !== draftName) return true

    if (draftCardIds.length !== initialDeckCardIds.length) return true
    for (let i = 0; i < draftCardIds.length; i += 1) {
      if (draftCardIds[i] !== initialDeckCardIds[i]) return true
    }

    return false
  }, [deckName, draftCardIds, initialDeckCardIds, initialDeckName])

  useEffect(() => {
    onDraftChange?.(deckName, draftCardIds)
  }, [deckName, draftCardIds, onDraftChange])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const selectedDeckLabel = deckName.trim() || deckButtons.find((deckButton) => deckButton.slot === selectedDeckSlot)?.label || deckName
  const selectedDeckMetrics = deckButtons.find((deckButton) => deckButton.slot === selectedDeckSlot)
  const deckCardHeight = 228
  const deckRowGap = 16
  const panelBodyHeight = maxDeckSize * deckCardHeight + Math.max(0, maxDeckSize - 1) * deckRowGap
  const panelHeight = panelBodyHeight + 92
  const deckCardClassName = "w-[142px]"

  const metricLeaders = useMemo(() => {
    const totalHp = Math.max(...deckButtons.map((deckButton) => deckButton.totalHp), 0)
    const avgAttack = Math.max(...deckButtons.map((deckButton) => deckButton.avgAttack), 0)
    const totalValue = Math.max(...deckButtons.map((deckButton) => deckButton.totalValue), 0)
    return { totalHp, avgAttack, totalValue }
  }, [deckButtons])

  const getMetricClassName = (kind: "hp" | "atk" | "value", value: number) => {
    if (kind === "hp") {
      return value > 0 && value === metricLeaders.totalHp
        ? "border-emerald-300/70 bg-emerald-400/25 text-emerald-50 shadow-[0_0_12px_rgba(74,222,128,0.2)]"
        : "border-emerald-500/35 bg-emerald-500/10 text-emerald-100/90"
    }
    if (kind === "atk") {
      return value > 0 && value === metricLeaders.avgAttack
        ? "border-rose-300/70 bg-rose-400/25 text-rose-50 shadow-[0_0_12px_rgba(251,113,133,0.2)]"
        : "border-rose-500/35 bg-rose-500/10 text-rose-100/90"
    }
    return value > 0 && value === metricLeaders.totalValue
      ? "border-sky-300/70 bg-sky-400/25 text-sky-50 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
      : "border-sky-500/35 bg-sky-500/10 text-sky-100/90"
  }

  const getMetricTextClassName = (kind: "hp" | "atk" | "value", value: number) => {
    if (kind === "hp") {
      return value > 0 && value === metricLeaders.totalHp ? "text-emerald-300/80" : "text-slate-400"
    }
    if (kind === "atk") {
      return value > 0 && value === metricLeaders.avgAttack ? "text-rose-300/80" : "text-slate-400"
    }
    return value > 0 && value === metricLeaders.totalValue ? "text-sky-300/80" : "text-slate-400"
  }

  const getRewardTextClassName = (value: number) => {
    const topReward = Math.max(...deckButtons.map((deckButton) => deckButton.potentialReward), 0)
    return value > 0 && value === topReward ? "text-amber-300/80" : "text-slate-400"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.myDeck}</h2>
        </div>
        <Button
          size="icon"
          className={`h-9 w-9 rounded-full ${isDirty && !saving ? "animate-pulse shadow-[0_0_0_1px_rgba(251,191,36,0.55),0_0_18px_rgba(251,191,36,0.28)]" : ""}`}
          onClick={() => void handleSave()}
          disabled={saving || deck.filter(Boolean).length === 0 || !isDirty}
          aria-label={t.saveDeck}
          title={t.saveDeck}
        >
          {saving ? <PawLoader size="sm" /> : <Save className="h-4 w-4" />}
        </Button>
      </div>

      <Card className="p-2 bg-card border-border">
        <div className="space-y-1.5">
          {deckButtons.map((deckButton) => {
            const isSelected = selectedDeckSlot === deckButton.slot
            const isEditing = isSelected && editingDeckName
            const visibleLabel = isSelected ? (deckName.trim() || deckButton.label) : deckButton.label

            return (
              <div key={deckButton.slot} className="flex items-center gap-2 rounded-xl px-1 py-0.5">
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <Input
                      value={deckName}
                      maxLength={10}
                      onChange={(event) => setDeckName(event.target.value.slice(0, 10))}
                      onBlur={() => {
                        handleFinishDeckNameEdit()
                      }}
                      className="h-7 w-[118px] rounded-full px-2 text-[12px]"
                      placeholder={t.deckName}
                      autoFocus
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "secondary"}
                      className="h-7 w-[118px] justify-center rounded-full px-2 text-[12px]"
                      onClick={() => onSelectDeckSlot(deckButton.slot)}
                    >
                      <span className="truncate">{visibleLabel}</span>
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full"
                    onClick={() => {
                      if (!isSelected) {
                        setPendingEditSlot(deckButton.slot)
                        onSelectDeckSlot(deckButton.slot)
                        return
                      }
                      if (isEditing) {
                        handleFinishDeckNameEdit()
                        return
                      }
                      setEditingDeckName(true)
                    }}
                    aria-label={isEditing ? t.saveDeck : t.deckName}
                    title={isEditing ? t.saveDeck : t.deckName}
                  >
                    {isEditing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="min-w-0 flex flex-wrap items-center gap-1 text-[10px] leading-tight sm:text-[11px]">
                  <span className={getMetricTextClassName("hp", deckButton.totalHp)}>HP {deckButton.totalHp}</span>
                  <span className="px-1 text-slate-600">·</span>
                  <span className={getMetricTextClassName("atk", deckButton.avgAttack)}>ATK {deckButton.avgAttack}</span>
                  <span className="px-1 text-slate-600">·</span>
                  <span className={getMetricTextClassName("value", deckButton.totalValue)}>{deckButton.totalValue}</span>
                  <span className="px-1 text-slate-600">·</span>
                  <span className={getRewardTextClassName(deckButton.potentialReward)}>+{deckButton.potentialReward}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 items-start">
        <Card className="min-w-0 p-3 bg-card border-border" style={{ height: `${panelHeight}px` }}>
          <h3 className="mb-2 font-semibold">{t.myCollectionTitle}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{t.deckCollectionHint}</p>
          <div className="flex flex-col gap-5 overflow-y-auto overflow-x-hidden pr-1" style={{ height: `${panelBodyHeight}px` }}>
            {ownedCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
                onClick={() => setSelectedCardId(card.id)}
                className="flex min-h-[228px] shrink-0 items-start justify-center pb-1 cursor-grab active:cursor-grabbing"
              >
                <MewCardFace
                  card={card}
                  owned={ownedCardsById.get(card.id) ?? 0}
                  previewCompact
                  className={selectedCardId === card.id
                    ? `${deckCardClassName} ring-2 ring-amber-400/90 shadow-[0_0_0_1px_rgba(251,191,36,0.42),0_0_24px_rgba(251,191,36,0.28)] animate-pulse`
                    : deckCardClassName
                  }
                />
              </div>
            ))}
            {ownedCards.length === 0 && <p className="text-sm text-muted-foreground">{t.noCardsYet}</p>}
          </div>
        </Card>

        <Card className="min-w-0 p-3 bg-card border-border" style={{ height: `${panelHeight}px` }}>
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{selectedDeckLabel}</h3>
              <p className="mt-1 text-xs text-muted-foreground">max {maxDeckSize}</p>
              {selectedDeckMetrics && (
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap">
                  <span className={`rounded-full border px-2 py-1 text-center text-[10px] font-semibold leading-none ${getMetricClassName("hp", selectedDeckMetrics.totalHp)}`}>HP {selectedDeckMetrics.totalHp}</span>
                  <span className={`rounded-full border px-2 py-1 text-center text-[10px] font-semibold leading-none ${getMetricClassName("atk", selectedDeckMetrics.avgAttack)}`}>ATK {selectedDeckMetrics.avgAttack}</span>
                  <span className={`rounded-full border px-2 py-1 text-center text-[10px] font-semibold leading-none ${getMetricClassName("value", selectedDeckMetrics.totalValue)}`}>{selectedDeckMetrics.totalValue} {t.coins}</span>
                  <span className={`rounded-full border px-2 py-1 text-center text-[10px] font-semibold leading-none border-amber-500/35 bg-amber-500/10 ${getRewardTextClassName(selectedDeckMetrics.potentialReward)}`}>+{selectedDeckMetrics.potentialReward}</span>
                </div>
              )}
              {selectedCardId && (
                <p className="mt-1 text-xs text-muted-foreground">{t.selectedCard}: {cards.find((c) => c.id === selectedCardId)?.name}. {t.tapSlotToPlace}</p>
              )}
            </div>
          </div>
          <div className="space-y-3 pr-1" style={{ height: `${panelBodyHeight}px`, overflow: "hidden" }}>
            {Array.from({ length: maxDeckSize }).map((_, index) => (
              <div
                key={`slot-${index}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, index)}
                onClick={() => handleTapSlot(index)}
                className="rounded-xl border border-dashed border-border bg-secondary/20 p-1.5"
                style={{ minHeight: `${deckCardHeight}px` }}
              >
                {deckCards[index] ? (
                  <div className="flex items-start justify-between gap-2">
                    <MewCardFace card={deckCards[index]} previewCompact className={deckCardClassName} />
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setDeck((prev) => {
                          const next = [...prev]
                          next[index] = ""
                          return next
                        })
                      }}
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
