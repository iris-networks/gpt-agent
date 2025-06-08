# Modularized Docker Setup

This directory contains a modularized Docker setup for the Zenobia project. The setup is split into multiple components to make it more maintainable and easier to understand.

## Structure

- `base/` - Contains the base image with all system dependencies
- `builder/` - Contains the Node.js builder stage
- `app/` - Contains the final application stage that combines the base and builder
- `docker-compose.yml` - Orchestrates the build of all components

## Usage

### Using Docker Compose (Recommended)

To build and run the entire stack:

```bash
cd docker
docker-compose build
docker-compose up app
```

This will:
1. Build the base image with all system dependencies
2. Build the builder image that compiles the Node.js application
3. Build the final app image that combines both
4. Run the app container with all necessary ports exposed

### Building Individual Components

You can also build individual components:

```bash
# Build just the base image
docker-compose build base

# Build just the builder image
docker-compose build builder

# Build just the app image (requires base and builder to be built first)
docker-compose build app
```

### Using the Single Dockerfile

If you prefer using a single Dockerfile, you can use the `Dockerfile.modular` in the project root:

```bash
docker build -t zenobia-app -f Dockerfile.modular .
docker run -p 5901:5901 -p 6901:6901 -p 3000:3000 zenobia-app
```

## Ports

- `5901` - VNC server
- `6901` - noVNC web interface
- `3000` - NestJS API

## Customization

You can customize the build by modifying the individual Dockerfiles:

- `base/Dockerfile` - Modify system dependencies
- `builder/Dockerfile` - Modify Node.js build process
- `app/Dockerfile` - Modify application configuration

## Benefits of This Approach

1. **Modularity**: Each component has a clear, specific purpose
2. **Maintainability**: Easier to update specific parts without touching others
3. **Caching**: Better use of Docker's build cache
4. **Clarity**: Easier to understand what each part does
5. **Parallelization**: Components can be built in parallel
6. **Testing**: Individual components can be tested in isolation