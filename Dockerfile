FROM lscr.io/linuxserver/webtop:debian-xfce

# Environment variables
ENV TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    CUSTOM_PORT=6901

# Basic update and install packages including chromium
RUN if command -v apt-get >/dev/null 2>&1; then \
        apt-get update && apt-get install -y ffmpeg xauth imagemagick scrot sudo curl tree wmctrl xdotool unzip; \
    elif command -v apk >/dev/null 2>&1; then \
        apk update && apk add --no-cache ffmpeg xauth imagemagick sudo curl tree unzip; \
    else \
        echo "No supported package manager found" && exit 1; \
    fi

# Download and install mcp-terminal-server
RUN mkdir -p /usr/local/bin && \
    curl -L -o /tmp/mcp-terminal-server-linux-amd64.tar.gz \
        https://github.com/iris-networks/terminal_mcp/releases/download/v1.0.0/mcp-terminal-server-linux-amd64.tar.gz && \
    tar -xzf /tmp/mcp-terminal-server-linux-amd64.tar.gz -C /tmp && \
    mv /tmp/mcp-terminal-server-linux-amd64 /usr/local/bin/mcp-terminal-server && \
    chmod +x /usr/local/bin/mcp-terminal-server && \
    rm /tmp/mcp-terminal-server-linux-amd64.tar.gz

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

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

USER root
WORKDIR /home/nodeuser/app
COPY --chown=nodeuser:nodeuser package.json package-lock.json* ./

RUN mkdir -p /config/.npm && chown -R nodeuser:nodeuser /config/.npm
RUN npm install
RUN npm install -g @agent-infra/mcp-server-browser@latest
COPY --chown=nodeuser:nodeuser src/ ./src/
COPY --chown=nodeuser:nodeuser tsconfig.json nest-cli.json .env ./
RUN npm run build

COPY docker/selkies/index.js /tmp/custom-index.js
RUN /bin/bash -c 'if [ -d /usr/share/selkies/www/assets ]; then \
    chmod -R 755 /usr/share/selkies/www/assets && \
    INDEX_FILE=$(find /usr/share/selkies/www/assets -name "index-*.js" | head -1); \
    if [ -n "$INDEX_FILE" ]; then \
        chmod 644 "$INDEX_FILE" && \
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