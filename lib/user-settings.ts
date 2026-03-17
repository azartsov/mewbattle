import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { CardDesignVariant } from "./mew-card-design"

export const TOUCH_HOLD_DELAY_STORAGE_KEY = "dartsTouchHoldDelayMs"
export const TOUCH_HOLD_DELAY_EVENT = "darts-touch-hold-delay-changed"
export const DEFAULT_TOUCH_HOLD_DELAY_MS = 700
export const MIN_TOUCH_HOLD_DELAY_MS = 0
export const MAX_TOUCH_HOLD_DELAY_MS = 1500
export const CARD_DESIGN_STORAGE_KEY = "mewbattleCardDesign"
export const DEFAULT_CARD_DESIGN: CardDesignVariant = "classic"

export function normalizeCardDesign(value: unknown): CardDesignVariant {
  return value === "storybook" ? "storybook" : DEFAULT_CARD_DESIGN
}

export function loadLocalCardDesign(): CardDesignVariant {
  if (typeof window === "undefined") return DEFAULT_CARD_DESIGN
  return normalizeCardDesign(window.localStorage.getItem(CARD_DESIGN_STORAGE_KEY))
}

export function saveLocalCardDesign(value: CardDesignVariant): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CARD_DESIGN_STORAGE_KEY, normalizeCardDesign(value))
}

export function clampTouchHoldDelayMs(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TOUCH_HOLD_DELAY_MS
  return Math.min(MAX_TOUCH_HOLD_DELAY_MS, Math.max(MIN_TOUCH_HOLD_DELAY_MS, Math.round(value)))
}

export async function loadUserTouchHoldDelayMs(userId: string): Promise<number | null> {
  const ref = doc(db, "user_settings", userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const raw = snap.data()?.touchHoldDelayMs
  if (typeof raw !== "number") return null
  return clampTouchHoldDelayMs(raw)
}

export async function saveUserTouchHoldDelayMs(userId: string, value: number): Promise<void> {
  const ref = doc(db, "user_settings", userId)
  await setDoc(ref, { touchHoldDelayMs: clampTouchHoldDelayMs(value) }, { merge: true })
}

export async function loadUserCardDesign(userId: string): Promise<CardDesignVariant | null> {
  const ref = doc(db, "user_settings", userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const raw = snap.data()?.cardDesign
  if (typeof raw !== "string") return null
  return normalizeCardDesign(raw)
}

export async function saveUserCardDesign(userId: string, value: CardDesignVariant): Promise<void> {
  const ref = doc(db, "user_settings", userId)
  await setDoc(ref, { cardDesign: normalizeCardDesign(value) }, { merge: true })
}
