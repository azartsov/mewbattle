# MewBattle Project Context

## Goal

MewBattle is a web card RPG prototype where users:

1. Authenticate (or preview in guest mode).
2. Collect cards and open boosters.
3. Build a deck.
4. Fight a scripted boss battle.
5. Persist progress to Firestore.

## Current Product State

- Primary runtime is `app/page.tsx` with tabs: Collection, My Deck, Boosters, Battle.
- Auth is functional with Firebase email/password + guest mode.
- Card data is seeded on-demand from a local starter set into Firestore.
- Decks and battle logs are persisted to Firestore.
- Battle loop is deterministic from card stats + random ability proc rolls.
- Unit tests cover core battle logic and legacy darts logic.

## High-Level Architecture

## App Shell

- `app/layout.tsx`
- Responsibilities: metadata, providers (`I18nProvider`, `AuthProvider`), service worker registration.

- `app/page.tsx`
- Responsibilities: auth screen, data loading, tab routing, Firestore orchestrations.

## Domain Layer

- `lib/mew-types.ts`
- Shared domain contracts for cards, decks, fighters, battle log.

- `lib/mew-engine.ts`
- Pure battle mechanics (`calculateTurn`, `rollAbilityProcs`).

- `lib/mew-firestore.ts`
- Firestore reads/writes for cards, user cards, decks, battle logs.
- Includes `ensureCardsSeeded()` and booster draw algorithm.

- `lib/auth-context.tsx`
- Auth lifecycle and actions.

## UI Layer (Mew)

- `components/mew/card-collection.tsx`
- `components/mew/deck-builder.tsx`
- `components/mew/booster-shop.tsx`
- `components/mew/battle-arena.tsx`

## Legacy Subsystem (Darts)

Legacy darts code is archived under `legacy/darts/lib/*` and `legacy/darts/components/*`.
It is intentionally isolated from the active MewBattle runtime.

## Data Model (Firestore)

## Collections

- `cards`
- `user_cards`
- `decks`
- `battles`
- `games` (legacy darts history)

## Important Notes

- `user_cards` document IDs are `${userId}_${cardId}`.
- `decks` document IDs are `${userId}_${normalizedDeckName}`.
- `battles.createdAt` is written with `serverTimestamp()`.

## Development Workflow

1. Change business logic in `lib/mew-engine.ts` or `lib/mew-firestore.ts` first.
2. Update/add tests in `lib/*.test.ts`.
3. Wire UI changes in `components/mew/*`.
4. Validate app manually (`npm run dev`) and run `npm run test`.

## Known Technical Debt

- `app/page.tsx` mixes orchestration, state management, and rendering (candidate for feature-level hooks).
- `addOrIncrementUserCard` fetches all user cards before update (can be optimized with direct read/transaction).
- Legacy darts modules increase maintenance surface and naming inconsistency.
- UI copy is mostly hardcoded in English and not integrated with i18n translations in the mew flow.

## Refactor Backlog

1. Extract `useMewData` hook from `app/page.tsx`.
2. Split Firestore layer into `cards`, `decks`, `battles` modules.
3. Add integration tests for deck save + battle save flows.
4. Decide strategy for legacy darts subsystem:
   - keep as separate route/module, or
   - archive/remove from active workspace.

## Naming/Banding Status

- Project package name is `mewbattle`.
- PWA manifest name is `MewBattle`.
- Local i18n storage key migrated to `mewbattleLang` with legacy fallback.
- Backup XML writer now uses `mewbattleBackup` root tag, parser supports legacy `dartsBackup`.
