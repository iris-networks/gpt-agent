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
RUN bun run build:binary

# Set executable permissions for the binary
RUN chmod +x /app/dist/iris_cua

# Create custom services directory
RUN mkdir -p /custom-services.d

# Copy startup script for your application
COPY iris_cua.sh /custom-services.d/iris_cua
RUN chmod +x /custom-services.d/iris_cua

# Expose ports if needed
EXPOSE 8080
