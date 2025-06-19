================================================
FILE: template/e2b.Dockerfile
================================================
# E2B Desktop Sandbox Template
#
# This Dockerfile contains the commands to create a computer use sandbox on E2B.
# If you want to make your own template based on this one, make your changes

FROM ubuntu:22.04

# Environment variables:

ENV \
    # Avoid system prompts: \
    DEBIAN_FRONTEND=noninteractive \
    DEBIAN_PRIORITY=high \
    # Pip settings: \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# Desktop environment:

RUN yes | unminimize && \
    apt-get update && \
    # X window server:
    apt-get install -y xserver-xorg xorg x11-xserver-utils xvfb x11-utils xauth && \
    # XFCE desktop environment:
    apt-get install -y xfce4 xfce4-goodies && \ 
    # Basic system utilities:
    apt-get install -y util-linux sudo curl git wget && \
    # Pip will be used to install Python packages:
    apt-get install -y python3-pip && \ 
    # Tools used by the desktop SDK:
    apt-get install -y xdotool scrot ffmpeg

# Streaming server:

RUN \
    # VNC: \
    apt-get install -y x11vnc && \
    # NoVNC: \
    git clone --branch e2b-desktop https://github.com/e2b-dev/noVNC.git /opt/noVNC && \
    ln -s /opt/noVNC/vnc.html /opt/noVNC/index.html && \
    # Websockify: \
    apt-get install -y net-tools netcat && \
    pip install numpy && \
    git clone --branch v0.12.0 https://github.com/novnc/websockify /opt/noVNC/utils/websockify

# User applications:

# ~ Make your changes to this template BELOW this line ~

# Set the default terminal
RUN ln -sf /usr/bin/xfce4-terminal.wrapper /etc/alternatives/x-terminal-emulator

# Install standard apps
RUN apt-get install -y x11-apps \
    libreoffice \
    xpdf \
    gedit \
    xpaint \
    tint2 \
    galculator \
    pcmanfm

# Install Firefox
RUN apt-get install -y software-properties-common && \
    add-apt-repository ppa:mozillateam/ppa && \
    apt-get install -y --no-install-recommends \
    firefox-esr

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable

# Set Firefox as default browser
RUN update-alternatives --set x-www-browser /usr/bin/firefox-esr

# Copy Chrome desktop shortcut
COPY google-chrome.desktop /usr/share/applications/google-chrome.desktop

# Install VS Code
RUN apt-get install apt-transport-https && \
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    add-apt-repository -y "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" && \
    apt-get update -y && \
    apt-get install -y code
RUN mkdir -p /home/user/.config/Code/User
COPY ./settings.json /home/user/.config/Code/User/settings.json

# Copy desktop background for XFCE
COPY ./wallpaper.png /usr/share/backgrounds/xfce/wallpaper.png
RUN mkdir -p /home/user/.config/xfce4/xfconf/xfce-perchannel-xml/
COPY ./xfce4-desktop.xml /home/user/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml

# Install gtk-launch and update desktop database
RUN apt-get install -y libgtk-3-bin && \
    update-desktop-database /usr/share/applications/

# Copy firefox policies
COPY firefox-policies.json /usr/lib/firefox-esr/distribution/policies.json
COPY firefox-autoconfig.js /usr/lib/firefox-esr/defaults/pref/autoconfig.js
COPY firefox.cfg /usr/lib/firefox-esr/firefox.cfg



================================================
FILE: template/e2b.toml
================================================
# This is a config for E2B sandbox template.
# You can use template ID (k0wmnzir0zuzye6dndlw) or template name (desktop) to create a sandbox:

# Python SDK
# from e2b import Sandbox, AsyncSandbox
# sandbox = Sandbox("desktop") # Sync sandbox
# sandbox = await AsyncSandbox.create("desktop") # Async sandbox

# JS SDK
# import { Sandbox } from 'e2b'
# const sandbox = await Sandbox.create('desktop')

team_id = "460355b3-4f64-48f9-9a16-4442817f79f5"
memory_mb = 8_192
cpu_count = 8
dockerfile = "e2b.Dockerfile"
template_name = "desktop"
template_id = "k0wmnzir0zuzye6dndlw"



================================================
FILE: template/firefox-autoconfig.js
================================================
pref("general.config.filename", "firefox.cfg");
pref("general.config.obscure_value", 0);



================================================
FILE: template/firefox-policies.json
================================================
{
  "policies": {
    "DisableFirstRunPage": true,
    "OverrideFirstRunPage": "",
    "OverridePostUpdatePage": ""
  }
}


================================================
FILE: template/firefox.cfg
================================================
// Disable first-run and onboarding
pref("browser.startup.homepage_override.mstone", "ignore");
pref("browser.startup.homepage_override.buildID", "");
pref("browser.aboutwelcome.enabled", false);
pref("browser.messaging-system.whatsNewPanel.enabled", false);

// Disable Firefox studies and telemetry
pref("app.shield.optoutstudies.enabled", false);
pref("app.normandy.enabled", false);
pref("app.normandy.api_url", "");
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.archive.enabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);

// Disable sponsored suggestions in address bar (Firefox Suggest)
pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false);
pref("browser.urlbar.suggest.quicksuggest.sponsored", false);
pref("browser.urlbar.quicksuggest.enabled", false);

// Disable Pocket and all new tab sponsored stuff
pref("extensions.pocket.enabled", false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.feeds.snippets", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);

// Disable extension recommendations
pref("extensions.htmlaboutaddons.recommendations.enabled", false);
pref("browser.discovery.enabled", false);

// Disable automatic updates
pref("app.update.auto", false);



================================================
FILE: template/google-chrome.desktop
================================================
[Desktop Entry]
Version=1.0
Name=Google Chrome
Exec=/usr/bin/google-chrome-stable --no-first-run --no-default-browser-check --password-store=basic
Terminal=false
Icon=google-chrome
Type=Application
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml_xml;x-scheme-handler/http;x-scheme-handler/https;
StartupWMClass=Google-chrome 


================================================
FILE: template/settings.json
================================================
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 200,
  "security.allowHttp": true,
  "security.workspace.trust.startupPrompt": "never",
  "security.workspace.trust.enabled": false,
  "security.workspace.trust.banner": "never",
  "security.workspace.trust.emptyWindow": false
}



================================================
FILE: template/xfce4-desktop.xml
================================================
<?xml version="1.0" encoding="UTF-8"?>

<channel name="xfce4-desktop" version="1.0">
    <property name="backdrop" type="empty">
        <property name="screen0" type="empty">
            <property name="monitorscreen" type="empty">
                <property name="workspace0" type="empty">
                    <property name="last-image" type="string"
                        value="/usr/share/backgrounds/xfce/wallpaper.png" />
                    <property name="color-style" type="int" value="0" />
                    <property name="image-style" type="int" value="5" />
                </property>
            </property>
        </property>
    </property>
</channel>

