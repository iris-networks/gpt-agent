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

# Final stage with Ubuntu
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    DEBIAN_PRIORITY=high \
    VNC_PASSWORD=SecurePassword123 \
    VNC_RESOLUTION=1280x800 \
    VNC_COL_DEPTH=24 \
    VNC_PORT=5901 \
    NOVNC_PORT=6901 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    NODE_APP_DIR=/app \
    VNC_HOME=/home/vncuser

# Desktop environment: X server, XFCE, and basic utilities
RUN yes | unminimize && \
    apt-get update && \
    # X window server:
    apt-get install -y xserver-xorg xorg x11-xserver-utils xvfb x11-utils xauth && \
    # XFCE desktop environment:
    apt-get install -y xfce4 xfce4-goodies && \ 
    # Basic system utilities:
    apt-get install -y util-linux sudo curl git wget && \
    # Pip for Python packages:
    apt-get install -y python3-pip && \ 
    # Tools for desktop operations:
    apt-get install -y xdotool scrot ffmpeg && \
    # Set default terminal
    ln -sf /usr/bin/xfce4-terminal.wrapper /etc/alternatives/x-terminal-emulator

# Install VNC and NoVNC for streaming
RUN apt-get install -y x11vnc net-tools netcat && \
    pip install numpy && \
    mkdir -p /opt/noVNC && \
    cd /opt && \
    git clone https://github.com/novnc/noVNC.git && \
    cd noVNC && \
    git checkout v1.4.0 && \
    ln -s vnc.html index.html && \
    cd /opt && \
    git clone https://github.com/novnc/websockify.git && \
    cd websockify && \
    git checkout v0.11.0 && \
    mv /opt/websockify /opt/noVNC/utils/

# Install Chromium from existing Dockerfile approach
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium-browser \
    adwaita-icon-theme \
    procps \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/chromium-browser /usr/bin/google-chrome \
    && ln -sf /usr/bin/chromium-browser /usr/bin/google-chrome-stable

# Install Node.js 20.x and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

# Add Chrome desktop shortcut
COPY chromium_desktop.sh /tmp/
RUN chmod +x /tmp/chromium_desktop.sh && \
    /tmp/chromium_desktop.sh && \
    rm /tmp/chromium_desktop.sh

# We no longer need the standalone VNC script since it's integrated in vncService.ts

# Create separate user for VNC and Node
RUN groupadd -g 1000 vncgroup && \
    useradd -m -s /bin/bash -u 1000 -g 1000 vncuser && \
    groupadd -g 1001 nodegroup && \
    useradd -m -s /bin/bash -u 1001 -g 1001 nodeuser

# Create VNC directories and password file
RUN mkdir -p ${VNC_HOME}/.vnc && \
    x11vnc -storepasswd ${VNC_PASSWORD} ${VNC_HOME}/.vnc/passwd && \
    chmod 600 ${VNC_HOME}/.vnc/passwd && \
    chown -R vncuser:vncgroup ${VNC_HOME}

# Setup Node app directory with proper permissions
WORKDIR ${NODE_APP_DIR}
COPY --from=builder /app/dist ${NODE_APP_DIR}/dist
COPY --from=builder /app/node_modules ${NODE_APP_DIR}/node_modules
COPY --from=builder /app/package.json ${NODE_APP_DIR}/package.json
COPY --from=builder /app/pnpm-lock.yaml ${NODE_APP_DIR}/pnpm-lock.yaml

# Create a secure location for environment variables
RUN mkdir -p ${NODE_APP_DIR}/config && \
    touch ${NODE_APP_DIR}/config/.env && \
    chown -R nodeuser:nodegroup ${NODE_APP_DIR} && \
    chmod -R 750 ${NODE_APP_DIR}

# Copy environment variables from builder (if exists)
COPY --from=builder --chown=nodeuser:nodegroup /app/.env ${NODE_APP_DIR}/config/.env

# Set up strict directory permissions
RUN mkdir -p /var/run/xfce && \
    chown -R vncuser:vncgroup /var/run/xfce && \
    chmod 755 ${NODE_APP_DIR} && \
    chmod 750 ${NODE_APP_DIR}/config && \
    chmod 640 ${NODE_APP_DIR}/config/.env

# Update vncService.ts paths if needed
RUN cd ${NODE_APP_DIR}/dist && \
    find . -type f -name "*.js" -exec sed -i "s|/app/.vnc/passwd|${VNC_HOME}/.vnc/passwd|g" {} \; && \
    chown -R nodeuser:nodegroup ${NODE_APP_DIR}/dist

# Configure sudo for services
RUN apt-get update && apt-get install -y sudo && \
    echo "nodeuser ALL=(root) NOPASSWD: /usr/bin/Xvfb, /usr/bin/startxfce4, /usr/bin/x11vnc" >> /etc/sudoers && \
    echo "nodeuser ALL=(vncuser) NOPASSWD: ALL" >> /etc/sudoers

# Copy desktop background for XFCE
COPY ./wallpaper.png /usr/share/backgrounds/xfce/wallpaper.png
RUN mkdir -p ${VNC_HOME}/.config/xfce4/xfconf/xfce-perchannel-xml/ && \
    chown -R vncuser:vncgroup /usr/share/backgrounds/xfce/wallpaper.png
COPY ./xfce4-desktop.xml ${VNC_HOME}/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml
RUN chown -R vncuser:vncgroup ${VNC_HOME}/.config

# Expose VNC, noVNC, and Node.js ports
EXPOSE 5901 6901 3000

# Switch to nodeuser
USER nodeuser

# Set environment variables for Node
ENV NODE_ENV=production \
    NODE_PATH=${NODE_APP_DIR} \
    PATH=${NODE_APP_DIR}/node_modules/.bin:$PATH \
    NODE_CONFIG_DIR=${NODE_APP_DIR}/config

# Set the entry point
CMD ["pnpm", "run", "start:prod"]