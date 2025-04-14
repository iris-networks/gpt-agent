# Use a slim Debian base image
# Stage 1: Build stage - for building the Bun application
FROM oven/bun:1-slim AS builder

# Set environment variables for build stage
ENV BUN_ENV=production \
    APP_DIR=/app

# Set working directory
WORKDIR ${APP_DIR}

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies for faster builds
RUN bun install --production

# Copy application source code
COPY . .

# Build the application if needed
# RUN bun run build

# Stage 2: Runtime stage - for the final image with VNC and runtime dependencies
FROM debian:bullseye-slim AS runtime

# Arguments for versions
ARG NOVNC_VERSION=1.4.0

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    TERM=xterm \
    USER=abc \
    HOME=/home/abc \
    APP_DIR=/app \
    NOVNC_HOME=/usr/local/novnc \
    VNC_RESOLUTION=1440x900 \
    VNC_PW=password \
    DISPLAY=:1 \
    BUN_ENV=production

# Create non-root user and directories in a single layer
RUN useradd --create-home --shell /bin/bash ${USER} && \
    mkdir -p ${APP_DIR} ${HOME}/.vnc /zenobia-helper /usr/share/backgrounds && \
    chmod 777 /usr/share/backgrounds && \
    chown -R ${USER}:${USER} ${HOME}

# Install all runtime dependencies in a single layer to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Essential utilities
    curl gnupg ca-certificates sudo unzip \
    # Process manager
    supervisor \
    # VNC and X11
    tigervnc-standalone-server tigervnc-common xserver-xorg-core xterm x11-utils xdotool scrot \
    # Desktop environment - minimal
    openbox obconf thunar firefox-esr lxpanel lxterminal feh \
    # Themes and icons - complete sets
    tango-icon-theme papirus-icon-theme arc-theme hicolor-icon-theme adwaita-icon-theme gnome-icon-theme gnome-themes-extra gtk2-engines-murrine \
    # Fonts - essential only
    fonts-dejavu fonts-liberation fonts-noto fonts-noto-color-emoji \
    # noVNC dependency
    websockify \
    # Nut.js dependencies
    libx11-dev libxtst-dev libpng-dev libxext-dev \
    # Image processing for wallpaper
    imagemagick \
    # Install Bun
    && curl -fsSL https://bun.sh/install | bash \
    && mv ~/.bun/bin/bun /usr/local/bin/ \
    # Install noVNC
    && mkdir -p ${NOVNC_HOME}/utils/websockify \
    && curl -kL https://github.com/novnc/noVNC/archive/refs/tags/v${NOVNC_VERSION}.tar.gz | tar xz --strip 1 -C ${NOVNC_HOME} \
    && ln -s /usr/bin/websockify ${NOVNC_HOME}/utils/websockify/run \
    # Create a redirect from root to vnc.html
    && echo '<html><head><meta http-equiv="Refresh" content="0; url=vnc.html"></head></html>' > ${NOVNC_HOME}/index.html \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy helper files and make them executable
COPY zenobia-helper/ /zenobia-helper/
RUN chmod +x /zenobia-helper/*.sh

# Copy configuration files from the helper directory
RUN chmod +x /zenobia-helper/entrypoint.sh
COPY zenobia-helper/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy application files
WORKDIR ${APP_DIR}
COPY pulsar ./pulsar
COPY package.json ./
COPY --from=builder ${APP_DIR}/node_modules ./node_modules
# COPY --from=builder ${APP_DIR}/dist ./dist

# --- Security ---
# Set proper permissions for application and user directories
# Application directory should be owned by root with limited permissions for abc
RUN chown -R root:root ${APP_DIR} && \
    chmod -R 750 ${APP_DIR} && \
    # Home directory fully accessible by abc
    chown -R ${USER}:${USER} ${HOME} && chmod 700 ${HOME}

# Switch to user's home directory and non-root user
WORKDIR ${HOME}
USER ${USER}

# Expose ports
# 5901: VNC TCP
# 6901: noVNC WebSockets
# 8080: Bun application
EXPOSE 5901 6901 8080

# Run Supervisor via entrypoint script - needs to be run as root
USER root
ENTRYPOINT ["/zenobia-helper/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]