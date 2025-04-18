#!/bin/bash

# Exit on error
set -e

echo "Building standalone binary for Bun..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    # Source the shell profile to add bun to the PATH
    if [ -f "$HOME/.bashrc" ]; then
        source "$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        source "$HOME/.zshrc"
    fi
fi

# Install dependencies
echo "Installing dependencies..."
bun install

# Build the standalone binary
echo "Building the binary..."
bun build --compile --target=bun-linux-x64-modern ./pulsar/index.ts --outfile myapp

# Check if the binary was created successfully
if [ -f "./myapp" ]; then
    echo "✅ Standalone binary created successfully: $(pwd)/myapp"
    echo "You can run it with: ./myapp"
    
    # Make the binary executable
    chmod +x ./myapp
else
    echo "❌ Failed to create standalone binary"
    exit 1
fi