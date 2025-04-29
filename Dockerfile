# Enable Docker BuildKit features
# syntax=docker/dockerfile:1.4

# Use Node 20 base image
FROM node:20-slim as builder

# Install build dependencies with pnpm
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage build cache
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy remaining files and build
COPY . .
RUN pnpm run build

# Final stage with XFCE, X11, VNC, noVNC and Chromium
FROM ubuntu:22.04

# Install core XFCE and X11 packages with build caching
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    xfce4 \
    x11vnc \
    xvfb \
    python3 \
    python3-pip \
    git \
    net-tools \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Chromium and themes
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    chromium-browser \
    light-themes \
    && rm -rf /var/lib/apt/lists/*

# Install VNC server, noVNC, and Node.js
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    tightvncserver \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && git clone https://github.com/novnc/noVNC.git /opt/novnc \
    && git clone https://github.com/novnc/websockify /opt/novnc/utils/websockify \
    && chmod +x /opt/novnc/utils/websockify/websockify \
    && ln -s /opt/novnc/vnc.html /opt/novnc/index.html \
    && pip3 install websockify

# Create restricted user
RUN useradd -m restricteduser && \
    mkdir -p /home/restricteduser/.vnc && \
    chown -R restricteduser:restricteduser /home/restricteduser

WORKDIR /app
# Copy built application and node_modules from builder with proper permissions
COPY --from=builder /app/ /app
# Fix directory structure to match expected paths but ensure execute permissions
RUN chown -R restricteduser:restricteduser /app \
    && find /app -type d -exec chmod 550 {} \; \
    && find /app -type f -exec chmod 440 {} \; \
    && find /app/dist -type f -name "*.js" -exec chmod 550 {} \;

# Set up VNC password
USER restricteduser
RUN echo "password" | vncpasswd -f > /home/restricteduser/.vnc/passwd && \
    chmod 600 /home/restricteduser/.vnc/passwd

# Expose VNC and noVNC ports
EXPOSE 5900 6901

# Start VNC server and noVNC
CMD ["sh", "-c", "x11vnc -forever -usepw -create & cd /opt/novnc/utils && python3 websockify/websockify --web=/opt/novnc 6901 localhost:5900 & node /app/dist/main/main.js"]