# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set env vars for build-time auth config (32+ char secret required)
#ENV NEON_AUTH_COOKIE_SECRET=dummysecretforbuildonlychangeatruntime123456
#ENV DATABASE_URL=postgresql://dummy@localhost/dummy
ENV DATABASE_URL=postgresql://drawith_user:drawith_password@postgres:5432/drawith_db

RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci --only=production

COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node drizzle.config.ts ./
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node src ./src
COPY --chown=node:node lib ./lib

USER node
EXPOSE 3000
CMD ["npm", "start"]
