"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Cat, Skull } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { calculateTurn, rollAbilityProcs } from "@/lib/mew-engine"
import type { BattleLogEntry, FighterCard, MewCard } from "@/lib/mew-types"
import { BattleFighterCard } from "@/components/mew/battle-fighter-card"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_TYPE_LABEL, pickRandomBoss } from "@/lib/mew-bosses"

interface BattleArenaProps {
  deckCards: MewCard[]
  onSaveBattle: (winnerId: string, bossId: string, log: BattleLogEntry[]) => Promise<void>
  deckName: string
  initialBoss?: FighterCard
  showResetButton?: boolean
  onBattleResolved?: () => void
}

function toFighter(card: MewCard): FighterCard {
  return {
    id: card.id,
    entityType: "cat",
    name: card.name,
    attack: card.attack,
    health: card.health,
    currentHealth: card.health,
    ability: card.ability,
    lore: card.lore,
    bossAffinities: card.bossAffinities,
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

interface LightningLine {
  points: string
  color: string
  width: number
  opacity: number
}

interface ActiveLightningFx {
  lines: LightningLine[]
  width: number
  height: number
}

interface DamagePetalFx {
  id: string
  targetId: string
  value: number
}

export function BattleArena({
  deckCards,
  onSaveBattle,
  deckName,
  initialBoss,
  showResetButton = true,
  onBattleResolved,
}: BattleArenaProps) {
  const { t } = useMewI18n()

  const createBoss = useCallback(() => {
    const source = initialBoss ?? pickRandomBoss()
    return {
      ...source,
      currentHealth: source.health,
    }
  }, [initialBoss])

  const [fighters, setFighters] = useState<FighterCard[]>(buildFighters(deckCards))
  const [boss, setBoss] = useState<FighterCard>(() => createBoss())
  const [log, setLog] = useState<BattleLogEntry[]>([])
  const [turn, setTurn] = useState(1)
  const [saving, setSaving] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [tapSelectedAllyId, setTapSelectedAllyId] = useState<string | null>(null)
  const [pendingBossTurn, setPendingBossTurn] = useState<PendingBossTurn | null>(null)
  const [shakeTargetId, setShakeTargetId] = useState<string | null>(null)
  const [flashTargetId, setFlashTargetId] = useState<string | null>(null)
  const [lightningFx, setLightningFx] = useState<ActiveLightningFx | null>(null)
  const [damagePetals, setDamagePetals] = useState<DamagePetalFx[]>([])

  const arenaRef = useRef<HTMLDivElement | null>(null)
  const bossCardRef = useRef<HTMLDivElement | null>(null)
  const allyCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fxTimeoutRef = useRef<number | null>(null)
  const shakeTimeoutRef = useRef<number | null>(null)
  const flashTimeoutRef = useRef<number | null>(null)
  const damagePetalTimeoutsRef = useRef<number[]>([])

  const clearDamagePetalTimeouts = () => {
    damagePetalTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    damagePetalTimeoutsRef.current = []
  }

  const aliveFighters = useMemo(() => fighters.filter((f) => f.currentHealth > 0), [fighters])
  const battleOver = boss.currentHealth <= 0 || aliveFighters.length === 0
  const canExecuteCatTurn = !battleOver && !pendingBossTurn && !!tapSelectedAllyId
  const canExecuteBossTurn = !battleOver && !!pendingBossTurn
  const showTurnPulse = canExecuteBossTurn || canExecuteCatTurn
  const bossTurnActive = !!pendingBossTurn

  useEffect(() => {
    setFighters(buildFighters(deckCards))
    setBoss(createBoss())
    setLog([])
    setTurn(1)
    setPendingBossTurn(null)
    setDraggedId(null)
    setTapSelectedAllyId(null)
    setShakeTargetId(null)
    setFlashTargetId(null)
    setLightningFx(null)
    setDamagePetals([])
  }, [createBoss, deckCards])

  useEffect(() => {
    return () => {
      if (fxTimeoutRef.current) window.clearTimeout(fxTimeoutRef.current)
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current)
      if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current)
      clearDamagePetalTimeouts()
    }
  }, [])

  const spawnDamagePetal = (targetId: string, value: number) => {
    if (value <= 0) return
    const id = `${targetId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    setDamagePetals((prev) => [...prev, { id, targetId, value }])
    const timeoutId = window.setTimeout(() => {
      setDamagePetals((prev) => prev.filter((item) => item.id !== id))
    }, 1250)
    damagePetalTimeoutsRef.current.push(timeoutId)
  }

  const startShake = (targetId: string) => {
    setShakeTargetId(targetId)
    if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current)
    shakeTimeoutRef.current = window.setTimeout(() => {
      setShakeTargetId(null)
    }, 430)
  }

  const startFlash = (targetId: string) => {
    setFlashTargetId(targetId)
    if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current)
    flashTimeoutRef.current = window.setTimeout(() => {
      setFlashTargetId(null)
    }, 220)
  }

  const vibrateHit = (pattern: number | number[]) => {
    if (typeof navigator === "undefined") return
    if (!("vibrate" in navigator)) return
    navigator.vibrate(pattern)
  }

  const catLightningColor = (attackerId: string): string => {
    const baseId = attackerId.split("__")[0]
    if (baseId.includes("dragon")) return "#f59e0b"
    if (baseId.includes("mage")) return "#a78bfa"
    if (baseId.includes("ninja") || baseId.includes("phantom")) return "#22d3ee"
    if (baseId.includes("vampire")) return "#f43f5e"
    if (baseId.includes("berserker")) return "#fb7185"
    if (baseId.includes("alchemist")) return "#34d399"
    return "#60a5fa"
  }

  const toLocalCenter = (el: HTMLElement, container: HTMLElement) => {
    const a = el.getBoundingClientRect()
    const c = container.getBoundingClientRect()
    return {
      x: a.left - c.left + a.width / 2,
      y: a.top - c.top + a.height / 2,
    }
  }

  const makeLightningPoints = (
    source: { x: number; y: number },
    target: { x: number; y: number },
    variance: number,
    steps = 8,
  ) => {
    const dx = target.x - source.x
    const dy = target.y - source.y
    const length = Math.hypot(dx, dy) || 1
    const nx = -dy / length
    const ny = dx / length
    const points: string[] = []

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const baseX = source.x + dx * t
      const baseY = source.y + dy * t
      const wobble = i === 0 || i === steps ? 0 : (Math.random() * 2 - 1) * variance
      points.push(`${baseX + nx * wobble},${baseY + ny * wobble}`)
    }

    return points.join(" ")
  }

  const triggerLightning = (sourceEl: HTMLElement | null, targetEl: HTMLElement | null, color: string, count: number) => {
    const arenaEl = arenaRef.current
    if (!arenaEl || !sourceEl || !targetEl) return

    const source = toLocalCenter(sourceEl, arenaEl)
    const target = toLocalCenter(targetEl, arenaEl)
    const arenaRect = arenaEl.getBoundingClientRect()
    const lines: LightningLine[] = Array.from({ length: count }, (_, idx) => ({
      points: makeLightningPoints(source, target, 8 + idx * 1.5, 8 + (idx % 3)),
      color,
      width: 1.8 + idx * 0.35,
      opacity: 0.95 - idx * 0.12,
    }))

    setLightningFx({
      lines,
      width: arenaRect.width,
      height: arenaRect.height,
    })

    if (fxTimeoutRef.current) window.clearTimeout(fxTimeoutRef.current)
    fxTimeoutRef.current = window.setTimeout(() => {
      setLightningFx(null)
    }, 380)
  }

  const getAffinityBonus = (attacker: FighterCard, bossTarget: FighterCard): { bonusDamage: number; level: number } => {
    if (!bossTarget.bossType) return { bonusDamage: 0, level: 0 }
    const level = attacker.bossAffinities?.find((affinity) => affinity.bossType === bossTarget.bossType)?.level ?? 0
    return {
      bonusDamage: level * 2,
      level,
    }
  }

  const attackWith = async (cardId: string) => {
    if (battleOver || pendingBossTurn) return

    const attacker = fighters.find((f) => f.id === cardId)
    if (!attacker || attacker.currentHealth <= 0) return

    const affinity = getAffinityBonus(attacker, boss)
    const boostedAttacker: FighterCard = {
      ...attacker,
      attack: attacker.attack + affinity.bonusDamage,
    }

    const playerTurn = calculateTurn(boostedAttacker, boss, rollAbilityProcs())
    const affinityText = affinity.level > 0 && boss.bossType
      ? ` (${BOSS_TYPE_LABEL[boss.bossType]} mastery Lv${affinity.level} +${affinity.bonusDamage})`
      : ""
    const bossAfter = { ...boss, currentHealth: playerTurn.defenderHealth }
    const fightersAfterPlayer = fighters.map((f) =>
      f.id === attacker.id ? { ...f, currentHealth: playerTurn.attackerHealth } : f,
    )

    const nextLog: BattleLogEntry[] = [
      ...log,
      {
        turn,
        actor: "player",
        text: `${playerTurn.text}${affinityText}`,
        damage: playerTurn.damage,
      },
    ]

    triggerLightning(allyCardRefs.current[attacker.id], bossCardRef.current, catLightningColor(attacker.id), 4)
    startShake("boss")
    if (playerTurn.damage > 0) {
      startFlash("boss")
      vibrateHit(20)
      spawnDamagePetal("boss", playerTurn.damage)
    }

    setFighters(fightersAfterPlayer)
    setBoss(bossAfter)
    setLog(nextLog)
    setTapSelectedAllyId(null)
    setDraggedId(null)

    if (bossAfter.currentHealth <= 0) {
      setTurn((t) => t + 1)
      setSaving(true)
      try {
        await onSaveBattle("player", boss.id, nextLog)
        onBattleResolved?.()
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

    triggerLightning(bossCardRef.current, allyCardRefs.current[target.id], "#111827", 5)
    startShake(target.id)
    if (bossTurn.damage > 0) {
      startFlash(target.id)
      vibrateHit([16, 24, 16])
      spawnDamagePetal(target.id, bossTurn.damage)
    }

    setFighters(updatedFighters)
    setLog(finalLog)
    setPendingBossTurn(null)
    setTurn((t) => t + 1)
    setTapSelectedAllyId(null)
    setDraggedId(null)

    if (updatedFighters.every((f) => f.currentHealth <= 0)) {
      setSaving(true)
      try {
        await onSaveBattle("boss", boss.id, finalLog)
        onBattleResolved?.()
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
    setBoss(createBoss())
    setLog([])
    setTurn(1)
    setPendingBossTurn(null)
    setDraggedId(null)
    setTapSelectedAllyId(null)
    setDamagePetals([])
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

  const handleTurnButtonClick = () => {
    if (canExecuteBossTurn) {
      void autoResolveBossTurn()
      return
    }

    if (canExecuteCatTurn && tapSelectedAllyId) {
      void attackWith(tapSelectedAllyId)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-3">
        <style>{`
          @keyframes battle-shake {
            0% { transform: translate3d(0, 0, 0); }
            20% { transform: translate3d(-2px, 1px, 0); }
            40% { transform: translate3d(2px, -1px, 0); }
            60% { transform: translate3d(-2px, 0, 0); }
            80% { transform: translate3d(2px, 1px, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          @keyframes impact-flash {
            0% { opacity: 0; }
            35% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes sakura-damage-float {
            0% {
              opacity: 0;
              transform: translate(-50%, 8px) scale(0.9);
            }
            15% {
              opacity: 1;
              transform: translate(-50%, 0px) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -34px) scale(1.02);
            }
          }
          .battle-shake {
            animation: battle-shake 0.42s ease-in-out;
          }
          .battle-impact-flash {
            animation: impact-flash 0.22s ease-out;
          }
          .battle-damage-petal {
            animation: sakura-damage-float 1.2s ease-out forwards;
          }
          @keyframes turn-cta-pulse-rose {
            0%, 100% {
              opacity: 1;
              box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.42);
            }
            50% {
              opacity: 0.72;
              box-shadow: 0 0 0 8px rgba(244, 63, 94, 0);
            }
          }
          @keyframes turn-cta-pulse-sky {
            0%, 100% {
              opacity: 1;
              box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.42);
            }
            50% {
              opacity: 0.72;
              box-shadow: 0 0 0 8px rgba(14, 165, 233, 0);
            }
          }
          .turn-cta-pulse-rose {
            animation: turn-cta-pulse-rose 1.05s ease-in-out infinite;
          }
          .turn-cta-pulse-sky {
            animation: turn-cta-pulse-sky 1.05s ease-in-out infinite;
          }
        `}</style>
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

        <div ref={arenaRef} className="relative flex flex-col items-center gap-3">
          {lightningFx && (
            <svg
              className="pointer-events-none absolute inset-0 z-30"
              viewBox={`0 0 ${Math.max(1, lightningFx.width)} ${Math.max(1, lightningFx.height)}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {lightningFx.lines.map((line, idx) => (
                <polyline
                  key={idx}
                  points={line.points}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={line.opacity}
                />
              ))}
            </svg>
          )}

          <div ref={bossCardRef} className={`relative ${shakeTargetId === "boss" ? "battle-shake" : ""}`}>
            {damagePetals
              .filter((petal) => petal.targetId === "boss")
              .map((petal) => (
                <span
                  key={petal.id}
                  className="battle-damage-petal pointer-events-none absolute left-1/2 top-0 z-50 inline-flex items-center rounded-full border border-pink-300/65 bg-pink-300/25 px-2 py-0.5 text-xs font-semibold text-pink-100 backdrop-blur"
                >
                  -{petal.value}
                </span>
              ))}
            {flashTargetId === "boss" && (
              <div className="battle-impact-flash pointer-events-none absolute inset-0 z-40 rounded-xl bg-white/60" />
            )}
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
          </div>

          <div className={`flex w-full max-w-xl items-center gap-2 rounded-lg border px-2 py-1 ${bossTurnActive ? "border-rose-400/35 bg-rose-500/10" : "border-sky-400/35 bg-sky-500/10"}`}>
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${bossTurnActive ? "border-rose-300/55 bg-rose-400/20 text-rose-100" : "border-border/50 bg-background/40 text-muted-foreground"}`}>
              <Skull className="h-3.5 w-3.5" />
            </span>
            <div className={`h-[2px] flex-1 ${bossTurnActive ? "bg-gradient-to-r from-transparent via-rose-300/80 to-rose-300/55" : "bg-gradient-to-r from-transparent via-sky-300/75 to-sky-300/50"}`} />
            <Button
              size="sm"
              variant="secondary"
              className={`h-8 rounded-full border px-4 text-xs font-semibold text-white ${bossTurnActive ? "border-rose-300/55 bg-rose-500/80 hover:bg-rose-500/90" : "border-sky-300/55 bg-sky-500/80 hover:bg-sky-500/90"} ${showTurnPulse ? (bossTurnActive ? "turn-cta-pulse-rose" : "turn-cta-pulse-sky") : ""}`}
              disabled={!canExecuteBossTurn && !canExecuteCatTurn}
              onClick={handleTurnButtonClick}
            >
              {pendingBossTurn ? t.bossTurnCta : t.catsTurnCta}
            </Button>
            <div className={`h-[2px] flex-1 ${bossTurnActive ? "bg-gradient-to-l from-transparent via-rose-300/80 to-rose-300/55" : "bg-gradient-to-l from-transparent via-sky-300/75 to-sky-300/50"}`} />
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${bossTurnActive ? "border-border/50 bg-background/40 text-muted-foreground" : "border-sky-300/55 bg-sky-400/20 text-sky-100"}`}>
              <Cat className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="flex w-full flex-wrap items-start justify-center gap-2">
            {fighters.map((fighter) => (
              <div
                key={fighter.id}
                ref={(el) => {
                  allyCardRefs.current[fighter.id] = el
                }}
                className={`relative ${shakeTargetId === fighter.id ? "battle-shake" : ""}`}
              >
                {damagePetals
                  .filter((petal) => petal.targetId === fighter.id)
                  .map((petal) => (
                    <span
                      key={petal.id}
                      className="battle-damage-petal pointer-events-none absolute left-1/2 top-0 z-50 inline-flex items-center rounded-full border border-pink-300/65 bg-pink-300/25 px-2 py-0.5 text-xs font-semibold text-pink-100 backdrop-blur"
                    >
                      -{petal.value}
                    </span>
                  ))}
                {flashTargetId === fighter.id && (
                  <div className="battle-impact-flash pointer-events-none absolute inset-0 z-40 rounded-xl bg-white/55" />
                )}
                <BattleFighterCard
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
              </div>
            ))}
          </div>
        </div>
      </Card>

      {battleOver && (
        <Card className="p-3 border-primary/40">
          <p className="font-semibold">{boss.currentHealth <= 0 ? t.victory : t.defeat}</p>
          {showResetButton && <Button className="mt-2" onClick={reset} disabled={saving}>{t.newBattle}</Button>}
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
