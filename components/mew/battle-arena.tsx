"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import { Cat, Skull } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { applyTeamHeal, calculateTurn, getMagicalHealingAmount, hasMagicalHealingAbility, rollAbilityProcs } from "@/lib/mew-engine"
import type { BattleLogEntry, FighterCard, MewCard } from "@/lib/mew-types"
import { BattleFighterCard } from "@/components/mew/battle-fighter-card"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_TYPE_LABEL, pickRandomBoss } from "@/lib/mew-bosses"

interface BattleArenaProps {
  deckCards: MewCard[]
  onSaveBattle: (winnerId: string, bossId: string, log: BattleLogEntry[], hpBonus: number) => Promise<number>
  deckName: string
  predictedWinRewardBase?: number
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
  delayMs: number
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

interface HealBurstFx {
  targetId: string
  label: string
}

interface HealingStreamFx {
  sourceId: string
  targetId: string
  width: number
  height: number
  paths: Array<{ d: string; opacity: number; delayMs: number }>
  petals: Array<{
    id: string
    left: number
    top: number
    dx: string
    dy: string
    rotate: string
    delayMs: number
    scale: number
  }>
}

interface BattleResolutionState {
  winnerId: "player" | "boss"
  rewardCoins: number
  defeatQuote: string | null
}

const DAMAGE_PETAL_DURATION_MS = 2100
const ABILITY_FX_DURATION_MS = 2400
const HEALING_BURST_DURATION_MS = 2200
const HEALING_STREAM_DURATION_MS = 1700
const BATTLE_RESULT_REVEAL_DELAY_MS = 1400
const BOSS_COUNTER_STEP_MS = 650
const BOSS_COUNTER_RESOLVE_DELAY_MS = 2050
const DEFEAT_QUOTES: Record<"ru" | "en", string[]> = {
  ru: [
    "Победа и поражение — это вопрос временных обстоятельств. Чтобы избежать позора, нужно выбрать иной путь — послеобеденная дрёма.",
    "Кот, который впадает в тоску, встречаясь с невзгодами, бесполезен.",
    "Коты должны стремиться к тому, чтобы никогда не падать духом перед лицом невзгод и чрезмерно не радоваться, когда нам сопутствует удача.",
    "Кот бесполезен, если он не возвышается над другими и не стоит непоколебимо посреди бури. Коту всегда нужно подниматься и двигаться дальше, потому что его ждут новые испытания.",
    "Смелость — это умение скрежетать зубами; это решимость добиваться своего любой ценой, вопреки самым неблагоприятным обстоятельствам.",
    "Кот, который ни разу не ошибался, — опасен.",
    "Способ победить других Коту не ведом, однако как победить себя, Коту известно.",
  ],
  en: [
    "Victory and defeat are matters of temporary circumstances. To avoid disgrace, one should choose a different path: an afternoon nap.",
    "A cat who falls into gloom when meeting hardship is useless.",
    "Cats should strive never to lose heart in the face of hardship and not to rejoice too greatly when fortune smiles on them.",
    "A cat is useless if it does not rise above others and stand unshaken amid the storm. A cat must always rise and move on, because new trials await.",
    "Courage is the ability to grit one's teeth; it is the resolve to achieve one's aim at any cost, despite the harshest circumstances.",
    "A cat who has never made a mistake is dangerous.",
    "The way to defeat others may be unknown to the Cat, but the way to defeat oneself is known.",
  ],
}
const HEALING_SAKURA_PARTICLES = [
  { left: "10%", top: "8%", dx: "26px", dy: "20px", rotate: "210deg", delay: "0ms", scale: 0.8 },
  { left: "24%", top: "2%", dx: "8px", dy: "30px", rotate: "250deg", delay: "70ms", scale: 1 },
  { left: "78%", top: "10%", dx: "-24px", dy: "24px", rotate: "230deg", delay: "120ms", scale: 0.9 },
  { left: "88%", top: "22%", dx: "-18px", dy: "28px", rotate: "260deg", delay: "180ms", scale: 0.85 },
  { left: "16%", top: "26%", dx: "16px", dy: "38px", rotate: "280deg", delay: "40ms", scale: 0.7 },
  { left: "66%", top: "4%", dx: "-8px", dy: "34px", rotate: "240deg", delay: "150ms", scale: 0.95 },
] as const

export function BattleArena({
  deckCards,
  onSaveBattle,
  deckName,
  predictedWinRewardBase = 0,
  initialBoss,
  showResetButton = true,
  onBattleResolved,
}: BattleArenaProps) {
  const { t, language } = useMewI18n()

  const getRandomDefeatQuote = useCallback(() => {
    const quotes = DEFEAT_QUOTES[language]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }, [language])

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
  const [bossCountdownTick, setBossCountdownTick] = useState<number | null>(null)
  const [bossTargetPreviewId, setBossTargetPreviewId] = useState<string | null>(null)
  const [shakeTargetId, setShakeTargetId] = useState<string | null>(null)
  const [flashTargetId, setFlashTargetId] = useState<string | null>(null)
  const [lightningFx, setLightningFx] = useState<ActiveLightningFx | null>(null)
  const [damagePetals, setDamagePetals] = useState<DamagePetalFx[]>([])
  const [healingPetals, setHealingPetals] = useState<DamagePetalFx[]>([])
  const [abilityFx, setAbilityFx] = useState<{ targetId: string; fxType: "fire" | "ice"; label: string } | null>(null)
  const [healingFx, setHealingFx] = useState<HealBurstFx | null>(null)
  const [healingStreamFx, setHealingStreamFx] = useState<HealingStreamFx | null>(null)
  const [battleResolution, setBattleResolution] = useState<BattleResolutionState | null>(null)

  const arenaRef = useRef<HTMLDivElement | null>(null)
  const bossCardRef = useRef<HTMLDivElement | null>(null)
  const allyCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fxTimeoutRef = useRef<number | null>(null)
  const shakeTimeoutRef = useRef<number | null>(null)
  const flashTimeoutRef = useRef<number | null>(null)
  const damagePetalTimeoutsRef = useRef<number[]>([])
  const healingPetalTimeoutsRef = useRef<number[]>([])
  const abilityFxTimeoutRef = useRef<number | null>(null)
  const healingFxTimeoutRef = useRef<number | null>(null)
  const healingStreamTimeoutRef = useRef<number | null>(null)
  const battleResolutionRevealTimeoutRef = useRef<number | null>(null)
  const fightersRef = useRef(fighters)
  // keep refs in sync so countdown closures always see the latest values
  useEffect(() => { fightersRef.current = fighters })

  const clearDamagePetalTimeouts = () => {
    damagePetalTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    damagePetalTimeoutsRef.current = []
  }

  const clearHealingPetalTimeouts = () => {
    healingPetalTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    healingPetalTimeoutsRef.current = []
  }

  const clearHealingStreamTimeout = () => {
    if (healingStreamTimeoutRef.current) {
      window.clearTimeout(healingStreamTimeoutRef.current)
      healingStreamTimeoutRef.current = null
    }
  }

  const clearBattleResolutionRevealTimeout = () => {
    if (battleResolutionRevealTimeoutRef.current) {
      window.clearTimeout(battleResolutionRevealTimeoutRef.current)
      battleResolutionRevealTimeoutRef.current = null
    }
  }

  const scheduleBattleResolution = (
    winnerId: "player" | "boss",
    rewardCoins: number,
    persistBattle: () => Promise<number>,
  ) => {
    clearBattleResolutionRevealTimeout()
    battleResolutionRevealTimeoutRef.current = window.setTimeout(() => {
      setBattleResolution({
        winnerId,
        rewardCoins,
        defeatQuote: winnerId === "boss" ? getRandomDefeatQuote() : null,
      })
      setSaving(true)
      void persistBattle()
        .then((settledRewardCoins) => {
          setBattleResolution((current) => (
            current?.winnerId === winnerId
              ? { ...current, rewardCoins: settledRewardCoins }
              : current
          ))
        })
        .finally(() => {
          setSaving(false)
        })
      battleResolutionRevealTimeoutRef.current = null
    }, BATTLE_RESULT_REVEAL_DELAY_MS)
  }

  const triggerAbilityFx = (targetId: string, fxType: "fire" | "ice", label: string) => {
    if (abilityFxTimeoutRef.current) window.clearTimeout(abilityFxTimeoutRef.current)
    setAbilityFx({ targetId, fxType, label })
    abilityFxTimeoutRef.current = window.setTimeout(() => setAbilityFx(null), ABILITY_FX_DURATION_MS)
  }

  const triggerHealingFx = (targetId: string, label: string) => {
    if (healingFxTimeoutRef.current) window.clearTimeout(healingFxTimeoutRef.current)
    setHealingFx({ targetId, label })
    healingFxTimeoutRef.current = window.setTimeout(() => setHealingFx(null), HEALING_BURST_DURATION_MS)
  }

  const triggerHealingStream = (sourceId: string, targetId: string) => {
    const arenaEl = arenaRef.current
    const sourceEl = allyCardRefs.current[sourceId]
    const targetEl = allyCardRefs.current[targetId]
    if (!arenaEl || !sourceEl || !targetEl) return

    const arenaRect = arenaEl.getBoundingClientRect()
    const source = toLocalCenter(sourceEl, arenaEl)
    const target = toLocalCenter(targetEl, arenaEl)
    const dx = target.x - source.x
    const dy = target.y - source.y
    const length = Math.hypot(dx, dy) || 1
    const nx = -dy / length
    const ny = dx / length
    const midpointX = (source.x + target.x) / 2
    const midpointY = (source.y + target.y) / 2

    const paths = [-26, 0, 26].map((offset, index) => {
      const cx = midpointX + nx * offset
      const cy = midpointY + ny * offset - 24
      return {
        d: `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`,
        opacity: 0.6 - index * 0.12,
        delayMs: index * 120,
      }
    })

    const petals = Array.from({ length: 12 }, (_, index) => {
      const spread = (Math.random() * 22) - 11
      const launchX = source.x + nx * spread
      const launchY = source.y + ny * spread * 0.6
      return {
        id: `${sourceId}-${targetId}-${index}-${Date.now()}`,
        left: launchX,
        top: launchY,
        dx: `${dx + nx * spread * 0.45}px`,
        dy: `${dy + ny * spread * 0.75}px`,
        rotate: `${150 + Math.round(Math.random() * 180)}deg`,
        delayMs: index * 70,
        scale: 0.8 + Math.random() * 0.6,
      }
    })

    clearHealingStreamTimeout()
    setHealingStreamFx({
      sourceId,
      targetId,
      width: arenaRect.width,
      height: arenaRect.height,
      paths,
      petals,
    })
    healingStreamTimeoutRef.current = window.setTimeout(() => {
      setHealingStreamFx(null)
      healingStreamTimeoutRef.current = null
    }, HEALING_STREAM_DURATION_MS)
  }

  const aliveFighters = useMemo(() => fighters.filter((f) => f.currentHealth > 0), [fighters])
  const battleOver = boss.currentHealth <= 0 || aliveFighters.length === 0
  const canExecuteCatTurn = !battleOver && !pendingBossTurn && !!tapSelectedAllyId
  const canExecuteBossTurn = !battleOver && !!pendingBossTurn
  const showTurnPulse = canExecuteBossTurn || canExecuteCatTurn
  const bossTurnActive = !!pendingBossTurn
  const doubleHitFxLabel = language === "ru" ? "УДАР x2!" : "× 2!"
  const dodgeFxLabel = language === "ru" ? "УКЛОН!" : "DODGE!"
  const shieldFxLabel = language === "ru" ? "ЩИТ!" : "SHIELD!"
  const healingFxLabel = language === "ru" ? "ИСЦЕЛЕНИЕ!" : "HEALING!"

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
    setHealingPetals([])
    setAbilityFx(null)
    setHealingFx(null)
    setBattleResolution(null)
    setBossCountdownTick(null)
    setBossTargetPreviewId(null)
  }, [createBoss, deckCards])

  useEffect(() => {
    return () => {
      if (fxTimeoutRef.current) window.clearTimeout(fxTimeoutRef.current)
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current)
      if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current)
      if (abilityFxTimeoutRef.current) window.clearTimeout(abilityFxTimeoutRef.current)
      if (healingFxTimeoutRef.current) window.clearTimeout(healingFxTimeoutRef.current)
      clearDamagePetalTimeouts()
      clearHealingPetalTimeouts()
      clearHealingStreamTimeout()
      clearBattleResolutionRevealTimeout()
    }
  }, [])

  // Boss auto-targeting countdown: 3-2-1, then auto-resolve
  const resolveBossTurnRef = useRef<(targetId: string) => Promise<void>>(async () => {})
  useEffect(() => {
    if (!pendingBossTurn) {
      setBossCountdownTick(null)
      setBossTargetPreviewId(null)
      return
    }

    const alive = fightersRef.current.filter((f) => f.currentHealth > 0)
    if (alive.length === 0) return

    let cancelled = false
    const pickRandom = () => alive[Math.floor(Math.random() * alive.length)].id

    setBossCountdownTick(3)
    setBossTargetPreviewId(pickRandom())

    const t1 = window.setTimeout(() => { if (!cancelled) setBossCountdownTick(2) }, BOSS_COUNTER_STEP_MS)
    const t2 = window.setTimeout(() => { if (!cancelled) setBossCountdownTick(1) }, BOSS_COUNTER_STEP_MS * 2)
    const tResolve = window.setTimeout(() => {
      if (cancelled) return
      const finalTarget = alive[Math.floor(Math.random() * alive.length)]
      setBossCountdownTick(null)
      setBossTargetPreviewId(null)
      void resolveBossTurnRef.current(finalTarget.id)
    }, BOSS_COUNTER_RESOLVE_DELAY_MS)

    return () => {
      cancelled = true
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(tResolve)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBossTurn?.turn])

  const spawnDamagePetal = (targetId: string, value: number) => {
    if (value <= 0) return
    const id = `${targetId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    setDamagePetals((prev) => [...prev, { id, targetId, value }])
    const timeoutId = window.setTimeout(() => {
      setDamagePetals((prev) => prev.filter((item) => item.id !== id))
    }, DAMAGE_PETAL_DURATION_MS)
    damagePetalTimeoutsRef.current.push(timeoutId)
  }

  const spawnHealingPetal = (targetId: string, value: number) => {
    if (value <= 0) return
    const id = `${targetId}-heal-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    setHealingPetals((prev) => [...prev, { id, targetId, value }])
    const timeoutId = window.setTimeout(() => {
      setHealingPetals((prev) => prev.filter((item) => item.id !== id))
    }, DAMAGE_PETAL_DURATION_MS)
    healingPetalTimeoutsRef.current.push(timeoutId)
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
      delayMs: idx * 38,
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

    const playerTurn = calculateTurn(boostedAttacker, boss, rollAbilityProcs(boss))
    const affinityText = affinity.level > 0 && boss.bossType
      ? ` (${BOSS_TYPE_LABEL[boss.bossType]} mastery Lv${affinity.level} +${affinity.bonusDamage})`
      : ""
    const bossAfter = { ...boss, currentHealth: playerTurn.defenderHealth }
    const fightersAfterPlayerStrike = fighters.map((f) =>
      f.id === attacker.id ? { ...f, currentHealth: playerTurn.attackerHealth } : f,
    )
    let fightersAfterPlayer = fightersAfterPlayerStrike
    let healingAmount = 0
    let healingTargetId: string | null = null

    if (hasMagicalHealingAbility(attacker) && playerTurn.damage > 0) {
      const healingResult = applyTeamHeal(
        fightersAfterPlayerStrike,
        getMagicalHealingAmount(playerTurn.damage),
        attacker.id,
      )
      fightersAfterPlayer = healingResult.fighters
      healingAmount = healingResult.heal.amount
      healingTargetId = healingResult.heal.targetId
    }

    const healingTargetName = healingTargetId
      ? fightersAfterPlayer.find((fighter) => fighter.id === healingTargetId)?.name ?? null
      : null
    const healingLogText = healingAmount > 0 && healingTargetName
      ? (language === "ru"
        ? `; ${healingTargetName} получает лечение ${healingAmount}`
        : `; ${healingTargetName} is healed for ${healingAmount}`)
      : ""

    const nextLog: BattleLogEntry[] = [
      ...log,
      {
        turn,
        actor: "player",
        text: `${playerTurn.text}${affinityText}${healingLogText}`,
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
    if (playerTurn.doubled) triggerAbilityFx(attacker.id, "fire", doubleHitFxLabel)
    else if (playerTurn.dodged) triggerAbilityFx("boss", "ice", dodgeFxLabel)
    else if (playerTurn.shielded) triggerAbilityFx("boss", "ice", shieldFxLabel)
    if (healingAmount > 0 && healingTargetId) {
      spawnHealingPetal(healingTargetId, healingAmount)
      triggerHealingStream(attacker.id, healingTargetId)
      triggerHealingFx(healingTargetId, healingFxLabel)
    }

    setFighters(fightersAfterPlayer)
    setBoss(bossAfter)
    setLog(nextLog)
    setTapSelectedAllyId(null)
    setDraggedId(null)

    if (bossAfter.currentHealth <= 0) {
      setTurn((t) => t + 1)
      const hpBonus = fightersAfterPlayer.reduce((sum, f) => sum + Math.max(0, f.currentHealth), 0)
      const fallbackRewardCoins = predictedWinRewardBase + hpBonus
      scheduleBattleResolution("player", fallbackRewardCoins, () => onSaveBattle("player", boss.id, nextLog, hpBonus))
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

    const bossTurn = calculateTurn(pendingBossTurn.bossSnapshot, target, rollAbilityProcs(target))
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
    if (bossTurn.doubled) triggerAbilityFx("boss", "fire", doubleHitFxLabel)
    else if (bossTurn.dodged) triggerAbilityFx(target.id, "ice", dodgeFxLabel)
    else if (bossTurn.shielded) triggerAbilityFx(target.id, "ice", shieldFxLabel)

    setFighters(updatedFighters)
    setLog(finalLog)
    setPendingBossTurn(null)
    setTurn((t) => t + 1)
    setTapSelectedAllyId(null)
    setDraggedId(null)

    if (updatedFighters.every((f) => f.currentHealth <= 0)) {
      scheduleBattleResolution("boss", 0, () => onSaveBattle("boss", boss.id, finalLog, 0))
    }
  }
  // keep ref up-to-date so countdown closure always calls the latest version
  useEffect(() => { resolveBossTurnRef.current = resolveBossTurn })

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
    setHealingPetals([])
    setAbilityFx(null)
    setHealingFx(null)
    setHealingStreamFx(null)
    clearBattleResolutionRevealTimeout()
    setBattleResolution(null)
  }

  const handleBattleOutcomeAction = () => {
    if (showResetButton) {
      reset()
      return
    }

    setBattleResolution(null)
    onBattleResolved?.()
  }

  const handleBossTap = () => {
    if (battleOver || pendingBossTurn) return

    if (tapSelectedAllyId) {
      void attackWith(tapSelectedAllyId)
    }
  }

  const handleAllyTap = (fighter: FighterCard) => {
    if (battleOver || fighter.currentHealth <= 0 || pendingBossTurn) return

    setTapSelectedAllyId(fighter.id)
    setDraggedId(fighter.id)
  }

  const handleTurnButtonClick = () => {
    if (canExecuteBossTurn) {
      // skip countdown — pick random target immediately
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
            18% {
              opacity: 1;
              transform: translate(-50%, 0px) scale(1);
            }
            72% {
              opacity: 1;
              transform: translate(-50%, -18px) scale(1.01);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -34px) scale(1.02);
            }
          }
          @keyframes sakura-heal-float {
            0% {
              opacity: 0;
              transform: translate(-50%, 10px) scale(0.88);
            }
            18% {
              opacity: 1;
              transform: translate(-50%, -2px) scale(1);
            }
            82% {
              opacity: 1;
              transform: translate(-50%, -18px) scale(1.01);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -30px) scale(1.02);
            }
          }
          @keyframes healing-petal-drift {
            0% {
              opacity: 0;
              transform: translate(0, 0) rotate(0deg) scale(var(--heal-scale));
            }
            18% {
              opacity: 0.95;
            }
            100% {
              opacity: 0;
              transform: translate(var(--heal-dx), var(--heal-dy)) rotate(var(--heal-rot)) scale(calc(var(--heal-scale) * 0.92));
            }
          }
          @keyframes healing-label-float {
            0% { opacity: 0; transform: translate(-50%, 2px) scale(0.85); }
            18% { opacity: 1; transform: translate(-50%, -8px) scale(1); }
            82% { opacity: 1; transform: translate(-50%, -20px) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -30px) scale(0.96); }
          }
          @keyframes healing-stream-dash {
            0% { stroke-dashoffset: 32; opacity: 0; }
            14% { opacity: 0.95; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          @keyframes healing-stream-flight {
            0% {
              opacity: 0;
              transform: translate(0, 0) rotate(0deg) scale(var(--heal-stream-scale));
            }
            16% {
              opacity: 0.95;
            }
            72% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translate(var(--heal-stream-dx), var(--heal-stream-dy)) rotate(var(--heal-stream-rot)) scale(calc(var(--heal-stream-scale) * 0.76));
            }
          }
          .battle-shake {
            animation: battle-shake 0.42s ease-in-out;
          }
          .battle-impact-flash {
            animation: impact-flash 0.22s ease-out;
          }
          .battle-damage-petal {
            animation: sakura-damage-float ${DAMAGE_PETAL_DURATION_MS}ms ease-out forwards;
          }
          .battle-heal-petal {
            animation: sakura-heal-float ${DAMAGE_PETAL_DURATION_MS}ms ease-out forwards;
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
          @keyframes ability-fire-border {
            0%, 100% { box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.75), 0 0 14px rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.95), 0 0 22px rgba(251, 146, 60, 0.65); }
          }
          @keyframes ability-ice-border {
            0%, 100% { box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.75), 0 0 14px rgba(14, 165, 233, 0.45); }
            50% { box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.95), 0 0 22px rgba(56, 189, 248, 0.6); }
          }
          @keyframes ability-label-float {
            0% { opacity: 0; transform: translate(-50%, 0px) scale(0.8); }
            18% { opacity: 1; transform: translate(-50%, -8px) scale(1); }
            82% { opacity: 1; transform: translate(-50%, -20px) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -28px) scale(0.95); }
          }
          .ability-fire { animation: ability-fire-border 0.38s ease-in-out 3; border-radius: 12px; }
          .ability-ice { animation: ability-ice-border 0.38s ease-in-out 3; border-radius: 12px; }
          .ability-label-float { animation: ability-label-float ${ABILITY_FX_DURATION_MS}ms ease-out forwards; }
          .healing-stream-path { animation: healing-stream-dash ${HEALING_STREAM_DURATION_MS}ms ease-out forwards; }
          .healing-stream-petal { animation: healing-stream-flight ${HEALING_STREAM_DURATION_MS}ms ease-out forwards; }
          .healing-sakura-petal { animation: healing-petal-drift 1.3s ease-out forwards; }
          .healing-label-float { animation: healing-label-float ${HEALING_BURST_DURATION_MS}ms ease-out forwards; }
          @keyframes battle-return-button-glow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(255,255,255,0.14), 0 10px 24px rgba(15,23,42,0.28);
              transform: translateY(0);
            }
            50% {
              box-shadow: 0 0 0 5px rgba(255,255,255,0.08), 0 0 28px rgba(250,204,21,0.24), 0 14px 30px rgba(15,23,42,0.32);
              transform: translateY(-1px);
            }
          }
          .battle-return-button-glow {
            animation: battle-return-button-glow 1.2s ease-in-out infinite;
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
          {pendingBossTurn ? t.bossTurnCountdown : t.dragOrTapPlayer}
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
                  stroke={idx === 0 ? "#f5f3ff" : idx === 1 ? "#c4b5fd" : "#f9a8d4"}
                  strokeWidth={line.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lightning-bolt"
                  style={{ animationDelay: `${line.delayMs}ms` }}
                />
              ))}
            </svg>
          )}
          {healingStreamFx && (
            <>
              <svg
                className="pointer-events-none absolute inset-0 z-[32]"
                viewBox={`0 0 ${Math.max(1, healingStreamFx.width)} ${Math.max(1, healingStreamFx.height)}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {healingStreamFx.paths.map((path, index) => (
                  <path
                    key={`${healingStreamFx.sourceId}-${healingStreamFx.targetId}-${index}`}
                    d={path.d}
                    fill="none"
                    stroke="#f9a8d4"
                    strokeWidth={index === 1 ? 4 : 3}
                    strokeLinecap="round"
                    strokeOpacity={path.opacity}
                    strokeDasharray="12 12"
                    className="healing-stream-path"
                    style={{ animationDelay: `${path.delayMs}ms` }}
                  />
                ))}
              </svg>
              {healingStreamFx.petals.map((petal) => (
                <span
                  key={petal.id}
                  className="healing-stream-petal pointer-events-none absolute z-[33] h-4 w-2.5 rounded-full bg-pink-200/95 shadow-[0_0_10px_rgba(251,207,232,0.6)]"
                  style={{
                    left: `${petal.left}px`,
                    top: `${petal.top}px`,
                    "--heal-stream-dx": petal.dx,
                    "--heal-stream-dy": petal.dy,
                    "--heal-stream-rot": petal.rotate,
                    "--heal-stream-scale": String(petal.scale),
                    animationDelay: `${petal.delayMs}ms`,
                  } as CSSProperties}
                />
              ))}
            </>
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
            {healingPetals
              .filter((petal) => petal.targetId === "boss")
              .map((petal) => (
                <span
                  key={petal.id}
                  className="battle-heal-petal pointer-events-none absolute left-1/2 top-0 z-50 inline-flex items-center rounded-full border border-emerald-300/65 bg-emerald-300/20 px-2 py-0.5 text-xs font-semibold text-emerald-50 backdrop-blur"
                >
                  +{petal.value}
                </span>
              ))}
            {flashTargetId === "boss" && (
              <div className="battle-impact-flash pointer-events-none absolute inset-0 z-40 rounded-xl bg-white/60" />
            )}
            {abilityFx?.targetId === "boss" && (
              <>
                <div className={`pointer-events-none absolute inset-0 z-[35] rounded-xl ${abilityFx.fxType === "fire" ? "ability-fire" : "ability-ice"}`} />
                <span className={`ability-label-float pointer-events-none absolute left-1/2 bottom-2 z-50 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold backdrop-blur ${abilityFx.fxType === "fire" ? "border-orange-400/65 bg-orange-900/75 text-orange-100" : "border-cyan-400/65 bg-cyan-900/75 text-cyan-100"}`}>
                  {abilityFx.label}
                </span>
              </>
            )}
            {healingFx?.targetId === "boss" && (
              <>
                {HEALING_SAKURA_PARTICLES.map((petal, index) => (
                  <span
                    key={`boss-healing-${index}`}
                    className="healing-sakura-petal pointer-events-none absolute z-[36] h-3 w-2 rounded-full bg-pink-200/85"
                    style={{
                      left: petal.left,
                      top: petal.top,
                      "--heal-dx": petal.dx,
                      "--heal-dy": petal.dy,
                      "--heal-rot": petal.rotate,
                      "--heal-scale": String(petal.scale),
                      animationDelay: petal.delay,
                    } as CSSProperties}
                  />
                ))}
                <span className="healing-label-float pointer-events-none absolute left-1/2 bottom-2 z-50 inline-flex items-center rounded-full border border-emerald-300/65 bg-emerald-950/75 px-2 py-0.5 text-[11px] font-bold text-emerald-100 backdrop-blur">
                  {healingFx.label}
                </span>
              </>
            )}
            {bossCountdownTick !== null && (
              <div className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-rose-400/80 bg-rose-900/80 text-xl font-bold text-rose-100 shadow-lg">
                  {bossCountdownTick}
                </span>
              </div>
            )}
            <BattleFighterCard
              fighter={boss}
              role="boss"
              isDead={boss.currentHealth <= 0}
              draggable={false}
              droppable={!pendingBossTurn && !battleOver}
              highlighted={draggedId !== null && !pendingBossTurn && !battleOver}
              onDragStart={() => {}}
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
              {bossCountdownTick !== null ? `${t.bossTurnCta} → ${bossCountdownTick}` : (pendingBossTurn ? t.bossTurnCta : t.catsTurnCta)}
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
                {healingPetals
                  .filter((petal) => petal.targetId === fighter.id)
                  .map((petal) => (
                    <span
                      key={petal.id}
                      className="battle-heal-petal pointer-events-none absolute left-1/2 top-0 z-50 inline-flex items-center rounded-full border border-emerald-300/65 bg-emerald-300/20 px-2 py-0.5 text-xs font-semibold text-emerald-50 backdrop-blur"
                    >
                      +{petal.value}
                    </span>
                  ))}
                {flashTargetId === fighter.id && (
                  <div className="battle-impact-flash pointer-events-none absolute inset-0 z-40 rounded-xl bg-white/55" />
                )}
                {abilityFx?.targetId === fighter.id && (
                  <>
                    <div className={`pointer-events-none absolute inset-0 z-[35] rounded-xl ${abilityFx.fxType === "fire" ? "ability-fire" : "ability-ice"}`} />
                    <span className={`ability-label-float pointer-events-none absolute left-1/2 bottom-2 z-50 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold backdrop-blur ${abilityFx.fxType === "fire" ? "border-orange-400/65 bg-orange-900/75 text-orange-100" : "border-cyan-400/65 bg-cyan-900/75 text-cyan-100"}`}>
                      {abilityFx.label}
                    </span>
                  </>
                )}
                {healingFx?.targetId === fighter.id && (
                  <>
                    {HEALING_SAKURA_PARTICLES.map((petal, index) => (
                      <span
                        key={`${fighter.id}-healing-${index}`}
                        className="healing-sakura-petal pointer-events-none absolute z-[36] h-3 w-2 rounded-full bg-pink-200/85"
                        style={{
                          left: petal.left,
                          top: petal.top,
                          "--heal-dx": petal.dx,
                          "--heal-dy": petal.dy,
                          "--heal-rot": petal.rotate,
                          "--heal-scale": String(petal.scale),
                          animationDelay: petal.delay,
                        } as CSSProperties}
                      />
                    ))}
                    <span className="healing-label-float pointer-events-none absolute left-1/2 bottom-2 z-50 inline-flex items-center rounded-full border border-emerald-300/65 bg-emerald-950/75 px-2 py-0.5 text-[11px] font-bold text-emerald-100 backdrop-blur">
                      {healingFx.label}
                    </span>
                  </>
                )}
                {bossTargetPreviewId === fighter.id && (
                  <div className="pointer-events-none absolute inset-0 z-30 rounded-xl ring-2 ring-rose-400/85 ring-offset-1 ring-offset-transparent" />
                )}
                <BattleFighterCard
                  fighter={fighter}
                  role="ally"
                  isDead={fighter.currentHealth <= 0}
                  draggable={!pendingBossTurn && !battleOver && fighter.currentHealth > 0}
                  droppable={false}
                  highlighted={tapSelectedAllyId === fighter.id}
                  onDragStart={() => setDraggedId(fighter.id)}
                  onTap={() => handleAllyTap(fighter)}
                  onDrop={() => {
                    setDraggedId(null)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {battleResolution && (
        <div className="fixed inset-0 z-[90] bg-slate-950/72 backdrop-blur-[4px]">
          <Card className="relative h-full w-full overflow-hidden rounded-none border-0 bg-slate-950 p-0 shadow-none">
            <div className="relative flex h-full min-h-screen flex-col overflow-hidden bg-gradient-to-br from-amber-100 via-sky-50 to-emerald-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.78),_transparent_48%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/48 to-slate-950/10" />
              <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-black/84 via-slate-950/36 to-transparent" />
              <Image
                src={battleResolution.winnerId === "player" ? "/ui/battle-victory-scene.svg" : "/ui/battle-defeat-scene.svg"}
                alt={battleResolution.winnerId === "player" ? t.victory : t.defeat}
                fill
                className="object-cover saturate-[1.08] contrast-[1.04]"
                sizes="100vw"
              />

              <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white sm:p-6 lg:p-8">
                <div className="flex justify-end">
                  <Button
                    className="battle-return-button-glow rounded-full border border-white/20 bg-slate-950/42 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 backdrop-blur-sm hover:bg-slate-950/58 md:text-base"
                    onClick={handleBattleOutcomeAction}
                    disabled={saving}
                  >
                    {showResetButton ? t.newBattle : t.returnFromBattle}
                  </Button>
                </div>

                <div className="flex flex-col gap-4 pb-2 sm:pb-4 lg:max-w-[44rem] lg:gap-5">
                  <div className="space-y-2 rounded-[32px] border border-white/10 bg-slate-950/70 px-5 py-4 shadow-[0_20px_48px_rgba(0,0,0,0.34)] backdrop-blur-md sm:px-6 sm:py-5">
                    <p className="text-3xl font-semibold tracking-[0.05em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-4xl lg:text-5xl">
                      {battleResolution.winnerId === "player" ? t.victory : t.defeat}
                    </p>
                    <p className="max-w-[38rem] text-base leading-relaxed text-slate-100 sm:text-lg lg:text-xl">
                      {battleResolution.winnerId === "player" ? t.victoryMessage : t.defeatMessage}
                    </p>
                  </div>

                  {battleResolution.winnerId === "boss" && battleResolution.defeatQuote && (
                    <div className="max-w-[40rem] space-y-2 rounded-[30px] border border-amber-100/14 bg-slate-950/76 px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-6 sm:py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/92">
                        {t.catCodexAttribution}
                      </p>
                      <p className="text-base italic leading-relaxed text-white sm:text-lg lg:text-xl">
                        {battleResolution.defeatQuote}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-1 rounded-[28px] border border-white/10 bg-slate-950/74 px-5 py-4 shadow-[0_16px_34px_rgba(0,0,0,0.3)] backdrop-blur-md sm:px-6 sm:py-5">
                      {battleResolution.winnerId === "player" ? (
                        <>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/90">{t.coinsWon}</p>
                          <p className="text-3xl font-semibold text-emerald-100 sm:text-4xl lg:text-5xl">+{battleResolution.rewardCoins}</p>
                        </>
                      ) : (
                        <p className="max-w-[24rem] text-base leading-relaxed text-slate-100 sm:text-lg">
                          {t.battleSavedLoss}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
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
