FROM lscr.io/linuxserver/firefox:latest

# Install necessary tools and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    xdotool \
    scrot \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up application directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies and build the application
RUN npm install --force
RUN npm run build

# Set executable permissions
RUN chmod +x /app/dist/index.js

# Create custom services directory
RUN mkdir -p /custom-services.d

COPY pulsar.sh /custom-services.d/pulsar
RUN chmod +x /custom-services.d/pulsar

# Expose ports if needed
EXPOSE 8080