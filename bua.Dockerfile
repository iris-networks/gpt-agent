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

# Install dependencies and build the application
RUN bun install
RUN bun run build:pulsar:binary

# Set executable permissions for the binary
RUN chmod +x /app/dist/pulsar

# Create custom services directory
RUN mkdir -p /custom-services.d

COPY pulsar.sh /custom-services.d/pulsar
RUN chmod +x /custom-services.d/pulsar

# Expose ports if needed
EXPOSE 8080