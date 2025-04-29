FROM node:20 AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code (excluding .git directory)
COPY --chown=node:node . .
# Remove .git directory if it exists
RUN rm -rf .git .gitignore

# Build the application
RUN pnpm build

# Final image
FROM accetto/debian-vnc-xfce-chromium-g3

USER root

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a dedicated app directory with restricted permissions
RUN mkdir -p /app && \
    chown root:root /app && \
    chmod 755 /app

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/public ./dist/public

# Copy the modified startup script
COPY startup.sh /dockerstartup/

# Set proper file permissions (excluding .git directory)
RUN mkdir -p /app/data && \
    chown headless:headless /app/data && \
    chmod 700 /app/data && \
    # Ensure startup script has proper permissions
    chmod +x /dockerstartup/startup.sh

USER headless
# USER headless
# Expose port
EXPOSE 3000