#!/bin/bash
# Setup script to be run once during container startup

# Create necessary directories
mkdir -p /home/abc/.config/openbox
mkdir -p /home/abc/.config/autostart
mkdir -p /usr/share/backgrounds
mkdir -p /home/abc/Desktop

# Set Iris background image
mkdir -p ~/Pictures
if [ -f /zenobia-helper/__iris.jpg ]; then
  echo "Using Iris background image..."
  cp /zenobia-helper/__iris.jpg ~/Pictures/default_wallpaper.jpg
else
  echo "Creating default background..."
  # Create a soothing gradient background
  convert -size 1920x1080 gradient:'#2E3440-#4C566A' ~/Pictures/default_wallpaper.jpg
fi

# Create needed directories
mkdir -p /zenobia-helper/templates
chmod +x /zenobia-helper/templates/create-desktop-dirs.sh
/zenobia-helper/templates/create-desktop-dirs.sh

# Copy default configurations
cp /zenobia-helper/openbox-rc.xml /home/abc/.config/openbox/rc.xml
cp /zenobia-helper/autostart.sh /home/abc/.config/openbox/autostart

# Make scripts executable
chmod +x /home/abc/.config/openbox/autostart

# Set permissions
chown -R abc:abc /home/abc/.config
chown -R abc:abc /home/abc/Desktop

# Create default GTK theme settings
cat > /home/abc/.gtkrc-2.0 << EOF
gtk-theme-name="Arc"
gtk-icon-theme-name="Papirus"
gtk-font-name="DejaVu Sans 12"
gtk-cursor-theme-name="Adwaita"
gtk-cursor-theme-size=0
gtk-toolbar-style=GTK_TOOLBAR_BOTH_HORIZ
gtk-toolbar-icon-size=GTK_ICON_SIZE_LARGE_TOOLBAR
gtk-button-images=1
gtk-menu-images=1
gtk-enable-event-sounds=1
gtk-enable-input-feedback-sounds=1
gtk-xft-antialias=1
gtk-xft-hinting=1
gtk-xft-hintstyle="hintfull"
gtk-xft-rgba="rgb"
# Standard color scheme for light mode
gtk-color-scheme="fg_color:#2E3440\nbg_color:#ECEFF4\ntext_color:#2E3440\nbase_color:#FFFFFF\nselected_fg_color:#FFFFFF\nselected_bg_color:#5E81AC"
EOF

# Copy the same settings for GTK3
mkdir -p /home/abc/.config/gtk-3.0
cat > /home/abc/.config/gtk-3.0/settings.ini << EOF
[Settings]
gtk-theme-name=Arc
gtk-icon-theme-name=Papirus
gtk-font-name=DejaVu Sans 12
gtk-cursor-theme-name=Adwaita
gtk-cursor-theme-size=0
gtk-toolbar-style=GTK_TOOLBAR_BOTH_HORIZ
gtk-toolbar-icon-size=GTK_ICON_SIZE_LARGE_TOOLBAR
gtk-button-images=1
gtk-menu-images=1
gtk-enable-event-sounds=1
gtk-enable-input-feedback-sounds=1
gtk-xft-antialias=1
gtk-xft-hinting=1
gtk-xft-hintstyle=hintfull
gtk-xft-rgba=rgb
gtk-application-prefer-dark-theme=0
EOF

# Create a custom CSS file for GTK3 to improve readability
mkdir -p /home/abc/.config/gtk-3.0
cat > /home/abc/.config/gtk-3.0/gtk.css << EOF
/* Improve text readability with higher contrast */
.window-frame, .window-frame:backdrop {
  box-shadow: 0 0 0 black;
  border-style: none;
  margin: 0;
  border-radius: 0;
}

* {
  text-shadow: none;
}

/* Improve terminal readability */
VteTerminal, vte-terminal {
  padding: 10px;
}

/* Improve contrast for text */
.view text {
  color: #2E3440;
}

/* Better contrast for window text */
window, dialog, messagedialog {
  color: #2E3440;
}
EOF

# Configure terminal with high contrast colors
mkdir -p /home/abc/.config/lxterminal
cp /zenobia-helper/lxterminal.conf /home/abc/.config/lxterminal/lxterminal.conf

# Configure Firefox for better readability
mkdir -p /home/abc/.mozilla/firefox/default/user.js
cp /zenobia-helper/firefox-settings.js /home/abc/.mozilla/firefox/default/user.js/user.js

# Configure LXPanel with larger icons
mkdir -p /home/abc/.config/lxpanel/default/panels
cp /zenobia-helper/lxpanel-config.cfg /home/abc/.config/lxpanel/default/panels/panel

# Set ownership for these files too
chown -R abc:abc /home/abc/.gtkrc-2.0 /home/abc/.config/gtk-3.0 /home/abc/.config/lxterminal /home/abc/.mozilla /home/abc/.config/lxpanel