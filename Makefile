# Makefile for Zenobia Docker image

# Variables
IMAGE_NAME = zenobia
VERSION = 1.0.0
REGISTRY = 
FULL_IMAGE_NAME = $(REGISTRY)$(IMAGE_NAME):$(VERSION)
LATEST_IMAGE_NAME = $(REGISTRY)$(IMAGE_NAME):latest

# Default target
.PHONY: all
all: build

# Build the Docker image
.PHONY: build
build:
	@echo "Building Docker image: $(FULL_IMAGE_NAME)"
	docker build -t $(FULL_IMAGE_NAME) -t $(LATEST_IMAGE_NAME) .

# Run the Docker container
.PHONY: run
run:
	@echo "Running Docker container from image: $(LATEST_IMAGE_NAME)"
	docker run -p 8080:8080 $(LATEST_IMAGE_NAME)

# Clean up Docker images
.PHONY: clean
clean:
	@echo "Removing Docker image: $(FULL_IMAGE_NAME) and $(LATEST_IMAGE_NAME)"
	-docker rmi $(FULL_IMAGE_NAME) $(LATEST_IMAGE_NAME)

# Push the Docker image to a registry
.PHONY: push
push:
	@echo "Pushing Docker image to registry: $(FULL_IMAGE_NAME)"
	docker push $(FULL_IMAGE_NAME)
	docker push $(LATEST_IMAGE_NAME)

# Show help
.PHONY: help
help:
	@echo "Makefile for Zenobia Docker image"
	@echo ""
	@echo "Targets:"
	@echo "  all (default) - Build the Docker image"
	@echo "  build         - Build the Docker image"
	@echo "  run           - Run the Docker container"
	@echo "  clean         - Remove the Docker image"
	@echo "  push          - Push the Docker image to a registry"
	@echo "  help          - Show this help message"
	@echo ""
	@echo "Variables:"
	@echo "  IMAGE_NAME    - Name of the Docker image (default: $(IMAGE_NAME))"
	@echo "  VERSION       - Version of the Docker image (default: $(VERSION))"
	@echo "  REGISTRY      - Docker registry URL (default: $(REGISTRY))"