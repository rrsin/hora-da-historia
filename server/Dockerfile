# Debian-based (not alpine): better-sqlite3 needs to compile a native
# addon, and glibc images have far fewer surprises doing that on arm64
# (Raspberry Pi) than musl/alpine does.
FROM node:20-bookworm-slim AS base

WORKDIR /app

# Build tools only needed to compile better-sqlite3's native addon.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# SQLite file lives on a mounted volume, not in the image.
ENV DB_PATH=/app/data/stories.db
ENV PORT=4000
RUN mkdir -p /app/data

RUN useradd --create-home --shell /bin/bash appuser \
  && chown -R appuser:appuser /app
USER appuser

EXPOSE 4000

CMD ["node", "server.js"]
