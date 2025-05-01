# Docker commands for Iris VNC application

.PHONY: build up down restart logs clean kill-all status check-vnc build-nocache

# Build with BuildKit enabled for better caching
build:
	DOCKER_BUILDKIT=1 docker-compose up -d --build

# Start containers in detached mode if already built
up:
	docker-compose up -d

# Stop the running containers
down:
	docker-compose down

# Restart the containers
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Remove all containers
clean:
	docker-compose down --rmi all --volumes --remove-orphans

# Kill all running containers (use with caution)
kill-all:
	docker container rm -f $$(docker container ls -aq)

# Show status of containers
status:
	docker-compose ps

# Rebuild and restart a specific service
rebuild:
	DOCKER_BUILDKIT=1 docker-compose up -d --build --no-deps iris

# Build without using cache
build-nocache:
	DOCKER_BUILDKIT=1 docker-compose build --no-cache iris
	@echo "Building without cache completed."

# Check the VNC server status and ports
check-vnc:
	@echo "Checking VNC Server status..."
	docker ps | grep iris
	@echo "\nChecking if ports are ready:"
	docker exec iris netstat -tulpn | grep -E "5900|6901|3000"
	@echo "\nVNC Server logs:"
	docker logs iris | grep -E "x11vnc|novnc|websockify" | tail -20