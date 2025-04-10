# IRIS Docker Build Makefile
# Configuration
REGISTRY := shanurcsenitap
IMAGE_NAME := iris
CUA_TAG := cua
BUA_TAG := bua
VERSION := latest

CUA_DOCKERFILE := Dockerfile
BUA_DOCKERFILE := bua.Dockerfile

.PHONY: all build-cua build-bua push-cua push-bua clean help

# Default target
all: build-cua

# Build CUA (Computer Use Agent) image
build-cua:
	@echo "Building CUA image..."
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG) -f $(CUA_DOCKERFILE) .
	docker tag $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG) $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG)-$(VERSION)

# Build BUA (Browser Use Agent) image
build-bua:
	@echo "Building BUA image..."
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG) -f $(BUA_DOCKERFILE) .
	docker tag $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG) $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG)-$(VERSION)

# Push CUA image to registry
push-cua: build-cua
	@echo "Pushing CUA image to registry..."
	docker push $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG)-$(VERSION)

# Push BUA image to registry
push-bua: build-bua
	@echo "Pushing BUA image to registry..."
	docker push $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG)-$(VERSION)

# Push both images to registry
push-all: push-cua push-bua
	@echo "All images pushed to registry."

# Build both images
build-all: build-cua build-bua
	@echo "All images built successfully."

# Clean up local images
clean:
	@echo "Cleaning up local images..."
	docker rmi -f $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG) || true
	docker rmi -f $(REGISTRY)/$(IMAGE_NAME):$(CUA_TAG)-$(VERSION) || true
	docker rmi -f $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG) || true
	docker rmi -f $(REGISTRY)/$(IMAGE_NAME):$(BUA_TAG)-$(VERSION) || true

# Help information
help:
	@echo "IRIS Docker Build Makefile"
	@echo "Available targets:"
	@echo "  all (default) - Build CUA image"
	@echo "  build-cua     - Build CUA image"
	@echo "  build-bua     - Build BUA image"
	@echo "  build-all     - Build both CUA and BUA images"
	@echo "  push-cua      - Build and push CUA image to registry"
	@echo "  push-bua      - Build and push BUA image to registry"
	@echo "  push-all      - Build and push both images to registry"
	@echo "  clean         - Remove local Docker images"
	@echo "  help          - Show this help information"