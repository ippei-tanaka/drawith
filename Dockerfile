# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set env vars for build-time auth config (32+ char secret required)
ENV NEON_AUTH_COOKIE_SECRET=dummysecretforbuildonlychangeatruntime123456
ENV DATABASE_URL=postgresql://dummy@localhost/dummy

RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Copy drizzle config and migration files for runtime
COPY drizzle.local.config.ts ./
COPY migrations ./migrations
COPY src/schema.ts ./src/

EXPOSE 3000
CMD ["npm", "start"]
