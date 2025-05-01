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
COPY package.json package-lock.json ./
RUN npm ci

# Copy remaining files and build
COPY . .
# Build the NestJS application
RUN npm run build

# Final stage with Ubuntu, XFCE and VNC
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
    mkdir -p /home/vncuser/.config/xfce4 && \
    mkdir -p /home/vncuser/.config/xfce4/xfconf/xfce-perchannel-xml && \
    echo "${VNC_PASSWORD}" | /usr/bin/vncpasswd -f > /home/vncuser/.vnc/passwd && \
    chmod 600 /home/vncuser/.vnc/passwd

# Create a simple xstartup file
RUN echo '#!/bin/bash\nexport XKL_XMODMAP_DISABLE=1\nexport XDG_SESSION_TYPE=x11\nexport XDG_CURRENT_DESKTOP=XFCE\nexport XDG_CONFIG_DIRS=/etc/xdg\nunset SESSION_MANAGER\nunset DBUS_SESSION_BUS_ADDRESS\nexec dbus-launch --exit-with-x11 startxfce4' > /home/vncuser/.vnc/xstartup && \
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
sudo -u vncuser /usr/bin/vncserver :1 -geometry ${VNC_RESOLUTION} -depth ${VNC_COL_DEPTH} -localhost no

# Start noVNC as vncuser (for correct permissions)
sudo -u vncuser /opt/novnc/utils/websockify/run --web=/opt/novnc ${NOVNC_PORT} 0.0.0.0:${VNC_PORT} &

# Start D-Bus system daemon if not running
if [ ! -e /var/run/dbus/system_bus_socket ]; then
  mkdir -p /var/run/dbus
  dbus-daemon --system --fork
fi

# Make sure .Xauthority is accessible
cp /home/vncuser/.Xauthority /home/vncuser/.Xauthority.copy
sudo -u vncuser mv /home/vncuser/.Xauthority.copy /home/vncuser/.Xauthority
chmod 600 /home/vncuser/.Xauthority
chown vncuser:vncuser /home/vncuser/.Xauthority

# Start Node.js server as nodeuser with DISPLAY variable (in background, logs to file)
# We also need to share X authentication from vncuser to nodeuser
cp /home/vncuser/.Xauthority /home/nodeuser/.Xauthority
chown nodeuser:nodeuser /home/nodeuser/.Xauthority
sudo -u nodeuser bash -c 'export DISPLAY=:1 && cd /app && NODE_ENV=production npm run start:prod > /home/nodeuser/node.log 2>&1 &'

# Display access URLs
echo "========================================================================"
echo "VNC server started on port ${VNC_PORT}"
echo "noVNC interface available at http://0.0.0.0:${NOVNC_PORT}/vnc.html"
echo "NestJS API available at http://0.0.0.0:3000/api"
echo "API documentation available at http://0.0.0.0:3000/api/docs"
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
COPY --from=builder --chown=nodeuser:nodeuser /app/package.json /app/package.json
# Create .env file with production settings if needed
RUN echo "NODE_ENV=production" > /app/.env

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