#!/bin/bash

# Zenobia VNC Customization Installer
# This script installs custom branding and styling for the VNC interface

# Set colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}       Zenobia VNC Customization Installer     ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Default VNC web directory - adjust if needed
DEFAULT_VNC_DIR="/usr/local/share/novnc"
VNC_DIR=${1:-$DEFAULT_VNC_DIR}

# Check if the directory exists
if [ ! -d "$VNC_DIR" ]; then
    echo -e "${RED}Error: VNC directory not found at $VNC_DIR${NC}"
    echo -e "Usage: $0 [VNC_DIRECTORY]"
    echo -e "Example: $0 /usr/share/novnc"
    exit 1
fi

echo -e "${GREEN}Installing customizations to: $VNC_DIR${NC}"

# Copy the customization files
echo -e "${BLUE}Copying custom files...${NC}"
cp zenobia-vnc.css "$VNC_DIR/"
cp zenobia-vnc-inject.js "$VNC_DIR/"
cp zenobia-logo.svg "$VNC_DIR/"
cp zenobia-favicon.ico "$VNC_DIR/"
cp __iris.png "$VNC_DIR/"

# Check if the VNC index file exists
VNC_INDEX="$VNC_DIR/vnc.html"
if [ ! -f "$VNC_INDEX" ]; then
    VNC_INDEX="$VNC_DIR/index.html"
    
    if [ ! -f "$VNC_INDEX" ]; then
        echo -e "${RED}Error: Could not find VNC HTML file in $VNC_DIR${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}Found VNC HTML file at: $VNC_INDEX${NC}"

# Create a backup
BACKUP_FILE="$VNC_INDEX.backup.$(date +%Y%m%d%H%M%S)"
cp "$VNC_INDEX" "$BACKUP_FILE"
echo -e "${GREEN}Created backup at: $BACKUP_FILE${NC}"

# Inject our customizations
echo -e "${BLUE}Injecting customizations...${NC}"

# Add our CSS reference in the head section
sed -i 's|</head>|    <link rel="stylesheet" href="zenobia-vnc.css">\n</head>|' "$VNC_INDEX"

# Add our JS at the end of the body
sed -i 's|</body>|    <script src="zenobia-vnc-inject.js"></script>\n</body>|' "$VNC_INDEX"

# Change the page title
sed -i 's|<title>noVNC</title>|<title>Zenobia VNC</title>|' "$VNC_INDEX"

echo -e "${GREEN}Customizations applied successfully!${NC}"
echo -e "${GREEN}You can now access the customized VNC interface.${NC}"
echo -e "${BLUE}===============================================${NC}"