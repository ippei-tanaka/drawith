# Local PostgreSQL Setup for Drawith

Your Next.js app is now configured to use Docker with local PostgreSQL instead of Neon.

## Files Created/Modified

- **Dockerfile** – Multi-stage build with Node.js 20 Alpine; copies migrations config for runtime
- **docker-compose.yml** – PostgreSQL 16 Alpine + Next.js app service with healthchecks
- **.dockerignore** – Excludes node_modules, .env files, and build artifacts
- **drizzle.local.config.ts** – Drizzle config pointing to local Postgres
- **.env.docker** – Database URL for Docker environment

## Running the App

```bash
docker compose up --pull always
```

This starts:
- PostgreSQL 16 on localhost:5432 (user: `drawith_user`, password: `drawith_password`, database: `drawith_db`)
- Next.js app on localhost:3000

## Database Setup

To create tables from your Drizzle schema:

```bash
docker compose exec app npm run db:generate
docker compose exec app npm run db:migrate
```

Or manually connect and run SQL:

```bash
docker compose exec postgres psql -U drawith_user -d drawith_db
```

## Environment Variables

Update the `DATABASE_URL` in `docker-compose.yml` and `.env.docker` if you change credentials. The app will automatically pass these at runtime.

## Notes

- Build time: ~30s (Next.js + npm install)
- Database persists in Docker volume `drawith_postgres_data`
- To reset: `docker compose down -v`
