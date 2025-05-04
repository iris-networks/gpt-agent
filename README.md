# Zenobia Project (NestJS Version)

This is the NestJS version of the Zenobia project, a service for automating UI interactions through browser or computer automation, powered by the UI-TARS framework.

## Key Enhancements

- Complete migration from Express to NestJS framework
- OpenAPI documentation with Swagger UI at /api/docs
- Improved dependency injection and modular architecture
- Type safety with DTO validation

## Setup and Installation

### Prerequisites

- Node.js 20.x or later
- PNPM 8.x or later (recommended package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration
```

### Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

### Environment Variables

The application uses dotenv for configuration. Copy `.env.example` to `.env` and customize the values:

```
# Server Configuration
PORT=3000                  # Server port
HOST=0.0.0.0               # Server host

# VLM Configuration
VLM_BASE_URL=...           # Visual Language Model API URL
VLM_API_KEY=...            # API key for VLM service
VLM_MODEL_NAME=tgi         # Model name
VLM_PROVIDER=ui_tars_1_5   # VLM provider

# Application Settings
LANGUAGE=en                # Default language
MAX_LOOP_COUNT=10          # Maximum loop iterations
LOOP_INTERVAL_MS=1000      # Loop interval in milliseconds
DEFAULT_OPERATOR=browser   # Default operator type (browser/computer)
```

### Docker Setup

```bash
# Build and run with Docker
docker-compose up --build
```

### OpenAPI Documentation

The API documentation is available at:
- http://localhost:3000/api/docs (when running locally)

## Features

- Session-based automation
- Browser automation (using @ui-tars/operator-browser)
- Computer automation (using @ui-tars/operator-nut-js)
- VNC/noVNC for visual monitoring
- Screenshot capabilities
- RESTful API

## API Endpoints

- `/api/sessions` - Session management
- `/api/config` - Configuration management
- `/api/operators` - Operator management
- `/api/docs` - API documentation

## UI Access

- Web UI: http://localhost:3000/operator-ui.html
- VNC Interface: http://localhost:6901/vnc.html
- Direct VNC connection: localhost:5901

## Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run test coverage
pnpm run test:cov
```