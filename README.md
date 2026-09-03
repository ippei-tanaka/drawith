# drawith

Drawith is a collaborative canvas for people

## Authentication setup

Drawith uses Neon Managed Better Auth for email/password authentication. Enable Auth for the target branch in the Neon Console under **Project -> Branch -> Auth**, then copy the Auth URL into `.env.local` using [.env.example](.env.example) as a template. Generate the cookie secret with `openssl rand -base64 32`.

The Auth URL and cookie secret are required at runtime:

```bash
NEON_AUTH_BASE_URL=https://your-neon-auth-url.neon.tech
NEON_AUTH_COOKIE_SECRET=your-generated-secret
```

## Development History

- Set up CI and branch rules to protect the `main` branch. The CI workflow runs on pushes and pull requests targeting `main`, installs dependencies with `npm ci`, and verifies the project with lint and production-build checks. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the workflow definition.
