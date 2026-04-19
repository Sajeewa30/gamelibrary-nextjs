# Game Library Next.js - AI Assistant Context

## Project Overview

A personal game library tracking application built with Next.js 16 (App Router), React 19, TypeScript 5, and Tailwind CSS 4. Users can track completed games, organize them by year, mark favorites, and discover new games via AI curation.

## Tech Stack

- **Framework:** Next.js 16.1.1 with App Router & Turbopack
- **Language:** TypeScript 5 (strict mode)
- **UI:** React 19 + Tailwind CSS 4
- **Auth:** Firebase Authentication (email/password)
- **Storage:** Firebase Storage + AWS S3 (eu-north-1)
- **Backend:** External REST API (configurable via `NEXT_PUBLIC_API_BASE_URL`)

## Directory Structure

```
app/                          # Next.js App Router pages
  (Auth)/signin|signup/       # Authentication pages
  add-game/                   # Add game form
  game/[id]/                  # Game detail page
  Favourites/                 # Favorite games list
  FullyCompleted/             # 100% completed games
  ToBeCompleted/              # Backlog games
  [year]/                     # Games by completion year
components/                   # Reusable React components
lib/                          # Utilities (firebase, api, fetchWithAuth)
```

## Key Patterns & Conventions

### Client Components
- Mark with `'use client'` directive at top
- Use hooks for state management (useState, useEffect, useMemo, useCallback)
- Access auth via `useAuth()` hook from `authProvider`

### ID Field Resolution
Backend uses multiple ID formats - always check all:
```typescript
const id = game.id || game._id || game.gameId || game.itemId;
```

### Boolean Flag Compatibility
Support both formats for game status:
```typescript
const isCompleted = game.isCompleted ?? game.completed;
const isHundredPercent = game.isHundredPercent ?? game.hundredPercent;
const isFavourite = game.isFavourite ?? game.favourite;
```

### API Calls
- Use `fetchWithAuth()` from `lib/fetchWithAuth.ts` for authenticated requests
- Handles token caching (5-min TTL) and auto-refresh
- Use FormData for file uploads, JSON for data-only requests

### Caching Strategy
- Memory cache: 2 minutes for game details
- Session storage: 10 minutes for game details
- Auth tokens: 5 minutes

### Error Handling
- Always show user-facing error messages (alerts or inline)
- Use try-catch with fallback messages
- Log to console for debugging

### Loading States
- Show loading UI during all async operations
- Disable buttons during submission
- Use skeleton loaders for auth checks

## API Endpoints

**Base:** `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8080`)

### Public
- `GET /health` - Cheap DB-free liveness probe used by KeepAlive

### Protected (require Bearer token)
- `GET /admin/games/{id}` - Game details
- `GET /admin/games/byYear/{year}` - Games by year
- `GET /admin/getFavouriteGames` - Favorites
- `GET /admin/getHundredPercentCompletedGames` - 100% completed
- `GET /admin/games/toBeCompleted` - Backlog
- `POST /admin/addGameItem` - Add game
- `PUT /admin/games/{id}` - Update game
- `DELETE /admin/games/{id}` - Delete game
- `PUT /admin/games/{id}/note` - Save note
- `POST /admin/games/{id}/media` - Upload media (FormData)
- `DELETE /admin/games/{id}/media` - Delete media (JSON: {url, type})
- `POST /admin/uploadImage` - Upload cover image

## Styling Guidelines

- **Theme:** Dark mode with blue/purple gradients (`#0a0f1f` to `#0d152d`)
- **Effects:** Glassmorphism (backdrop-blur, semi-transparent backgrounds)
- **Colors:** sky (primary), emerald (completion), amber (year), fuchsia (backlog)
- **Corners:** Rounded (lg, xl, 2xl, 3xl)
- **Animations:** Smooth hover transitions, scale effects
- Use Tailwind classes exclusively - no custom CSS files for components

## Protected Routes

Wrap with `<RequireAuth>` component:
- `/add-game`, `/game/[id]`, `/Favourites`, `/FullyCompleted`, `/ToBeCompleted`, `/[year]`

## Common Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Important Notes

1. **Never** commit sensitive credentials (Firebase config in code is public keys - safe)
2. **Always** validate image URLs before rendering
3. **Always** clean up listeners/intervals on component unmount
4. **Use** `createPortal` for modals/overlays with proper `mounted` state
5. **Prefer** editing existing files over creating new ones
6. **Keep** solutions simple - avoid over-engineering
