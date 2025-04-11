# Use a slim Debian base image
FROM debian:bullseye-slim AS builder

# Arguments for versions
ARG NODE_VERSION=18
ARG NOVNC_VERSION=1.4.0

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    TERM=xterm \
    USER=abc \
    HOME=/home/abc \
    APP_DIR=/app \
    NOVNC_HOME=/usr/local/novnc \
    # Default VNC resolution
    VNC_RESOLUTION=1280x800 \
    # Default VNC password if not set via ENV
    VNC_PW=password

# Create non-root user and directories
RUN useradd --create-home --shell /bin/bash ${USER} && \
    mkdir -p ${APP_DIR} ${HOME}/.vnc && \
    chown -R ${USER}:${USER} ${HOME}

# Install essential dependencies, Node.js source repo, Supervisor, VNC, X11, Openbox, Nut.js deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Essentials & Build Tools
    curl \
    gnupg \
    sudo \
    build-essential \
    pkg-config \
    python3 \
    # Node.js install prerequisite
    ca-certificates \
    # Supervisor process manager
    supervisor \
    # VNC Server & X11 server/utils
    tigervnc-standalone-server \
    tigervnc-common \
    xserver-xorg-core \
    xterm \
    x11-utils \
    xdotool \
    scrot \
    # Desktop Environment
    openbox \
    obconf \
    thunar \
    firefox-esr \
    lxpanel \
    lxterminal \
    # Desktop icons and themes
    tango-icon-theme \
    papirus-icon-theme \
    arc-theme \
    hicolor-icon-theme \
    adwaita-icon-theme \
    # Fonts
    fonts-dejavu \
    fonts-liberation \
    fonts-noto \
    fonts-noto-color-emoji \
    # noVNC dependency
    websockify \
    # Nut.js Native Dependencies (adjust based on exact Nut.js requirements)
    libx11-dev \
    libxtst-dev \
    libpng-dev \
    libxext-dev \
    # Other app dependencies
    unzip \
    && \
    # --- Install Node.js ---
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install -y nodejs && \
    # --- Enable Corepack (comes with Node.js >= 16.13) ---
    corepack enable && \
    # --- Install noVNC ---
    mkdir -p ${NOVNC_HOME}/utils/websockify && \
    curl -kL https://github.com/novnc/noVNC/archive/refs/tags/v${NOVNC_VERSION}.tar.gz | tar xz --strip 1 -C ${NOVNC_HOME} && \
    # Use system websockify, link utils just in case
    ln -s /usr/bin/websockify ${NOVNC_HOME}/utils/websockify/run && \
    # --- Clean up ---
    # Keep gnupg and ca-certificates as they might be needed by other things
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# --- Desktop Helper Files ---
# Create directory for helper files
RUN mkdir -p /zenobia-helper

# Copy helper files
COPY zenobia-helper/ /zenobia-helper/

# Make helper scripts executable
RUN chmod +x /zenobia-helper/*.sh

# Install ImageMagick for wallpaper creation
RUN apt-get update && apt-get install -y --no-install-recommends \
    imagemagick \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# --- Application Setup ---
WORKDIR ${APP_DIR}

# Copy package files (including pnpm lock file)
# Use pnpm-lock.yaml* to handle cases where it might not exist initially, although it should for reproducible builds.
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
# Install both dev and production dependencies to enable build
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build step if needed (e.g., for TypeScript)
# Ensure your build script outputs to a standard location like 'dist'
RUN pnpm run build

# --- Configuration ---
# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# --- Security ---
# Restrict access to the application directory AFTER pnpm install and code copy
# Note: pnpm creates node_modules differently, ensure permissions work as expected.
# This setup keeps node_modules owned by root but readable/executable by others.
RUN chown -R root:root ${APP_DIR} && \
    chmod -R 755 ${APP_DIR} && \
    chmod 750 ${APP_DIR} # Optional: Restrict top-level dir if needed, but 755 is often fine

# Set permissions for VNC user's home (needed for .vnc, .Xauthority)
RUN chown -R ${USER}:${USER} ${HOME} && chmod 700 ${HOME}

# Define runtime settings
ENV DISPLAY=:1

WORKDIR ${HOME}
USER ${USER}

# Expose ports
# 5901: VNC TCP
# 6901: noVNC WebSockets
# 8080: Node.js application
EXPOSE 5901 6901 8080

# Run Supervisor via entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]