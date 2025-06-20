FROM lscr.io/linuxserver/webtop:latest

# Environment variables
ENV DISPLAY=:1 \
    PUID=1000 \
    PGID=1000 \
    TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    SUBFOLDER=/ \
    TITLE=NodeApp \
    NODE_PORT=3000 \
    CUSTOM_PORT=6901 \
    PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Basic update and install packages
RUN apk update && \
    apk add --no-cache \
    ffmpeg \
    nodejs \
    npm \
    xauth \
    imagemagick \
    scrot \
    sudo

# Setup user and create directory structure
RUN adduser -D -u 1002 -s /bin/sh nodeuser && \
    addgroup nodeuser wheel && \
    echo "nodeuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    mkdir -p /home/nodeuser/app && \
    mkdir -p /home/nodeuser/.vnc && \
    mkdir -p /home/nodeuser/app/screenshots && \
    mkdir -p /home/nodeuser/.npm && \
    mkdir -p /config && \
    chown -R abc:abc /config && \
    touch /home/nodeuser/.Xauthority && \
    chown nodeuser:nodeuser /home/nodeuser/.Xauthority && \
    chown -R nodeuser:nodeuser /home/nodeuser && \
    chmod -R 700 /home/nodeuser/app && \
    chmod 700 /home/nodeuser && \
    chmod 755 /home/nodeuser/app/screenshots

# Copy service scripts
COPY docker/custom-scripts/services.d/ /custom-services.d/

# Setup node environment
WORKDIR /home/nodeuser/app
COPY package.json pnpm-lock.yaml* ./

# Install dependencies and build app
RUN npm install --frozen-lockfile && \
    chown -R nodeuser:nodeuser /home/nodeuser/app

# Copy remaining files
COPY . .

# Configure npm to use a different cache directory
ENV NPM_CONFIG_CACHE=/home/nodeuser/.npm

# Build the application
RUN npm run build && \
    chown -R nodeuser:nodeuser /home/nodeuser/app

EXPOSE 3000