#!/bin/bash
# Setup script to be run once during container startup

# Create necessary directories
mkdir -p /home/abc/.config/openbox
mkdir -p /home/abc/.config/autostart
mkdir -p /usr/share/backgrounds
mkdir -p /home/abc/Desktop

# Set default wallpaper (solid color if no image available)
echo "Creating default background..."
convert -size 1920x1080 gradient:navy-black /usr/share/backgrounds/default.jpg

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
gtk-theme-name="Arc-Dark"
gtk-icon-theme-name="Papirus"
gtk-font-name="DejaVu Sans 10"
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
EOF

# Copy the same settings for GTK3
mkdir -p /home/abc/.config/gtk-3.0
cat > /home/abc/.config/gtk-3.0/settings.ini << EOF
[Settings]
gtk-theme-name=Arc-Dark
gtk-icon-theme-name=Papirus
gtk-font-name=DejaVu Sans 10
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
EOF

# Set ownership for these files too
chown -R abc:abc /home/abc/.gtkrc-2.0 /home/abc/.config/gtk-3.0