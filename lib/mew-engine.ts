import type { AbilityProcs, FighterCard, TurnResult } from "./mew-types"

function hasAbility(card: FighterCard, key: string): boolean {
  return card.ability.toLowerCase().includes(key)
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

export function rollAbilityProcs(): AbilityProcs {
  return {
    attackerDoubleHit: Math.random() < 0.3,
    defenderDodge: Math.random() < 0.3,
    defenderShield: Math.random() < 0.35,
    defenderCounter: Math.random() < 0.12,
  }
}
