# MewBattle

`MewBattle` is a cat-themed turn-based card RPG built with Next.js 16, React 19, and Firebase.

Players collect cat cards, build decks, open boosters, and fight a boss through a web-first battle flow with persistent account data and shared cloud state.

## Current Feature Set

- turn-based cat card battle loop against a boss
- card collection and owned-card progression
- deck building and deck editing flow
- booster opening flow with Firestore-backed inventory updates
- Firebase Auth with guest mode and authenticated persistence
- Firestore sync for cards, decks, battles, and user state
- PWA shell with service worker registration and version metadata
- isolated legacy darts modules kept outside the active MewBattle runtime

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Firebase Auth
- Firestore
- Tailwind CSS
- Radix UI / shadcn-style primitives
- Vitest

## Main Scripts

- `npm install` — install dependencies
- `npm run dev` — start the development server
- `npm run build` — build the production bundle
- `npm run build:sync-version` — sync version metadata and build
- `npm run start` — start the production server
- `npm run lint` — run ESLint
- `npm run test` — run unit tests with Vitest
- `npm run migrate:cards` — run the card-field migration script
- `npm run migrate:cards:dry` — dry-run the card-field migration

## Local Run

1. `cd /Users/valeryazartsov/mewbattle`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

## Environment

Create `.env.local` with:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional:

- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Runtime Structure

- `app/layout.tsx` — providers, metadata, and service worker registration
- `app/page.tsx` — main app shell with auth flow and top-level tabs
- `lib/auth-context.tsx` — Firebase auth state, guest mode, and auth actions
- `lib/mew-firestore.ts` — Firestore layer for cards, decks, battles, and boosters
- `lib/mew-engine.ts` — battle turn resolution and ability behavior
- `lib/mew-types.ts` — domain types for cards, decks, battles, and logs
- `components/mew/card-collection.tsx` — owned-card overview
- `components/mew/deck-builder.tsx` — deck assembly UI
- `components/mew/booster-shop.tsx` — booster opening flow
- `components/mew/battle-arena.tsx` — active battle loop

## Testing

Current test coverage includes:

- `lib/mew-engine.test.ts`
- `legacy/darts/lib/game-engine.test.ts`
- `legacy/darts/lib/game-firestore.test.ts`

Run all tests with `npm run test`.

## Project Notes

- Build version is stored in `lib/version.ts` and updated by `scripts/update-version.js`.
- PWA metadata is configured in `public/manifest.json`.
- If Firestore data contracts change, update both the TypeScript types and tests.
- Backup XML parsing in `lib/game-firestore.tsx` accepts both legacy and current backup root tags for compatibility.
- Legacy darts scoring code stays isolated under `legacy/darts/*` and is not part of the active MewBattle runtime.
