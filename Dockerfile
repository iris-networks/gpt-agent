# =============================================================================
# STABLE BASE - All system dependencies (doesn't change frequently)
# =============================================================================
FROM lscr.io/linuxserver/webtop:ubuntu-xfce AS stable-base

# Environment variables
ENV TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    CUSTOM_PORT=6901 \
    PNPM_HOME="/root/.local/share/pnpm" \
    PATH="$PATH:/root/.local/share/pnpm" \
    SHELL="/bin/bash"

# Install system packages first
RUN if command -v apt-get >/dev/null 2>&1; then \
        apt-get update && apt-get install -y \
        ffmpeg xauth imagemagick scrot sudo curl tree \
        wmctrl xdotool unzip acl gnupg wget ca-certificates \
        software-properties-common apt-transport-https libreoffice; \
    elif command -v apk >/dev/null 2>&1; then \
        apk update && apk add --no-cache \
        ffmpeg xauth imagemagick sudo curl tree unzip acl libreoffice; \
    else \
        echo "No supported package manager found" && exit 1; \
    fi

# Install Node.js and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && mkdir -p /root/.local/share/pnpm \
    && pnpm config set global-bin-dir /root/.local/share/pnpm

# Install build dependencies for native modules (robotjs)
RUN apt-get install -y build-essential libxtst6 libxtst-dev libxinerama-dev \
    libx11-dev libxkbfile-dev libpng-dev libxrandr-dev libxrender-dev \
    libxinerama1 libxrandr2 libxss1

# Install node-gyp via npm to avoid dependency conflicts
RUN npm install -g node-gyp

# Install UV (Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && cp $HOME/.local/bin/uv /usr/local/bin/uv \
    && cp $HOME/.local/bin/uvx /usr/local/bin/uvx \
    && uv --version

# Setup base directories
RUN mkdir -p /app \
    && mkdir -p /app/screenshots \
    && mkdir -p /config/.cache \
    && mkdir -p /config/.pnpm \
    && mkdir -p /config/.npm \
    && mkdir -p /config/files \
    && chown -R 1000:1000 /config \
    && chmod -R 755 /config

# =============================================================================
# APPLICATION - Build your app on the stable base
# =============================================================================
FROM stable-base AS app

# Copy service scripts and custom scripts
COPY docker/custom-scripts/services.d/ /custom-services.d/
COPY docker/custom-scripts/custom-cont-init.d/ /custom-cont-init.d/

# Set working directory
WORKDIR /app

# Copy package files first for dependency caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (this layer will be cached unless package.json changes)
RUN npm config set cache /tmp/.npm-cache \
    && pnpm install

# Rebuild native modules for current architecture (robotjs)
RUN pnpm rebuild

# Fix robotjs for ARM64 by installing dependencies and rebuilding
RUN cd node_modules/.pnpm/@hurdlegroup+robotjs@*/node_modules/@hurdlegroup/robotjs && \
    npm install && \
    cd /app

# Copy source code and config files (these change most frequently)
COPY src/ ./src/
COPY tsconfig.json nest-cli.json .env ./

# Build the application
RUN pnpm run build

# COPY docker/selkies/index.js /tmp/custom-index.js
# RUN /bin/bash -c 'if [ -d /usr/share/selkies/www/assets ]; then \
#     INDEX_FILE=$(find /usr/share/selkies/www/assets -name "index-*.js" | head -1); \
#     if [ -n "$INDEX_FILE" ]; then \
#         cp "$INDEX_FILE" "${INDEX_FILE}.bak" && \
#         cp /tmp/custom-index.js "$INDEX_FILE" && \
#         echo "Replaced $INDEX_FILE with custom version"; \
#     else \
#         echo "No index-*.js file found to replace"; \
#     fi; \
# fi'

# Copy XFCE4 configuration files
# COPY docker/xfce4/ /config/.config/xfce4/
# RUN chown -R abc:abc /config/.config/xfce4

EXPOSE 3000