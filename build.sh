#!/bin/bash

# Exit on error
set -e

# Default values - hardcoded for your repository
OBFUSCATE=false
IMAGE_NAME="iris_scout"
IMAGE_TAG="latest"
REPOSITORY="shanurcsenitap"
PUSH=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --obfuscate)
      OBFUSCATE=true
      shift
      ;;
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --push)
      PUSH=true
      shift
      ;;
    --install)
      INSTALL=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--obfuscate] [--tag IMAGE_TAG] [--push] [--install]"
      exit 1
      ;;
  esac
done

# Full image name construction - hardcoded to your repository
FULL_IMAGE_NAME="${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "Building Pulsar application..."

# Install dependencies if needed
if [ "${INSTALL}" == "true" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the application
npm run build

echo "Building Docker image: ${FULL_IMAGE_NAME}"
echo "Obfuscation: ${OBFUSCATE}"

# Build Docker image with the obfuscation argument for Linux architecture
docker build \
  --build-arg OBFUSCATE=${OBFUSCATE} \
  --platform linux/amd64 \
  -t ${FULL_IMAGE_NAME} .

echo "Docker image built successfully: ${FULL_IMAGE_NAME}"

# Push the image if requested
if [ "${PUSH}" == "true" ]; then
  echo "Pushing image to repository: ${REPOSITORY}..."
  docker push ${FULL_IMAGE_NAME}
  echo "Image pushed successfully!"
fi

echo "Build completed successfully!"