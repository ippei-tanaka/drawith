# drawith

Drawith is a collaborative canvas for people.


## Development History

### CI

- Set up CI and branch rules to protect the `main` branch. The CI workflow runs on pushes and pull requests targeting `main`, installs dependencies with `npm ci`, and verifies the project with lint and production-build checks. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the workflow definition.

### Docker

- **Development**: Containerized Next.js and PostgreSQL services with docker compose watch for automatic source synchronization and hot reload.
- **Production**: Multi-stage Docker build that creates a smaller optimized image running the Next.js production server.
- **Database**: PostgreSQL runs as a separate container with persistent Docker volumes.
- Configuration: Development and production environments use separate Compose files and environment-specific configuration.
- **Database** migrations: Drizzle ORM migrations can be generated and executed directly inside the application container.

 See [`.github/DOCKER_SETUP.md`](.github/DOCKER_SETUP.md) for details.