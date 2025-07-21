#!/bin/bash
# cleanup-browser-locks.sh - Remove Chromium lock files from browser data directory

echo "🧹 Cleaning up Chromium lock files..."

BROWSER_DATA_DIR="/config/browser/user-data"

if [ -d "$BROWSER_DATA_DIR" ]; then
    echo "  📁 Cleaning browser data directory: $BROWSER_DATA_DIR"
    
    # Remove Chromium singleton lock files
    find "$BROWSER_DATA_DIR" -name "Singleton*" -delete 2>/dev/null
    
    echo "  ✅ Browser lock files cleaned up"
else
    echo "  ⚠️  Browser data directory not found: $BROWSER_DATA_DIR"
fi

# Kill any stale Chrome processes that might be holding locks
echo "  🔄 Checking for stale browser processes..."
pkill -f "chrome" 2>/dev/null || true
pkill -f "chromium" 2>/dev/null || true

echo "✅ Browser lock cleanup completed!"