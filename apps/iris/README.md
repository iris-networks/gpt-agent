# Iris API

A headless API service for UI automation with browser and computer automation capabilities.

## Overview

Iris is a headless service that provides API endpoints for automating both browser and desktop operations, designed to work in containerized environments like Docker with VNC support. It's built on the UI-TARS framework but focuses exclusively on API-based interactions without requiring any UI components.

## Features

- RESTful API for automation tasks
- Browser automation capabilities
- Computer (desktop) automation capabilities
- Docker and VNC support for containerized operation
- Configurable automation settings via API
- Session management for concurrent automation tasks

## Getting Started

### Prerequisites

- Node.js 20.x or later
- Docker (for containerized operation)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run in development mode
pnpm dev
```

### Building

```bash
# Build for production
pnpm build
```

### Running

```bash
# Run in production mode
pnpm start
```

### Docker

```bash
# Build and run with Docker
docker-compose up -d
```

## API Reference

See the [API documentation](./docs/api-reference.md) for details on available endpoints.

## License

Proprietary


<!-- delete all node_modules -->
find . -name "node_modules" -type d | sort                                                                                                                                  │