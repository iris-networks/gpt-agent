# syntax=docker/dockerfile:1.4
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    VNC_PASSWORD=SecurePassword123 \
    VNC_RESOLUTION=1280x800 \
    VNC_COL_DEPTH=24 \
    VNC_PORT=5901 \
    NOVNC_PORT=6901

# Install core packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    xfce4-terminal \
    xfce4-goodies \
    slim \
    tigervnc-standalone-server tigervnc-common tigervnc-xorg-extension tigervnc-tools \
    novnc \
    python3 \
    python3-pip \
    python3-numpy \
    net-tools \
    curl \
    wget \
    git \
    sudo \
    dbus-x11 \
    x11-xserver-utils \
    xauth \
    xvfb \
    xfce4-session \
    xfce4-panel \
    xfce4-settings \
    acl \
    xfonts-base \
    xfonts-100dpi \
    xfonts-75dpi \
    xfonts-cyrillic \
    fonts-dejavu \
    fonts-liberation \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome instead of Chromium (avoids snap issues)
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget gnupg software-properties-common apt-transport-https ca-certificates && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends google-chrome-stable \
    adwaita-icon-theme-full && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

# Set up noVNC (if not included in novnc package)
RUN git clone https://github.com/novnc/noVNC.git /opt/novnc \
    && git clone https://github.com/novnc/websockify /opt/novnc/utils/websockify \
    && ln -s /opt/novnc/vnc.html /opt/novnc/index.html