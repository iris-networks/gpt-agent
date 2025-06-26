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

# Variables for amd64 image build and push
GCP_PROJECT_ID ?= driven-seer-460401-p9
GCP_REGION ?= us-central1
REPOSITORY ?= iris-repo
IMAGE_NAME ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT_ID)/$(REPOSITORY)/iris_agent

# Generate automatic tag using timestamp and git commit hash
AUTO_TAG := $(shell date +%Y%m%d-%H%M%S)-$(shell git rev-parse --short HEAD 2>/dev/null || echo "nogit")
IMAGE_TAG ?= $(AUTO_TAG)

# Build and push for amd64 architecture to Artifact Registry
build-push-amd64:
	@echo "Authenticating with Google Cloud..."
	gcloud auth configure-docker $(GCP_REGION)-docker.pkg.dev
	@echo "Ensuring Artifact Registry repository exists..."
	-gcloud artifacts repositories create $(REPOSITORY) --repository-format=docker --location=$(GCP_REGION) --project=$(GCP_PROJECT_ID) 2>/dev/null || true
	@echo "Building and pushing image $(IMAGE_NAME):$(IMAGE_TAG) for linux/amd64..."
	docker buildx build --platform linux/amd64 -t $(IMAGE_NAME):$(IMAGE_TAG) --push -f Dockerfile .
	@echo ""
	@echo "✅ Build and push completed successfully!"
	@echo "📦 Image: $(IMAGE_NAME):$(IMAGE_TAG)"
	@echo ""
	@echo "🚀 To deploy with k8sgo (orchestrator), run:"
	@echo "   k8sgo deploy --image=$(IMAGE_NAME):$(IMAGE_TAG)"
	@echo ""
	@echo "💡 Generated tag: $(IMAGE_TAG)"

# Check the VNC server status and ports
check-vnc:
	@echo "Checking VNC Server status..."
	docker ps | grep iris
	@echo "\nChecking if ports are ready:"
	docker exec iris netstat -tulpn | grep -E "5900|6901|3000"
	@echo "\nVNC Server logs:"
	docker logs iris | grep -E "x11vnc|novnc|websockify" | tail -20