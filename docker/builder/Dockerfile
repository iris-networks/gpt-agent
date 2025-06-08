# syntax=docker/dockerfile:1.4
FROM node:20-slim as builder

# Install build dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage build cache
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy remaining files and build
COPY . .
# Build the NestJS application
RUN pnpm run build