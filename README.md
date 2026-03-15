# MewBattle

MewBattle is a turn-based card RPG built with Next.js 16, React 19, and Firebase.
Players collect cat cards, build decks, open boosters, and fight a boss in a simple battle arena.

## Stack

- Next.js 16 (App Router, TypeScript)
- React 19
- Firebase Auth + Firestore
- Tailwind CSS + Radix/shadcn UI
- Vitest for unit tests

## Quick Start

```bash
cd /Users/valeryazartsov/mewbattle
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - run tests, bump app version, build production bundle
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run test` - run unit tests (Vitest)

## Environment Variables

Create `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional:

- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Architecture

### Runtime Entry

- `app/layout.tsx`: providers, metadata, service worker registration
- `app/page.tsx`: main app shell with auth screen and tabs

### Core Domains

- `lib/auth-context.tsx`: Firebase auth state, guest mode, auth actions
- `lib/mew-firestore.ts`: cards/decks/battles Firestore layer + booster draw logic
- `lib/mew-engine.ts`: battle turn calculation and ability procs
- `lib/mew-types.ts`: type system for cards, decks, battle logs

### Main UI

- `components/mew/card-collection.tsx`: owned cards overview
- `components/mew/deck-builder.tsx`: drag-and-drop deck assembly
- `components/mew/booster-shop.tsx`: booster opening flow
- `components/mew/battle-arena.tsx`: player-vs-boss battle loop

### Legacy Dart Scoring Modules

Legacy darts scoring code is isolated under `legacy/darts/*` and is not part of the active MewBattle runtime.

## Testing

Unit tests live in:

- `lib/mew-engine.test.ts`
- `legacy/darts/lib/game-engine.test.ts`
- `legacy/darts/lib/game-firestore.test.ts`

Run all tests:

```bash
npm run test
```

## Development Notes

- Build version is stored in `lib/version.ts` and updated by `scripts/update-version.js`.
- PWA metadata is configured in `public/manifest.json`.
- If you change Firestore data contracts, update both TypeScript types and tests.
- Backup XML parsing in `lib/game-firestore.tsx` accepts both legacy and current backup root tags for compatibility.
