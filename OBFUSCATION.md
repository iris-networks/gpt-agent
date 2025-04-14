# Zenobia Docker Image Obfuscation

This document describes how to build and publish Docker images with code obfuscation for the Zenobia project.

## Overview

The build system includes an option to obfuscate JavaScript code in the Docker image, making it more difficult to reverse-engineer when distributed publicly. The image is published to Docker Hub at `shanurcsenitap/iris_scout`.

## How Code Obfuscation Works

When the `OBFUSCATE` flag is set to `true`, the build process:

1. Installs the `javascript-obfuscator` tool
2. Finds all JavaScript files in the `dist` directory
3. Obfuscates each file in-place
4. The obfuscated code is then used in the final Docker image

The obfuscation provides protection against casual inspection while maintaining full functionality.

## Architecture Support

The Docker images are built specifically for Linux/amd64 architecture using the `--platform linux/amd64` flag. This ensures compatibility with most Linux server environments regardless of the build host's architecture.

## Quick Command Reference

Copy and paste these commands to build and publish Docker images:

### Build Standard Development Image (No Obfuscation)
```bash
./build.sh
```

### Build Obfuscated Image (Without Pushing)
```bash
./build.sh --obfuscate
```

### Build and Push Obfuscated Image with Default Tag
```bash
./build.sh --obfuscate --push
```

### Build and Push Obfuscated Image with Custom Tag
```bash
./build.sh --obfuscate --tag v1.0 --push
```

### One-Step Build/Obfuscate/Push with Custom Tag
```bash
./publish.sh --tag v1.0
```

## Building Images

### Standard Development Build

To build a standard development image without obfuscation:

```bash
./build.sh
```

This will build and tag the image as `shanurcsenitap/iris_scout:latest` but won't push it to Docker Hub.

### Custom Build with Options

```bash
./build.sh [OPTIONS]
```

Available options:

- `--obfuscate`: Enable code obfuscation (default: false)
- `--tag IMAGE_TAG`: Set a custom image tag (default: "latest")
- `--push`: Push the image to Docker Hub
- `--install`: Install npm dependencies before building

Examples:

```bash
# Build with obfuscation
./build.sh --obfuscate

# Build with custom tag
./build.sh --tag v1.0

# Build with obfuscation and push to Docker Hub
./build.sh --obfuscate --push

# Build with obfuscation, custom tag, and push to Docker Hub
./build.sh --obfuscate --tag v1.0 --push

# Install dependencies, build with obfuscation, and push to Docker Hub
./build.sh --install --obfuscate --push
```

## Publishing Obfuscated Images

For convenience, a dedicated script is provided to build and publish obfuscated images:

```bash
./publish.sh [--tag IMAGE_TAG]
```

This script will:
1. Build the image with obfuscation enabled
2. Tag it as `shanurcsenitap/iris_scout:TAG` (defaults to "latest" if tag not specified)
3. Push it to Docker Hub

Examples:

```bash
# Build, obfuscate, and push with default "latest" tag
./publish.sh

# Build, obfuscate, and push with custom tag
./publish.sh --tag v1.0
```

## Security Considerations

- Obfuscation provides a barrier to casual inspection but is not an ultimate security measure
- Sensitive values should still be provided via environment variables or other secure methods
- API keys and secrets should never be hardcoded in the application
- This image is built specifically for Linux/amd64 architecture and may not work on other platforms