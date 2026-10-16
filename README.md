# Game Library

A personal website for tracking the games I play each year: completed games by year, favourites, 100% completions and a backlog, with cover art, notes, gallery images and videos for each game.

- Frontend: Next.js 16 (this repo)
- Backend: Spring Boot + SQLite ([GameLibrary-Backend-SpringBoot](https://github.com/Sajeewa30/GameLibrary-Backend-SpringBoot))
- Auth: Firebase Authentication (email/password)

## Running locally

1. Start the backend (see its `LOCAL-SETUP.md`). It listens on `http://localhost:8080`.
2. Install and start the frontend:

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` if the backend runs somewhere other than `http://localhost:8080`.
