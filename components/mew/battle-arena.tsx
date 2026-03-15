"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { calculateTurn, rollAbilityProcs } from "@/lib/mew-engine"
import type { BattleLogEntry, FighterCard, MewCard } from "@/lib/mew-types"

interface BattleArenaProps {
  deckCards: MewCard[]
  onSaveBattle: (winnerId: string, log: BattleLogEntry[]) => Promise<void>
}

const BOSS: FighterCard = {
  id: "boss_raven",
  name: "Evil Raven",
  attack: 14,
  health: 180,
  currentHealth: 180,
  ability: "Ninja dodge and mage shield",
}

function toFighter(card: MewCard): FighterCard {
  return {
    id: card.id,
    name: card.name,
    attack: card.attack,
    health: card.health,
    currentHealth: card.health,
    ability: card.ability,
  }
}

export function BattleArena({ deckCards, onSaveBattle }: BattleArenaProps) {
  const [fighters, setFighters] = useState<FighterCard[]>(deckCards.map(toFighter))
  const [boss, setBoss] = useState<FighterCard>(BOSS)
  const [log, setLog] = useState<BattleLogEntry[]>([])
  const [turn, setTurn] = useState(1)
  const [saving, setSaving] = useState(false)

  const aliveFighters = useMemo(() => fighters.filter((f) => f.currentHealth > 0), [fighters])
  const battleOver = boss.currentHealth <= 0 || aliveFighters.length === 0

  const attackWith = async (cardId: string) => {
    if (battleOver) return

    const attacker = fighters.find((f) => f.id === cardId)
    if (!attacker || attacker.currentHealth <= 0) return

    const playerTurn = calculateTurn(attacker, boss, rollAbilityProcs())
    const bossAfter = { ...boss, currentHealth: playerTurn.defenderHealth }

    const nextLog: BattleLogEntry[] = [
      ...log,
      {
        turn,
        actor: "player",
        text: playerTurn.text,
        damage: playerTurn.damage,
      },
    ]

    if (bossAfter.currentHealth <= 0) {
      setBoss(bossAfter)
      setLog(nextLog)
      setTurn((t) => t + 1)
      setSaving(true)
      try {
        await onSaveBattle("player", nextLog)
      } finally {
        setSaving(false)
      }
      return
    }

    const bossTarget = aliveFighters[Math.floor(Math.random() * aliveFighters.length)]
    const bossTurn = calculateTurn({ ...bossAfter }, bossTarget, rollAbilityProcs())
    const updatedFighters = fighters.map((f) => {
      if (f.id === bossTarget.id) {
        return { ...f, currentHealth: bossTurn.defenderHealth }
      }
      if (f.id === attacker.id) {
        return { ...f, currentHealth: playerTurn.attackerHealth }
      }
      return f
    })

    setFighters(updatedFighters)
    setBoss({ ...bossAfter, currentHealth: bossAfter.currentHealth })
    setLog([
      ...nextLog,
      {
        turn,
        actor: "boss",
        text: bossTurn.text,
        damage: bossTurn.damage,
      },
    ])
    setTurn((t) => t + 1)

    if (updatedFighters.every((f) => f.currentHealth <= 0)) {
      setSaving(true)
      try {
        await onSaveBattle("boss", [
          ...nextLog,
          {
            turn,
            actor: "boss",
            text: bossTurn.text,
            damage: bossTurn.damage,
          },
        ])
      } finally {
        setSaving(false)
      }
    }
  }

  const reset = () => {
    setFighters(deckCards.map(toFighter))
    setBoss(BOSS)
    setLog([])
    setTurn(1)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-3">
          <h3 className="font-semibold mb-2">Boss</h3>
          <p className="font-medium">{boss.name}</p>
          <p className="text-sm text-muted-foreground">HP: {boss.currentHealth}/{boss.health}</p>
        </Card>
        <Card className="p-3">
          <h3 className="font-semibold mb-2">Your Team</h3>
          <div className="space-y-2">
            {fighters.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 rounded border border-border p-2">
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">HP {f.currentHealth}/{f.health}</p>
                </div>
                <Button size="sm" disabled={battleOver || f.currentHealth <= 0} onClick={() => attackWith(f.id)}>
                  Attack
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {battleOver && (
        <Card className="p-3 border-primary/40">
          <p className="font-semibold">{boss.currentHealth <= 0 ? "Victory!" : "Defeat"}</p>
          <Button className="mt-2" onClick={reset} disabled={saving}>New Battle</Button>
        </Card>
      )}

      <Card className="p-3">
        <h3 className="font-semibold mb-2">Battle Log</h3>
        <div className="max-h-[240px] overflow-auto space-y-1 text-sm">
          {log.map((entry, idx) => (
            <p key={`${entry.turn}-${idx}`} className={entry.actor === "player" ? "text-primary" : "text-amber-300"}>
              Turn {entry.turn}: {entry.text}
            </p>
          ))}
          {log.length === 0 && <p className="text-muted-foreground">Start the fight.</p>}
        </div>
      </Card>
    </div>
  )
}
