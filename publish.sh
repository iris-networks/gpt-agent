#!/bin/bash

# Exit on error
set -e

# Hardcoded values for your repository
IMAGE_NAME="iris_scout"
IMAGE_TAG="latest"
REPOSITORY="shanurcsenitap"

# Parse command line arguments (only tag is customizable)
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--tag IMAGE_TAG]"
      exit 1
      ;;
  esac
done

# Full image name construction
FULL_IMAGE_NAME="${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "Building obfuscated image: ${FULL_IMAGE_NAME}"

# Run the build script with obfuscation enabled and push flag
./build.sh --obfuscate --tag "$IMAGE_TAG" --push

echo "Public image built and pushed successfully: ${FULL_IMAGE_NAME}"