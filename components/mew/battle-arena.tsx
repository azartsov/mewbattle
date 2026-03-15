"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { calculateTurn, rollAbilityProcs } from "@/lib/mew-engine"
import type { BattleLogEntry, FighterCard, MewCard } from "@/lib/mew-types"
import { BattleFighterCard } from "@/components/mew/battle-fighter-card"
import { useMewI18n } from "@/lib/mew-i18n"

interface BattleArenaProps {
  deckCards: MewCard[]
  onSaveBattle: (winnerId: string, log: BattleLogEntry[]) => Promise<void>
  deckName: string
}

const BOSS: FighterCard = {
  id: "boss_raven",
  name: "Evil Raven",
  attack: 14,
  health: 180,
  currentHealth: 180,
  ability: "Ninja dodge and mage shield",
  imageUrl: "/bosses/evil_raven.svg",
}

function toFighter(card: MewCard): FighterCard {
  return {
    id: card.id,
    name: card.name,
    attack: card.attack,
    health: card.health,
    currentHealth: card.health,
    ability: card.ability,
    imageUrl: card.imageUrl,
  }
}

function buildFighters(deckCards: MewCard[]): FighterCard[] {
  return deckCards.map((card, index) => {
    const fighter = toFighter(card)
    return {
      ...fighter,
      id: `${card.id}__${index}`,
    }
  })
}

interface PendingBossTurn {
  turn: number
  bossSnapshot: FighterCard
  nextLog: BattleLogEntry[]
}

export function BattleArena({ deckCards, onSaveBattle, deckName }: BattleArenaProps) {
  const { t } = useMewI18n()
  const [fighters, setFighters] = useState<FighterCard[]>(buildFighters(deckCards))
  const [boss, setBoss] = useState<FighterCard>(BOSS)
  const [log, setLog] = useState<BattleLogEntry[]>([])
  const [turn, setTurn] = useState(1)
  const [saving, setSaving] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [tapSelectedAllyId, setTapSelectedAllyId] = useState<string | null>(null)
  const [pendingBossTurn, setPendingBossTurn] = useState<PendingBossTurn | null>(null)

  const aliveFighters = useMemo(() => fighters.filter((f) => f.currentHealth > 0), [fighters])
  const battleOver = boss.currentHealth <= 0 || aliveFighters.length === 0

  const attackWith = async (cardId: string) => {
    if (battleOver || pendingBossTurn) return

    const attacker = fighters.find((f) => f.id === cardId)
    if (!attacker || attacker.currentHealth <= 0) return

    const playerTurn = calculateTurn(attacker, boss, rollAbilityProcs())
    const bossAfter = { ...boss, currentHealth: playerTurn.defenderHealth }
    const fightersAfterPlayer = fighters.map((f) =>
      f.id === attacker.id ? { ...f, currentHealth: playerTurn.attackerHealth } : f,
    )

    const nextLog: BattleLogEntry[] = [
      ...log,
      {
        turn,
        actor: "player",
        text: playerTurn.text,
        damage: playerTurn.damage,
      },
    ]

    setFighters(fightersAfterPlayer)
    setBoss(bossAfter)
    setLog(nextLog)
    setTapSelectedAllyId(null)
    setDraggedId(null)

    if (bossAfter.currentHealth <= 0) {
      setTurn((t) => t + 1)
      setSaving(true)
      try {
        await onSaveBattle("player", nextLog)
      } finally {
        setSaving(false)
      }
      return
    }

    setPendingBossTurn({
      turn,
      bossSnapshot: bossAfter,
      nextLog,
    })
  }

  const resolveBossTurn = async (targetId: string) => {
    if (!pendingBossTurn || battleOver) return

    const target = fighters.find((f) => f.id === targetId)
    if (!target || target.currentHealth <= 0) return

    const bossTurn = calculateTurn(pendingBossTurn.bossSnapshot, target, rollAbilityProcs())
    const updatedFighters = fighters.map((f) =>
      f.id === target.id ? { ...f, currentHealth: bossTurn.defenderHealth } : f,
    )

    const finalLog = [
      ...pendingBossTurn.nextLog,
      {
        turn: pendingBossTurn.turn,
        actor: "boss" as const,
        text: bossTurn.text,
        damage: bossTurn.damage,
      },
    ]

    setFighters(updatedFighters)
    setLog(finalLog)
    setPendingBossTurn(null)
    setTurn((t) => t + 1)
    setTapSelectedAllyId(null)
    setDraggedId(null)

    if (updatedFighters.every((f) => f.currentHealth <= 0)) {
      setSaving(true)
      try {
        await onSaveBattle("boss", finalLog)
      } finally {
        setSaving(false)
      }
    }
  }

  const autoResolveBossTurn = async () => {
    const aliveTargets = fighters.filter((f) => f.currentHealth > 0)
    if (aliveTargets.length === 0) return
    const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)]
    await resolveBossTurn(target.id)
  }

  const reset = () => {
    setFighters(buildFighters(deckCards))
    setBoss(BOSS)
    setLog([])
    setTurn(1)
    setPendingBossTurn(null)
    setDraggedId(null)
    setTapSelectedAllyId(null)
  }

  const handleBossTap = () => {
    if (battleOver) return

    if (pendingBossTurn) {
      setDraggedId("boss")
      return
    }

    if (tapSelectedAllyId) {
      void attackWith(tapSelectedAllyId)
    }
  }

  const handleAllyTap = (fighter: FighterCard) => {
    if (battleOver || fighter.currentHealth <= 0) return

    if (pendingBossTurn) {
      void resolveBossTurn(fighter.id)
      return
    }

    setTapSelectedAllyId(fighter.id)
    setDraggedId(fighter.id)
  }

  return (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">{t.battleArena}</h3>
            <p className="text-xs text-muted-foreground">{t.selectedBattleDeck}: {deckName}</p>
          </div>
          <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium">
            {pendingBossTurn ? t.bossTurn : t.yourTurn}
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {pendingBossTurn ? t.dragOrTapBoss : t.dragOrTapPlayer}
        </p>

        <div className="flex flex-col items-center gap-3">
          <BattleFighterCard
            fighter={boss}
            role="boss"
            isDead={boss.currentHealth <= 0}
            draggable={!!pendingBossTurn && !battleOver}
            droppable={!pendingBossTurn && !battleOver}
            highlighted={draggedId !== null && !pendingBossTurn && !battleOver}
            onDragStart={() => setDraggedId("boss")}
            onTap={handleBossTap}
            onDrop={() => {
              if (draggedId && draggedId !== "boss") {
                void attackWith(draggedId)
              }
              setDraggedId(null)
            }}
          />

          {pendingBossTurn && !battleOver && (
            <Button size="sm" variant="secondary" onClick={() => void autoResolveBossTurn()}>
              {t.autoTargetBoss}
            </Button>
          )}

          <div className="flex w-full flex-wrap items-start justify-center gap-2">
            {fighters.map((fighter) => (
              <BattleFighterCard
                key={fighter.id}
                fighter={fighter}
                role="ally"
                isDead={fighter.currentHealth <= 0}
                draggable={!pendingBossTurn && !battleOver && fighter.currentHealth > 0}
                droppable={!!pendingBossTurn && !battleOver}
                highlighted={(draggedId === "boss" && !!pendingBossTurn) || tapSelectedAllyId === fighter.id}
                onDragStart={() => setDraggedId(fighter.id)}
                onTap={() => handleAllyTap(fighter)}
                onDrop={() => {
                  if (pendingBossTurn && draggedId === "boss") {
                    void resolveBossTurn(fighter.id)
                  }
                  setDraggedId(null)
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {battleOver && (
        <Card className="p-3 border-primary/40">
          <p className="font-semibold">{boss.currentHealth <= 0 ? t.victory : t.defeat}</p>
          <Button className="mt-2" onClick={reset} disabled={saving}>{t.newBattle}</Button>
        </Card>
      )}

      <Card className="p-3">
        <h3 className="font-semibold mb-2">{t.battleLog}</h3>
        <div className="max-h-[240px] overflow-auto space-y-1 text-sm">
          {log.map((entry, idx) => (
            <p key={`${entry.turn}-${idx}`} className={entry.actor === "player" ? "text-primary" : "text-amber-300"}>
              Turn {entry.turn}: {entry.text}
            </p>
          ))}
          {log.length === 0 && <p className="text-muted-foreground">{t.startFight}</p>}
        </div>
      </Card>
    </div>
  )
}
