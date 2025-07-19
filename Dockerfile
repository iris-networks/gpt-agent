FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Environment variables
ENV TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    CUSTOM_PORT=6901

# Basic update and install packages including chromium
RUN if command -v apt-get >/dev/null 2>&1; then \
        apt-get update && apt-get install -y ffmpeg xauth imagemagick scrot sudo curl tree wmctrl xdotool unzip acl; \
    elif command -v apk >/dev/null 2>&1; then \
        apk update && apk add --no-cache ffmpeg xauth imagemagick sudo curl tree unzip acl; \
    else \
        echo "No supported package manager found" && exit 1; \
    fi

# Install Node.js and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# Install uv (Python package manager) system-wide
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    cp $HOME/.local/bin/uv /usr/local/bin/uv && \
    cp $HOME/.local/bin/uvx /usr/local/bin/uvx && \
    uv --version

# Setup directories (running as root)
RUN mkdir -p /app && \
    mkdir -p /app/screenshots && \
    mkdir -p /config/.cache && \
    mkdir -p /config/.pnpm

# Copy service scripts and custom scripts (these change less frequently)
COPY docker/custom-scripts/services.d/ /custom-services.d/
COPY docker/custom-scripts/custom-cont-init.d/ /custom-cont-init.d/

# Set working directory
WORKDIR /app

# Copy package files first for dependency caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (this layer will be cached unless package.json changes)
RUN pnpm install && \
    pnpm add -g @agent-infra/mcp-server-browser@latest

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