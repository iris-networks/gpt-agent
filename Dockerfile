# syntax=docker/dockerfile:1.4

# Build stage for Node.js application
FROM node:20-slim as builder

# Install build dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage build cache
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy remaining files and build
COPY . .
# Build the NestJS application
RUN pnpm run build

# Final stage with accetto/ubuntu-vnc-xfce-chromium-g3
FROM accetto/debian-vnc-xfce-firefox-g3:latest

# Switch to root user for installations
USER root

# Install additional dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg python3 python3-pip python3-numpy \
    libxtst6 libxss1 libnss3 libatk1.0-0 libatk-bridge2.0-0 libgbm1 libpango-1.0-0 libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x and pnpm
RUN apt-get update && apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    rm -rf /var/lib/apt/lists/*

# Create app directory and set permissions
WORKDIR /app

# Copy the Node.js app to /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY .env /app/.env

# Set correct permissions for app files
RUN chown -R headless:headless /app

# Configure sudo for headless user
RUN apt-get update && apt-get install -y sudo && rm -rf /var/lib/apt/lists/* && \
    echo "headless ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/headless

# Create our custom entrypoint script
COPY <<-'EOT' /dockerstartup/custom-entrypoint.sh
#!/bin/bash
set -e

# Start Node.js server in the background as root
echo "Starting NestJS server..."
cd /app
(
    # Run as root directly
    NODE_ENV=production pnpm run start:prod 2>&1 | tee /tmp/node.log
) &

# Display access URLs
echo "========================================================================"
echo "NestJS API available at http://0.0.0.0:3000/api"
echo "API documentation available at http://0.0.0.0:3000/api/docs"
echo "========================================================================"

# Execute the original entrypoint with all arguments
exec /dockerstartup/startup.sh "$@"
EOT

RUN chmod +x /dockerstartup/custom-entrypoint.sh

# Expose Node.js port (VNC ports are already exposed by the base image)
EXPOSE 3000

# Use our custom entrypoint script (stay as root)
ENTRYPOINT ["/dockerstartup/custom-entrypoint.sh"]