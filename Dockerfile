# Multi-stage Next.js image — same pattern as beam-dashboard (Node Alpine, deps → build → run).
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat

FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No NEXT_PUBLIC_* required; GOOGLE_APPS_SCRIPT_URL is runtime-only on the server.
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start", "--", "-p", "3000"]
