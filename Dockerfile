FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Environment variables
ENV TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    CUSTOM_PORT=6901

# Basic update and install packages
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    nodejs \
    xauth \
    imagemagick \
    scrot \
    sudo \
    curl \
    tree

# Setup user and create directory structure
RUN useradd -m -u 1002 -s /bin/bash nodeuser && \
    adduser nodeuser sudo && \
    echo "nodeuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    mkdir -p /home/nodeuser/app && \
    mkdir -p /home/nodeuser/.vnc && \
    mkdir -p /home/nodeuser/app/screenshots && \
    chown -R nodeuser:nodeuser /home/nodeuser && \
    chmod -R 700 /home/nodeuser/app && \
    chmod 700 /home/nodeuser && \
    usermod -a -G abc nodeuser

# Copy service scripts
COPY docker/custom-scripts/services.d/ /custom-services.d/

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

EXPOSE 3000