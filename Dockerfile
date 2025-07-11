FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Environment variables
ENV TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    CUSTOM_PORT=6901

# Basic update and install packages including chromium
RUN if command -v apt-get >/dev/null 2>&1; then \
        apt-get update && apt-get install -y ffmpeg nodejs xauth imagemagick scrot sudo curl tree wmctrl xdotool chromium-browser; \
    elif command -v apk >/dev/null 2>&1; then \
        apk update && apk add --no-cache ffmpeg nodejs npm xauth imagemagick sudo curl tree chromium; \
    else \
        echo "No supported package manager found" && exit 1; \
    fi

# Setup user and create directory structure
RUN useradd -m -u 1002 -s /bin/bash nodeuser && \
    adduser nodeuser sudo && \
    echo "nodeuser ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers.d/nodeuser && \
    chmod 0440 /etc/sudoers.d/nodeuser && \
    mkdir -p /home/nodeuser/app && \
    mkdir -p /home/nodeuser/.vnc && \
    mkdir -p /home/nodeuser/app/screenshots && \
    mkdir -p /config/.cache && \
    chmod 777 /config/.cache && \
    chown -R nodeuser:nodeuser /home/nodeuser && \
    chmod -R 700 /home/nodeuser/app && \
    chmod 700 /home/nodeuser

# Copy service scripts and custom scripts
COPY docker/custom-scripts/services.d/ /custom-services.d/
COPY docker/custom-scripts/custom-cont-init.d/ /custom-cont-init.d/
COPY docker/custom-scripts/update-selkies-title.sh /tmp/update-selkies-title.sh
RUN chmod +x /custom-services.d/* /custom-cont-init.d/* /tmp/update-selkies-title.sh

# Setup node environment
WORKDIR /home/nodeuser/app
COPY package.json pnpm-lock.yaml* ./


# Install pnpm globally with npm
RUN npm install -g pnpm

# Install dependencies and build app
USER nodeuser
RUN pnpm install --frozen-lockfile
USER root
RUN chown -R nodeuser:nodeuser /home/nodeuser/app

# Copy remaining files
COPY . .
RUN chown -R nodeuser:nodeuser /home/nodeuser/app

# Build the application
USER nodeuser
RUN pnpm run build
USER root
RUN chown -R nodeuser:nodeuser /home/nodeuser/app

# Replace the selkies index file with our custom version
COPY docker/selkies/index.js /tmp/custom-index.js
RUN /bin/bash -c 'if [ -d /usr/share/selkies/www/assets ]; then \
    INDEX_FILE=$(find /usr/share/selkies/www/assets -name "index-*.js" | head -1); \
    if [ -n "$INDEX_FILE" ]; then \
        cp "$INDEX_FILE" "${INDEX_FILE}.bak" && \
        cp /tmp/custom-index.js "$INDEX_FILE" && \
        echo "Replaced $INDEX_FILE with custom version"; \
    else \
        echo "No index-*.js file found to replace"; \
    fi; \
fi'

# Copy XFCE4 configuration files
# COPY docker/xfce4/ /config/.config/xfce4/
# RUN chown -R abc:abc /config/.config/xfce4

EXPOSE 3000