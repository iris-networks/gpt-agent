#!/bin/bash

# Desktop shortcuts service - runs after volume mounts
echo "**** setting up desktop shortcuts ****"

# Ensure /config/Desktop exists
mkdir -p /config/Desktop

# Create desktop shortcuts if they don't exist
if [ ! -f "/config/Desktop/terminal.desktop" ]; then
    echo "**** creating desktop shortcuts in /config/Desktop ****"
    
    # Create Terminal shortcut
    cat > /config/Desktop/terminal.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Terminal
Comment=Use the command line
Exec=xfce4-terminal
Icon=utilities-terminal
Terminal=false
Categories=System;TerminalEmulator;
X-GNOME-Autostart-enabled=true
EOF

    # Create File Manager shortcut
    cat > /config/Desktop/file-manager.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=File Manager
Comment=Browse the file system
Exec=thunar
Icon=file-manager
Terminal=false
Categories=System;FileTools;
X-GNOME-Autostart-enabled=true
EOF

    # Create Text Editor shortcut
    cat > /config/Desktop/text-editor.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Text Editor
Comment=Edit text files
Exec=mousepad
Icon=accessories-text-editor
Terminal=false
Categories=Office;TextEditor;
X-GNOME-Autostart-enabled=true
EOF

    # Create Web Browser shortcut
    cat > /config/Desktop/web-browser.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Web Browser
Comment=Browse the World Wide Web
Exec=firefox
Icon=web-browser
Terminal=false
Categories=Network;WebBrowser;
X-GNOME-Autostart-enabled=true
EOF

    # Set proper permissions and ownership
    chmod +x /config/Desktop/*.desktop
    chown -R abc:abc /config/Desktop
    chmod -R g+rwx /config/Desktop
    
    echo "**** desktop shortcuts created and configured successfully ****"
else
    echo "**** desktop shortcuts already exist ****"
fi

# This is a oneshot service, so we exit after completion
exit 0