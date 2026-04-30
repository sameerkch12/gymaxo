# Gymaxo Backend

Production-style Node.js + Express + MongoDB API for the Gymaxo gym app.

## Setup

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

Default API: `http://localhost:4000/api`

Demo accounts after seed:

- Owner: `9999900001` / `owner123`
- Member: `9999900002` / `member123`

## Structure

- `src/models`: Mongoose schemas, one file per business model
- `src/validators`: zod request schemas
- `src/services`: business logic
- `src/controllers`: Express request/response handlers
- `src/routes`: endpoint wiring
- `src/middleware`: auth, validation, error handling
