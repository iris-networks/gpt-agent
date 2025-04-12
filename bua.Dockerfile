FROM lscr.io/linuxserver/firefox:latest

RUN apt-get update && apt-get install -y \
    scrot \
    curl \
    unzip \
    xdotool \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash \
    && mv ~/.bun/bin/bun /usr/local/bin/

# Set up application directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application files
COPY . .

# Copy kasmvnc config
COPY zenobia-helper/kasmvnc.yaml /etc/kasmvnc/kasmvnc.yaml

# Create iris_cua service file for startup
COPY iris_cua.sh /custom-services.d/iris_cua
RUN chmod +x /custom-services.d/iris_cua

# Restrict access to /app for user abc
RUN mkdir -p /etc/security
RUN echo "abc /app/* r,w,x deny" >> /etc/security/access.conf
# Add a startup script to enforce directory permissions - placing in custom-cont-init.d
RUN mkdir -p /custom-cont-init.d
RUN echo '#!/bin/bash\nchmod 750 /app\nchown root:root /app' > /custom-cont-init.d/50-restrict-app-access
RUN chmod +x /custom-cont-init.d/50-restrict-app-access

# Set environment for production
ENV BUN_ENV=production

# Expose ports
EXPOSE 8080