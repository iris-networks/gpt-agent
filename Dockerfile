# Use a slim Debian base image
# Stage 1: Build stage - for building the Node.js application
FROM node:18-slim AS builder

# Set environment variables for build stage
ENV NODE_ENV=production \
    APP_DIR=/app

# Set working directory
WORKDIR ${APP_DIR}

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Enable pnpm and install only production dependencies for faster builds
RUN corepack enable && \
    pnpm install --frozen-lockfile --prod=false

# Copy application source code
COPY . .

# Build the application
RUN pnpm run build

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
    NODE_ENV=production

# Create non-root user and directories in a single layer
RUN useradd --create-home --shell /bin/bash ${USER} && \
    mkdir -p ${APP_DIR} ${HOME}/.vnc /zenobia-helper /usr/share/backgrounds && \
    chmod 777 /usr/share/backgrounds && \
    chown -R ${USER}:${USER} ${HOME}

# Install all runtime dependencies in a single layer to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Essential utilities
    curl gnupg ca-certificates sudo \
    # Node.js
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    # Process manager
    supervisor \
    # VNC and X11
    tigervnc-standalone-server tigervnc-common xserver-xorg-core xterm x11-utils xdotool scrot \
    # Desktop environment - minimal
    openbox obconf thunar firefox-esr lxpanel lxterminal feh \
    # Themes and icons - minimal set
    tango-icon-theme papirus-icon-theme arc-theme hicolor-icon-theme adwaita-icon-theme \
    # Fonts - essential only
    fonts-dejavu fonts-liberation fonts-noto fonts-noto-color-emoji \
    # noVNC dependency
    websockify \
    # Nut.js dependencies
    libx11-dev libxtst-dev libpng-dev libxext-dev \
    # Image processing for wallpaper
    imagemagick \
    # Other utilities
    unzip \
    && corepack enable \
    # Install noVNC
    && mkdir -p ${NOVNC_HOME}/utils/websockify \
    && curl -kL https://github.com/novnc/noVNC/archive/refs/tags/v${NOVNC_VERSION}.tar.gz | tar xz --strip 1 -C ${NOVNC_HOME} \
    && ln -s /usr/bin/websockify ${NOVNC_HOME}/utils/websockify/run \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy helper files and make them executable
COPY zenobia-helper/ /zenobia-helper/
RUN chmod +x /zenobia-helper/*.sh

# Copy configuration files
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy built application from builder stage
WORKDIR ${APP_DIR}
COPY --from=builder ${APP_DIR}/dist ./dist
COPY --from=builder ${APP_DIR}/node_modules ./node_modules
COPY --from=builder ${APP_DIR}/package.json ./

# --- Security ---
# Set proper permissions for application and user directories
RUN chown -R ${USER}:${USER} ${APP_DIR} && \
    chmod -R 755 ${APP_DIR} && \
    chown -R ${USER}:${USER} ${HOME} && chmod 700 ${HOME}

# Switch to user's home directory and non-root user
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