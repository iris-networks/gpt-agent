FROM lscr.io/linuxserver/firefox:latest

RUN apt-get update && apt-get install -y \
    scrot \
    curl \
    unzip \
    npm \
    xdotool \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up application directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Build the application with the new copy-assets script
RUN npm run build

# Ensure the public directory is correctly copied and set permissions
RUN mkdir -p /app/dist/public
RUN cp -r /app/pulsar/public/* /app/dist/public/ || echo "Public directory already copied"

# Set executable permissions
RUN chmod +x /app/dist/index.js

COPY iris_cua.sh /custom-services.d/iris_cua
RUN chmod +x /custom-services.d/iris_cua

# Set environment for production
ENV NODE_ENV=production

# Expose ports
EXPOSE 8080