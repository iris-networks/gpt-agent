#!/bin/bash
# Autostart script for the desktop environment

# Set wallpaper with feh
echo "Setting wallpaper..."
if [ -f ~/Pictures/default_wallpaper.png ]; then
  feh --bg-fill ~/Pictures/default_wallpaper.png &
fi

# Start panel
lxpanel &

# Create desktop shortcuts
mkdir -p ~/Desktop

# Create Firefox shortcut
cat > ~/Desktop/firefox.desktop << EOF
[Desktop Entry]
Type=Application
Name=Firefox
Comment=Web Browser
Exec=firefox-esr %u
Icon=firefox-esr
Terminal=false
Categories=Network;WebBrowser;
EOF

# Create file manager shortcut
cat > ~/Desktop/file-manager.desktop << EOF
[Desktop Entry]
Type=Application
Name=File Manager
Comment=Browse files and folders
Exec=thunar
Icon=system-file-manager
Terminal=false
Categories=System;FileManager;
EOF

# Create terminal shortcut
cat > ~/Desktop/terminal.desktop << EOF
[Desktop Entry]
Type=Application
Name=Terminal
Comment=Command line terminal
Exec=lxterminal
Icon=utilities-terminal
Terminal=false
Categories=System;TerminalEmulator;
EOF

# Make shortcuts executable
chmod +x ~/Desktop/*.desktop

# We don't need to start the application here,
# it's already managed by supervisord