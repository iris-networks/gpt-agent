#!/bin/bash
# This script creates needed directories for Openbox

# Create Templates directory to avoid LXPanel warning
mkdir -p ~/Templates
mkdir -p ~/Pictures
mkdir -p ~/Documents
mkdir -p ~/Downloads

# Create a README file in Templates to show how to use it
cat > ~/Templates/README.txt << EOF
This is the Templates directory.
Files placed here will be available as templates when right-clicking in the file manager.
EOF

chmod -R 755 ~/Templates ~/Pictures ~/Documents ~/Downloads