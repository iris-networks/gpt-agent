# Iris Quick Start Guide

<!-- SPDX-License-Identifier: UNLICENSED -->
<!-- Copyright: Proprietary -->

This guide will help you get started with the Iris API service.

## Prerequisites

- Docker and Docker Compose
- Node.js 20.x or later (for development)

## Running with Docker

The easiest way to get started is to use Docker:

1. Clone the repository:
   ```bash
   git clone https://github.com/bytedance/UI-TARS-desktop.git
   cd UI-TARS-desktop/apps/iris
   ```

2. Create an `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file to configure your environment:
   ```bash
   # Add your VLM API key and other settings
   VLM_API_KEY=your-api-key
   ```

4. Start the Docker container:
   ```bash
   docker-compose up -d
   ```

5. The API is now accessible at `http://localhost:3000`

6. To view the VNC interface for visual verification:
   - VNC client: Connect to `localhost:5901` (Password: `irispassword`)
   - Web browser: Open `http://localhost:6901` (Password: `irispassword`)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bytedance/UI-TARS-desktop.git
   cd UI-TARS-desktop
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Navigate to the iris app:
   ```bash
   cd apps/iris
   ```

4. Create an `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file with your configuration.

6. Start the development server:
   ```bash
   pnpm dev
   ```

## Basic Usage

### Creating a Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": "Open Chrome and navigate to example.com",
    "operator": "browser"
  }'
```

### Getting Session Status

```bash
curl http://localhost:3000/api/sessions/YOUR_SESSION_ID
```

### Taking a Screenshot

```bash
curl http://localhost:3000/api/sessions/YOUR_SESSION_ID/screenshot
```

### Canceling a Session

```bash
curl -X POST http://localhost:3000/api/sessions/YOUR_SESSION_ID/cancel
```

## Next Steps

- See the [API Reference](./api-reference.md) for complete documentation
- Check out the Docker configuration for production deployment