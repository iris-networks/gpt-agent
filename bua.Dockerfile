FROM lscr.io/linuxserver/firefox:latest

# Install necessary tools and bun
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    xdotool \
    scrot \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/config/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
RUN chown -R abc:abc $BUN_INSTALL

# Set up application directory
WORKDIR /app

# Copy application files
COPY . .

# Add custom KasmVNC configuration
# COPY kasmvnc.yaml /etc/kasmvnc/kasmvnc.yaml

# Install dependencies and build the application
RUN bun install
RUN bun run build:binary

# Set executable permissions for the binary
RUN chmod +x /app/dist/iris_cua

# Create custom services directory
RUN mkdir -p /custom-services.d

COPY iris_cua.sh /custom-services.d/iris_cua
RUN chmod +x /custom-services.d/iris_cua

# Expose ports if needed
EXPOSE 8080