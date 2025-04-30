# syntax=docker/dockerfile:1.4

# Build stage for Node.js application
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

# Final stage with Ubuntu, XFCE and VNC
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    VNC_PASSWORD=password \
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
    tightvncserver \
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
    xfonts-base \
    xfonts-100dpi \
    xfonts-75dpi \
    xfonts-cyrillic \
    fonts-dejavu \
    fonts-liberation \
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

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up noVNC (if not included in novnc package)
RUN git clone https://github.com/novnc/noVNC.git /opt/novnc \
    && git clone https://github.com/novnc/websockify /opt/novnc/utils/websockify \
    && ln -s /opt/novnc/vnc.html /opt/novnc/index.html

# Create two separate users: one for VNC and one for Node.js
RUN useradd -m -s /bin/bash vncuser && \
    useradd -m -s /bin/bash nodeuser

# Set up VNC for vncuser
USER vncuser
RUN mkdir -p /home/vncuser/.vnc && \
    mkdir -p /home/vncuser/Desktop && \
    echo "password" | vncpasswd -f > /home/vncuser/.vnc/passwd && \
    chmod 600 /home/vncuser/.vnc/passwd

# Create a simple xstartup file
RUN echo '#!/bin/bash\nexport XKL_XMODMAP_DISABLE=1\nunset SESSION_MANAGER\nunset DBUS_SESSION_BUS_ADDRESS\nxrdb $HOME/.Xresources\nstartxfce4 &' > /home/vncuser/.vnc/xstartup && \
    chmod +x /home/vncuser/.vnc/xstartup && \
    touch /home/vncuser/.Xauthority && \
    chown vncuser:vncuser /home/vncuser/.Xauthority && \
    chmod 600 /home/vncuser/.Xauthority

# Switch back to root to copy and run the Chromium shortcut script
USER root

# Add desktop shortcuts for Chromium
COPY chromium_desktop.sh /tmp/
RUN chmod +x /tmp/chromium_desktop.sh && \
    /tmp/chromium_desktop.sh && \
    rm /tmp/chromium_desktop.sh

# Copy start script
COPY <<-'EOT' /start.sh
#!/bin/bash
set -e

# Start VNC server as vncuser
sudo -u vncuser vncserver :1 -geometry ${VNC_RESOLUTION} -depth ${VNC_COL_DEPTH}

# Start noVNC as vncuser (for correct permissions)
sudo -u vncuser /opt/novnc/utils/websockify/run --web=/opt/novnc ${NOVNC_PORT} 0.0.0.0:${VNC_PORT} &

# Start Node.js server as nodeuser (in background, logs to file)
sudo -u nodeuser NODE_ENV=production node /app/dist/main/main.js > /home/nodeuser/node.log 2>&1 &

# Display access URLs
echo "========================================================================"
echo "VNC server started on port ${VNC_PORT}"
echo "noVNC interface available at http://0.0.0.0:${NOVNC_PORT}/vnc.html"
echo "Node.js server running on port 3000"
echo "========================================================================"

# Show running processes for verification
ps aux

# Keep the container running
tail -f /dev/null
EOT

RUN chmod +x /start.sh

# Configure sudo to allow running commands as specific users without password
RUN echo "root ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers && \
    echo "vncuser ALL=(vncuser) NOPASSWD: ALL" >> /etc/sudoers && \
    echo "nodeuser ALL=(nodeuser) NOPASSWD: ALL" >> /etc/sudoers

# Copy the Node.js app
WORKDIR /app
COPY --from=builder --chown=nodeuser:nodeuser /app/dist /app/dist
COPY --from=builder --chown=nodeuser:nodeuser /app/node_modules /app/node_modules

# Set strict permissions to ensure vncuser cannot access Node.js files
RUN chown -R nodeuser:nodeuser /app && \
    chmod -R 750 /app && \
    setfacl -R -m u:vncuser:--- /app || echo "ACL support not available, using basic permissions" && \
    chmod 755 /app && \
    chown -R nodeuser:nodeuser /home/nodeuser && \
    chmod 700 /home/nodeuser

# Expose VNC, noVNC, and Node.js ports
EXPOSE 5901 6901 3000

# Set the entry point
CMD ["/start.sh"]