# Stage 1: Build stage
FROM node:18-slim AS builder

ARG OBFUSCATE=false

ENV NODE_ENV=production \
    APP_DIR=/app

WORKDIR ${APP_DIR}

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && \
    pnpm install

COPY . .
RUN pnpm run build

RUN if [ "$OBFUSCATE" = "true" ]; then \
      echo "Obfuscating code..." && \
      npm install -g javascript-obfuscator && \
      find ./dist -type f -name "*.js" -exec javascript-obfuscator {} --output {} \; ; \
    else \
      echo "Skipping code obfuscation..." ; \
    fi

# Stage 2: Runtime stage
FROM accetto/debian-vnc-xfce-firefox-g3

ENV NODE_ENV=production \
    APP_DIR=/app

# Switch to root to install dependencies
USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg apt-transport-https \
    libxtst6 && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g pnpm pm2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR ${APP_DIR}

COPY package.json ./
COPY --from=builder ${APP_DIR}/node_modules ./node_modules
COPY --from=builder ${APP_DIR}/dist ./dist

# Create logs directory and set permissions
RUN mkdir -p ${APP_DIR}/dist/logs && \
    chown -R headless:headless ${APP_DIR}

# Switch back to the default user (usually 'abc' in accetto images)
USER headless

EXPOSE 8080

CMD ["pm2-runtime", "/app/dist/index.js"]