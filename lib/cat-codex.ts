export type CatCodexLanguage = "ru" | "en"

export const CAT_CODEX_QUOTES: Record<CatCodexLanguage, readonly string[]> = {
  ru: [
    "«Путь Кота — это сон. В ситуации \"или-или\" без колебаний выбирай сон».",
    "«Каждое утро думай о том, не поспать ли мне еще. Каждый вечер освежай свой ум мыслями о сладком сне».",
    "«Ищи недостатки у других, а не у себя».",
    "«Подумав — передумай, а передумав — подумай».",
    "«Лень Кота тяжелей горы, а Сон легче пуха».",
    "«Семь раз упади — восемь раз поспи».",
    "«Умный Кот прячет свои когти».",
    "«Не говори плохо о себе. Ибо Кот внутри тебя слышит твои слова и его тошнит от них».",
  ],
  en: [
    "\"The Cat's way is sleep. When faced with an either-or, choose sleep without hesitation.\"",
    "\"Each morning consider whether to sleep a little longer. Each evening refresh your mind with thoughts of sweet sleep.\"",
    "\"Look for faults in others, not in yourself.\"",
    "\"After thinking — rethink; after rethinking — think again.\"",
    "\"A Cat's laziness is heavier than mountains, and sleep is lighter than a feather.\"",
    "\"Fall seven times — sleep eight times.\"",
    "\"A wise Cat hides its claws.\"",
    "\"Don't speak badly of yourself. The Cat inside you hears your words — and it feels sick from them.\"",
  ],
} as const

const pickIndexDeterministic = (seed: number, len: number) => {
  if (len <= 0) return 0
  // Simple LCG-style mix for stable pseudo-randomness.
  const mixed = (Math.imul(seed + 1, 1103515245) + 12345) >>> 0
  return mixed % len
}

export function pickCatCodexQuote(language: CatCodexLanguage, seed: number): string {
  const pool = CAT_CODEX_QUOTES[language] ?? CAT_CODEX_QUOTES.en
  const idx = pickIndexDeterministic(seed, pool.length)
  return pool[idx] ?? pool[0] ?? ""
}

export function pickCatCodexQuoteRandom(language: CatCodexLanguage): string {
  const pool = CAT_CODEX_QUOTES[language] ?? CAT_CODEX_QUOTES.en
  if (pool.length === 0) return ""
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx] ?? pool[0] ?? ""
}
