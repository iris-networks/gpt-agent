# Builder Dockerfile

This Dockerfile creates the builder image responsible for compiling the Node.js application.

## Purpose

The builder image:

- Uses Node.js 20 slim as a base
- Installs build dependencies
- Installs pnpm package manager
- Copies and builds the NestJS application
- Serves as an intermediate stage for the multi-stage build process

## Key Components

1. **Node.js Environment**: Provides the runtime and build environment
2. **Build Dependencies**: Includes essential packages like build-essential and curl
3. **Package Management**: Uses pnpm for faster, more efficient dependency installation
4. **Build Process**: Compiles the TypeScript code to JavaScript

## Building

To build this image individually:

```bash
cd docker
docker build -t zenobia-builder:latest -f builder/Dockerfile ..
```

Or use docker-compose to build all components:

```bash
cd docker
docker-compose build builder
```

## How It Works

The builder image follows these steps:

1. Start with a slim Node.js 20 image
2. Install build dependencies
3. Set up pnpm package manager
4. Copy package.json and lock file first (for better caching)
5. Install all dependencies
6. Copy the source code
7. Build the application

## Dependencies

This image is used as an intermediate stage for the `zenobia-app` image, which copies the built artifacts from this builder image.