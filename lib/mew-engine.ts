import type { AbilityProcs, FighterCard, TurnResult } from "./mew-types"

function hasAbility(card: FighterCard, key: string): boolean {
  return card.ability.toLowerCase().includes(key)
}

export function hasMagicalHealingAbility(card: FighterCard): boolean {
  return hasAbility(card, "healing")
}

export function getDefenderDodgeChance(defenderCard?: FighterCard): number {
  if (!defenderCard) return 0.3
  const baseId = defenderCard.id.split("__")[0]
  if (baseId === "boss_raven") return 0.2
  return 0.3
}

export function getMagicalHealingAmount(damage: number): number {
  if (damage <= 0) return 0
  return 5 + Math.floor(Math.random() * 11)
}

export function applyTeamHeal(
  fighters: FighterCard[],
  requestedAmount: number,
  excludedFighterId?: string,
): { fighters: FighterCard[]; heal: { amount: number; targetId: string | null } } {
  if (requestedAmount <= 0) {
    return { fighters, heal: { amount: 0, targetId: null } }
  }

  const target = fighters
    .filter((fighter) => (
      fighter.id !== excludedFighterId
      && fighter.currentHealth > 0
      && fighter.currentHealth < fighter.health
    ))
    .sort((left, right) => {
      if (left.currentHealth !== right.currentHealth) return left.currentHealth - right.currentHealth
      return left.health - right.health
    })[0]

  if (!target) {
    return { fighters, heal: { amount: 0, targetId: null } }
  }

  const restored = Math.min(requestedAmount, target.health - target.currentHealth)
  if (restored <= 0) {
    return { fighters, heal: { amount: 0, targetId: null } }
  }

  return {
    fighters: fighters.map((fighter) => (
      fighter.id === target.id
        ? { ...fighter, currentHealth: fighter.currentHealth + restored }
        : fighter
    )),
    heal: {
      amount: restored,
      targetId: target.id,
    },
  }
}

export function calculateTurn(
  attackerCard: FighterCard,
  defenderCard: FighterCard,
  abilityProcs: AbilityProcs,
): TurnResult {
  const canDouble = hasAbility(attackerCard, "double") || hasAbility(attackerCard, "berserk")
  const canDodge = hasAbility(defenderCard, "dodge") || hasAbility(defenderCard, "ninja")
  const canShield = hasAbility(defenderCard, "shield") || hasAbility(defenderCard, "mage")
  const canVamp = hasAbility(attackerCard, "vamp")

  const dodged = canDodge && abilityProcs.defenderDodge
  if (dodged) {
    return {
      defenderHealth: defenderCard.currentHealth,
      attackerHealth: attackerCard.currentHealth,
      damage: 0,
      dodged: true,
      shielded: false,
      doubled: false,
      countered: false,
      counterDamage: 0,
      text: `${defenderCard.name} dodged ${attackerCard.name}'s attack`,
    }
  }

  let damage = attackerCard.attack
  const doubled = canDouble && abilityProcs.attackerDoubleHit
  if (doubled) {
    damage *= 2
  }

  const shielded = canShield && abilityProcs.defenderShield
  if (shielded) {
    damage = Math.max(1, Math.round(damage * 0.6))
  }

  const defenderHealth = Math.max(0, defenderCard.currentHealth - damage)

  let attackerHealth = attackerCard.currentHealth
  if (canVamp && damage > 0) {
    const heal = Math.max(1, Math.round(damage * 0.2))
    attackerHealth = Math.min(attackerCard.health, attackerCard.currentHealth + heal)
  }

  const canCounter = defenderHealth > 0 && damage > 0
  const countered = canCounter && abilityProcs.defenderCounter
  const counterDamage = countered ? Math.max(2, Math.round(defenderCard.attack * 0.3)) : 0
  if (countered) {
    attackerHealth = Math.max(0, attackerHealth - counterDamage)
  }

  const counterText = countered ? `; ${defenderCard.name} countered for ${counterDamage}` : ""

  return {
    defenderHealth,
    attackerHealth,
    damage,
    dodged: false,
    shielded,
    doubled,
    countered,
    counterDamage,
    text: `${attackerCard.name} hit ${defenderCard.name} for ${damage}${counterText}`,
  }
}

export function rollAbilityProcs(defenderCard?: FighterCard): AbilityProcs {
  return {
    attackerDoubleHit: Math.random() < 0.3,
    defenderDodge: Math.random() < getDefenderDodgeChance(defenderCard),
    defenderShield: Math.random() < 0.35,
    defenderCounter: Math.random() < 0.12,
  }
}
