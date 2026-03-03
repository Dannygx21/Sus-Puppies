# ── Stage 1: Build frontend ────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install all dependencies (devDeps needed for webpack + babel)
COPY package.json package-lock.json ./
RUN npm ci

# Copy everything webpack needs to produce public/bundle.js
COPY .babelrc webpack.config.js ./
COPY src/ ./src/
# public/ already contains index.html, styles.css, and static assets;
# webpack will add bundle.js and hashed media files alongside them
COPY public/ ./public/

RUN npm run build

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies only (no webpack/babel/nodemon)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Compiled frontend — bundle.js + images + sounds + index.html + styles
COPY --from=builder /app/public ./public

# Server source (no transpilation needed — plain Node.js)
COPY server/ ./server/

# Default port; override at runtime with -e PORT=xxxx
EXPOSE 3000

# NODE_ENV must be production so server.js / webpack-runtime behave correctly.
# All other secrets (DB_URL, DB_USER, etc.) are intentionally omitted here —
# pass them at container start with --env-file or -e flags.
ENV NODE_ENV=production

CMD ["node", "server/server.js"]
