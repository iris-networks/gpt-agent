FROM lscr.io/linuxserver/webtop:latest

# Install necessary tools and Node.js
RUN apk add --no-cache scrot xrandr curl unzip xdotool nodejs npm

# Set up application directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies and build the application
RUN npm install
RUN npm run build

# Set executable permissions
RUN chmod +x /app/dist/index.js

# Create custom services directory
RUN mkdir -p /custom-services.d

COPY pulsar.sh /custom-services.d/pulsar
RUN chmod +x /custom-services.d/pulsar

# Expose ports if needed
EXPOSE 8080