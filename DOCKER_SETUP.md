# Docker Setup for Drawith

This guide covers development and production Docker setups using compose watch for hot reload.

## Files

- **Dockerfile.dev** – Development single-stage build (fast, hot reload)
- **Dockerfile.prod** – Production multi-stage build (optimized, smaller image)
- **docker-compose.dev.yml** – Development environment
- **docker-compose.prod.yml** – Production environment
- **.env.docker.dev** – Development environment variables (from env.docker.dev.example)
- **.env.docker.prod** – Production environment variables (from env.docker.prod.example)
- **drizzle.local.config.ts** – Drizzle config for local development

## Development Setup

### Prepare environment

```bash
cp env.docker.dev.example .env.docker.dev
```

Edit `.env.docker.dev` if needed (defaults are fine for local development):
```
NODE_ENV=development
POSTGRES_USER=your-secure-postgres-password-here
POSTGRES_PASSWORD=your-secure-postgres-password-here
POSTGRES_DB=drawith_db
```

### Start development environment

```bash
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up --build --watch
```

This:
- Loads environment from `.env.docker.dev`
- Builds `Dockerfile.dev` with all dependencies
- Starts PostgreSQL on localhost:5432
- Starts Next.js dev server on localhost:3000
- Watches files in `./app`, `./src`, `./lib`, `./public` for changes (hot reload)
- Rebuilds image if `package.json` changes

### Stop development

```bash
docker compose -f docker-compose.dev.yml down
```

### View logs

```bash
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml logs -f postgres
```

### Database commands

Generate migrations:
```bash
docker compose -f docker-compose.dev.yml exec app npm run db:generate
```

Run migrations:
```bash
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

Connect to PostgreSQL directly:
```bash
docker compose -f docker-compose.dev.yml exec postgres psql -U drawith_user -d drawith_db
```

### Access container shell

```bash
docker compose -f docker-compose.dev.yml exec app /bin/sh
```

### Full rebuild (clean slate)

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up --build --watch
```

The `-v` flag removes all volumes (including database data).

## Production Setup

### Prepare environment

```bash
cp env.docker.prod.example .env.docker.prod
```

Edit `.env.docker.prod` with real values:
```
NODE_ENV=production
POSTGRES_USER=drawith_user
POSTGRES_PASSWORD=your-secure-postgres-password-here
POSTGRES_DB=drawith_db
```

**Never commit `.env.docker.prod` to git.**

### Start production

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d
```

The `-d` flag runs containers in background (detached mode).

### Stop production

```bash
docker compose -f docker-compose.prod.yml down
```

### View production logs

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

### Database setup for production

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod exec app npm run db:generate
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod exec app npm run db:migrate
```

## Comparison: Dev vs Production

| Feature | Dev | Production |
|---------|-----|------------|
| Dockerfile | `Dockerfile.dev` | `Dockerfile.prod` |
| Compose file | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| Env file | `.env.docker.dev` | `.env.docker.prod` |
| Command | `npm run dev` | `npm start` |
| NODE_ENV | `development` | `production` |
| Watch mode | Yes (`docker compose watch`) | No |
| Restart policy | Manual | `unless-stopped` |
| Healthchecks | Postgres only | Postgres + App |
| Container names | `drawith-app-dev` | `drawith-app-prod` |
| Image size | Larger (dev deps) | Smaller (production build) |

## Environment Variables

### Development (.env.docker.dev)

```
NODE_ENV=development
POSTGRES_USER=drawith_user
POSTGRES_PASSWORD=your-secure-postgres-password-here
POSTGRES_DB=drawith_db
```

### Production (.env.docker.prod)

```
NODE_ENV=production
POSTGRES_USER=drawith_user
POSTGRES_PASSWORD=your-secure-postgres-password-here
POSTGRES_DB=drawith_db
```

## Common Tasks

### Rebuild Docker images

```bash
# Development
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up --build

# Production
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d --build
```

### Clean up everything (containers, networks, volumes, images)

```bash
docker compose -f docker-compose.dev.yml down -v
docker image prune -a
```

### Check container health

```bash
docker compose -f docker-compose.dev.yml ps
docker inspect drawith-postgres
docker inspect drawith-app
```

### SSH into running container

```bash
docker compose -f docker-compose.dev.yml exec app /bin/sh
docker compose -f docker-compose.dev.yml exec postgres /bin/sh
```

## Troubleshooting

### PostgreSQL won't start

Check logs:
```bash
docker compose -f docker-compose.dev.yml logs postgres
```

Common issue: Port 5432 already in use. Either:
- Stop other Postgres: `docker compose -f docker-compose.dev.yml down`
- Change port in `docker-compose.dev.yml`: `"5433:5432"`

### Next.js dev server not reloading

File watch might not be syncing. Restart with:
```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up --build --watch
```

### Database errors during build

Ensure `.env.docker.prod` has correct credentials and environment variables match `docker-compose.prod.yml`.

### TypeScript errors in container

Rebuild image:
```bash
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up --build
```

### Port 3000 already in use

Change port in `docker-compose.dev.yml`: `"3001:3000"` to use 3001 instead.

## Development Workflow

1. Prepare: `cp env.docker.dev.example .env.docker.dev`
2. Start: `docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up --build --watch`
3. Edit code in `./app`, `./src`, `./lib`, `./public`
4. Changes sync automatically (hot reload)
5. If dependencies change, the image rebuilds automatically
6. View logs: `docker compose -f docker-compose.dev.yml logs -f app`
7. Stop: `Ctrl+C` in terminal

## Production Deployment

1. Prepare: `cp env.docker.prod.example .env.docker.prod` and fill in real values
2. Build and push image to registry (if using CI/CD)
3. Pull on production server
4. Run: `docker compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d`
5. Monitor: `docker compose -f docker-compose.prod.yml --env-file .env.docker.prod logs -f app`
6. Database migrations: `docker compose -f docker-compose.prod.yml --env-file .env.docker.prod exec app npm run db:migrate`
