FROM lscr.io/linuxserver/webtop:latest

# Install necessary tools and bun
RUN apk add --no-cache scrot xrandr curl unzip xdotool

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/config/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
RUN chown -R $USERNAME:$USERNAME $BUN_INSTALL
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
