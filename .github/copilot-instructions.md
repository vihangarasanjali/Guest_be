<!-- Copilot / AI agent instructions for the Guest_be repository -->
# Project Snapshot (what an AI needs to know)

- **Structure:** a NestJS backend lives in `backend/`. This repo is a small API server (controllers, services) using Prisma as the ORM.
- **Database:** Prisma + PostgreSQL. Schema at `backend/prisma/schema.prisma`. Prisma client is configured in `backend/prisma.config.ts` and expects `DATABASE_URL` from `backend/.env`.
- **Local infra:** `docker-compose.yml` defines `postgres` and `redis` services used for local development (Postgres credentials: `admin` / `admin123`, DB `guesthouse`).

# High-level architecture

- The backend is a NestJS app (`backend/src/`). Entry point is `backend/src/main.ts` which boots `AppModule`.
- There are simple controller/service modules by Nest conventions. Prisma is used directly through the exported `prisma` client in `backend/prisma.config.ts` (not a Nest `PrismaService` wrapper in this template).
- Data flows: HTTP requests → Nest controllers → services → Prisma client → Postgres.

# Essential developer workflows (explicit commands)

- Install dependencies:
  - `cd backend && npm install`
- Start local infra (Postgres + Redis):
  - `docker-compose up -d` (run from repo root)
- Set environment variables:
  - Edit `backend/.env` (it already contains a `DATABASE_URL` matching `docker-compose.yml`).
- Prisma / migrations (common pitfall explained below):
  - Ensure environment vars are loaded by Prisma when running CLI commands. Either:
    - Add `import "dotenv/config";` at the top of `backend/prisma.config.ts`, or
    - Run migrations with environment loaded (start a shell with env or export the var yourself).
  - Typical commands:
    - `npx prisma migrate dev --name init --schema ./prisma/schema.prisma --config ./prisma.config.ts`
    - `npx prisma generate --schema=./prisma/schema.prisma`
- Run app (development):
  - `npm run start:dev` (from `backend/`)
- Run tests:
  - Unit: `npm run test`
  - E2E: `npm run test:e2e` (config in `backend/test/jest-e2e.json`)
- Build / production:
  - `npm run build` then `npm run start:prod`

# Project-specific conventions & patterns

- Files to edit for core behavior:
  - `backend/src/` — controllers, services, modules.
  - `backend/prisma/schema.prisma` — DB models.
  - `backend/prisma.config.ts` — single exported `prisma` client used throughout the code.
- Scripts and tooling:
  - Linting/formatting: `npm run lint`, `npm run format`.
  - Tests use Jest configured in `package.json` (rootDir: `src`).
- Keep changes minimal to the Nest module system. The starter uses the default Nest project layout — follow that when adding features.

# Integration points & external dependencies

- Database: Postgres (image `postgres:15` in `docker-compose.yml`).
- ORM: Prisma (`@prisma/client`, `prisma` CLI). Remember Prisma requires environment vars at runtime for some CLI commands.
- Redis is available if you add caching/session features (`redis:7` in `docker-compose.yml`).

# Common pitfalls and troubleshooting

- Migration errors like `environment variable not found` usually mean Prisma couldn't read `DATABASE_URL`. Fix by adding `import "dotenv/config";` to `backend/prisma.config.ts` or ensuring the env is exported before running the CLI.
- If migrations fail but Postgres is not reachable, ensure `docker-compose up -d` is running and `5432` is available. Use `docker ps` and `docker logs` to inspect.
- If Jest can't find files, confirm working directory is `backend/` when running `npm run test`.

# Useful file references (examples to point at)

- `backend/prisma.config.ts` — exported `prisma` client (where to add `dotenv/config`).
- `backend/prisma/schema.prisma` — model definitions (User model exists).
- `backend/package.json` — scripts for build/test/lint/start.
- `docker-compose.yml` — local Postgres/Redis configuration and credentials.

# How the AI should behave when contributing

- Be conservative: follow existing NestJS module/service/controller patterns.
- When adding DB migrations or running Prisma commands, always document environment steps and prefer non-destructive migration names in PR descriptions.
- Avoid changing fundamental project structure (move within `backend/`, add modules under `src/`).

---
If anything here is unclear or you'd like the file to include suggested code fixes (for example, adding `import "dotenv/config";` to `backend/prisma.config.ts` and running a migration), tell me and I will implement and test them.
