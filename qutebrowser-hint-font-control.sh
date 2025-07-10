#!/bin/bash

# Qutebrowser Hint Font Size Controller
# Usage: ./qutebrowser-hint-font-control.sh [size|scale|preset]
# Examples:
#   ./qutebrowser-hint-font-control.sh 12pt
#   ./qutebrowser-hint-font-control.sh 1.5x
#   ./qutebrowser-hint-font-control.sh small
#   ./qutebrowser-hint-font-control.sh medium
#   ./qutebrowser-hint-font-control.sh large

CONFIG_DIR="$HOME/.qutebrowser"
CONFIG_FILE="$CONFIG_DIR/config.py"

# Ensure config directory exists
mkdir -p "$CONFIG_DIR"

# Function to set hint font size
set_hint_font() {
    local size="$1"
    local config_content="# Qutebrowser configuration file

# Load autoconfig
config.load_autoconfig()

# Hint font scaling
c.fonts.hints = 'bold ${size} monospace'

# Set window title
c.window.title_format = '{perc}{current_title} - Iris Browser'"
    
    echo "$config_content" > "$CONFIG_FILE"
    echo "✓ Hint font size set to: $size"
    echo "✓ Restart qutebrowser to apply changes"
}

# Function to show current setting
show_current() {
    if [[ -f "$CONFIG_FILE" ]]; then
        echo "Current hint font configuration:"
        grep "c.fonts.hints" "$CONFIG_FILE" 2>/dev/null || echo "No hint font configuration found"
    else
        echo "No qutebrowser configuration file found"
    fi
}

# Function to show help
show_help() {
    echo "Iris Browser Hint Font Size Controller"
    echo ""
    echo "Usage: $0 [size|scale|preset|command]"
    echo ""
    echo "Font Sizes:"
    echo "  8pt, 9pt, 10pt, 11pt, 12pt, 13pt, 14pt, 15pt, 16pt, 18pt, 20pt, 24pt"
    echo ""
    echo "Scale Multipliers:"
    echo "  0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x, 3x"
    echo "  (Applied to base size of 9pt)"
    echo ""
    echo "Presets:"
    echo "  tiny     - 7pt"
    echo "  small    - 9pt (default)"
    echo "  medium   - 12pt"
    echo "  large    - 15pt"
    echo "  huge     - 18pt"
    echo "  giant    - 24pt"
    echo ""
    echo "Commands:"
    echo "  current  - Show current setting"
    echo "  help     - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 12pt"
    echo "  $0 1.5x"
    echo "  $0 large"
    echo "  $0 current"
}

# Main logic
case "$1" in
    # Point sizes
    [0-9]*pt)
        set_hint_font "$1"
        ;;
    
    # Scale multipliers (base 9pt)
    *x)
        scale="${1%x}"
        if [[ "$scale" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
            size=$(echo "scale=1; 9 * $scale" | bc)
            set_hint_font "${size}pt"
        else
            echo "Error: Invalid scale format. Use format like 1.5x"
            exit 1
        fi
        ;;
    
    # Presets
    tiny)
        set_hint_font "7pt"
        ;;
    small)
        set_hint_font "9pt"
        ;;
    medium)
        set_hint_font "12pt"
        ;;
    large)
        set_hint_font "15pt"
        ;;
    huge)
        set_hint_font "18pt"
        ;;
    giant)
        set_hint_font "24pt"
        ;;
    
    # Commands
    current)
        show_current
        ;;
    help|--help|-h)
        show_help
        ;;
    
    # No arguments or invalid
    "")
        echo "Error: No size specified"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
    *)
        echo "Error: Unknown size or preset '$1'"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac