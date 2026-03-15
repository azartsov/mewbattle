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

  return {
    defenderHealth,
    attackerHealth,
    damage,
    dodged: false,
    shielded,
    doubled,
    text: `${attackerCard.name} hit ${defenderCard.name} for ${damage}`,
  }
}

export function rollAbilityProcs(): AbilityProcs {
  return {
    attackerDoubleHit: Math.random() < 0.3,
    defenderDodge: Math.random() < 0.3,
    defenderShield: Math.random() < 0.35,
  }
}
