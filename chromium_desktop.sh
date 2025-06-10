#!/bin/bash
# Script to create Chromium desktop shortcut

# Create Desktop directory if it doesn't exist
mkdir -p /home/vncuser/Desktop

# Create Chromium browser desktop shortcut
cat > /home/vncuser/Desktop/chromium-browser.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Name=Chromium
GenericName=Web Browser
Comment=Access the Internet
Exec=chromium --disable-dev-shm-usage %U
Terminal=false
X-MultipleArgs=false
Type=Application
Icon=chromium
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;x-scheme-handler/http;x-scheme-handler/https;
StartupWMClass=chromium
StartupNotify=true
Actions=NewWindow;Incognito;TempProfile;

[Desktop Action NewWindow]
Name=Open a New Window
Exec=chromium --disable-dev-shm-usage

[Desktop Action Incognito]
Name=Open a New Window in incognito mode
Exec=chromium --incognito --disable-dev-shm-usage

[Desktop Action TempProfile]
Name=Open a New Window with a temporary profile
Exec=chromium --temp-profile --disable-dev-shm-usage
EOF

# Set ownership and permissions
chown 1000:1000 /home/vncuser/Desktop/chromium-browser.desktop
chmod +x /home/vncuser/Desktop/chromium-browser.desktop

# Create Chromium preferences directory if it doesn't exist
mkdir -p /home/vncuser/.config/chromium

# Set Chromium flags to work properly in Docker
cat > /home/vncuser/.config/chromium/Local\ State << 'EOF'
{
  "browser": {
    "custom_chrome_frame": false,
    "window_placement": {
      "bottom": 800,
      "left": 0,
      "maximized": false,
      "right": 1280,
      "top": 0,
      "work_area_bottom": 800,
      "work_area_left": 0,
      "work_area_right": 1280,
      "work_area_top": 0
    }
  },
  "command_line_args": {
    "enable-features": "NoSandbox",
    "disable-gpu": true,
    "disable-dev-shm-usage": true,
    "window-size": "1280,800",
    "window-position": "0,0"
  }
}
EOF

chown -R 1000:1000 /home/vncuser/.config