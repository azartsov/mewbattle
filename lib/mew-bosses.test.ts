import { describe, expect, it } from "vitest"
import { BOSS_FIGHTERS, scaleBossForPlayer } from "@/lib/mew-bosses"

describe("mew boss balance", () => {
  it("does not buff bosses at the very start of progression", () => {
    const baseBoss = BOSS_FIGHTERS[0]
    const scaled = scaleBossForPlayer(baseBoss, 0)

    expect(scaled.attack).toBe(baseBoss.attack)
    expect(scaled.health).toBe(baseBoss.health)
    expect(scaled.currentHealth).toBe(baseBoss.health)
  })

  it("scales bosses more softly in early-mid progression", () => {
    const baseBoss = BOSS_FIGHTERS[1]
    const scaled = scaleBossForPlayer(baseBoss, 2)

    expect(scaled.attack).toBeGreaterThanOrEqual(baseBoss.attack)
    expect(scaled.health).toBeGreaterThanOrEqual(baseBoss.health)
    expect(scaled.attack).toBeLessThanOrEqual(Math.round(baseBoss.attack * 1.06))
    expect(scaled.health).toBeLessThanOrEqual(Math.round(baseBoss.health * 1.09))
  })
})
