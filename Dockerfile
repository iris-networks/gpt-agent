# Stage 1: Build stage
FROM oven/bun:latest AS builder

# Copy application files
WORKDIR /app
COPY . .

# Install dependencies and build the application
RUN bun install
RUN bun run build:binary

# Stage 2: Runtime stage
FROM lscr.io/linuxserver/webtop:latest

# Install necessary tools
RUN apk add --no-cache scrot xrandr

# Copy built application from builder stage
COPY --from=builder /app/dist/iris_cua /app/dist/iris_cua
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/bun.* /app/
COPY --from=builder /app/node_modules/sharp /app/node_modules/sharp

WORKDIR /app

# Create custom services directory
RUN mkdir -p /custom-services.d

# Copy startup script for your application
COPY iris_cua.sh /custom-services.d/iris_cua
RUN chmod +x /custom-services.d/iris_cua

# Expose ports if needed
EXPOSE 8080
