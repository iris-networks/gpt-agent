FROM node:20-alpine

WORKDIR /app

# Set non-interactive to true
ENV DEBIAN_FRONTEND=noninteractive

# Install pnpm
RUN npm install -g pnpm

# Copy remaining source files
COPY . .

RUN pnpm install

# Set working directory to iris app
WORKDIR /app/apps/iris

# Expose port
EXPOSE 3000

# Start the app
CMD ["pnpm", "run", "dev"]