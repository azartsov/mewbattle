import { describe, expect, it } from "vitest"
import { calculateTurn } from "./mew-engine"
import type { FighterCard } from "./mew-types"

const attacker: FighterCard = {
  id: "atk",
  name: "Cat Berserker",
  attack: 20,
  health: 50,
  currentHealth: 50,
  ability: "chance for double",
}

const defender: FighterCard = {
  id: "def",
  name: "Cat Ninja",
  attack: 10,
  health: 45,
  currentHealth: 45,
  ability: "ninja dodge",
}

describe("calculateTurn", () => {
  it("applies base damage", () => {
    const result = calculateTurn(
      { ...attacker, ability: "" },
      { ...defender, ability: "" },
      { attackerDoubleHit: false, defenderDodge: false, defenderShield: false, defenderCounter: false },
    )
    expect(result.damage).toBe(20)
    expect(result.defenderHealth).toBe(25)
  })

  it("supports dodge proc", () => {
    const result = calculateTurn(attacker, defender, {
      attackerDoubleHit: false,
      defenderDodge: true,
      defenderShield: false,
      defenderCounter: false,
    })
    expect(result.dodged).toBe(true)
    expect(result.damage).toBe(0)
    expect(result.defenderHealth).toBe(45)
  })

  it("supports double hit proc", () => {
    const result = calculateTurn(attacker, { ...defender, ability: "" }, {
      attackerDoubleHit: true,
      defenderDodge: false,
      defenderShield: false,
      defenderCounter: false,
    })
    expect(result.doubled).toBe(true)
    expect(result.damage).toBe(40)
  })

  it("supports shield mitigation", () => {
    const result = calculateTurn(
      { ...attacker, ability: "" },
      { ...defender, ability: "mage shield" },
      { attackerDoubleHit: false, defenderDodge: false, defenderShield: true, defenderCounter: false },
    )
    expect(result.shielded).toBe(true)
    expect(result.damage).toBe(12)
  })

  it("applies counterattack damage", () => {
    const result = calculateTurn(
      { ...attacker, ability: "" },
      { ...defender, ability: "" },
      { attackerDoubleHit: false, defenderDodge: false, defenderShield: false, defenderCounter: true },
    )

    expect(result.countered).toBe(true)
    expect(result.counterDamage).toBe(3)
    expect(result.attackerHealth).toBe(47)
  })
})
