# Use Node 20 base image
FROM node:20-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and build application
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final stage with XFCE, X11, VNC and Chromium
FROM ubuntu:22.04

# Install XFCE, X11, VNC and Chromium with build caching
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    x11vnc \
    xvfb \
    chromium-browser \
    light-themes \
    && rm -rf /var/lib/apt/lists/*

# Create restricted user
RUN useradd -m restricteduser && \
    mkdir -p /home/restricteduser/.vnc && \
    chown -R restricteduser:restricteduser /home/restricteduser

# Copy built application from builder with proper permissions
COPY --from=builder --chown=restricteduser:restricteduser /app/dist /app

# Set up VNC password
USER restricteduser
RUN echo "password" | vncpasswd -f > /home/restricteduser/.vnc/passwd && \
    chmod 600 /home/restricteduser/.vnc/passwd

# Expose VNC port
EXPOSE 5900

# Start VNC server
CMD ["x11vnc", "-forever", "-usepw", "-create"]