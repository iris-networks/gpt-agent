/**
 * Manages UI overlays in the Chrome browser
 */
export class ChromeUIOverlay {
    
    /**
     * Show command in browser as overlay
     */
    static async showCommandInBrowser(page: any, command: string): Promise<void> {
        if (!page) {
            return;
        }

        try {
            await page.evaluate((cmd: string) => {
                // Create or update command display
                let commandDisplay = document.getElementById('chrome-command-display');
                if (!commandDisplay) {
                    commandDisplay = document.createElement('div');
                    commandDisplay.id = 'chrome-command-display';
                    commandDisplay.style.cssText = `
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: rgba(0, 0, 0, 0.8);
                        color: #00ff00;
                        padding: 8px 16px;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        z-index: 999999;
                        border-top: 1px solid #333;
                    `;
                    document.body.appendChild(commandDisplay);
                }
                
                commandDisplay.textContent = cmd;
                
                // Auto-hide after 2 seconds
                setTimeout(() => {
                    if (commandDisplay && commandDisplay.parentNode) {
                        commandDisplay.style.opacity = '0.5';
                    }
                }, 2000);
            }, command);
        } catch (error) {
            console.warn('[ChromeAgent] Failed to show command in browser:', error);
        }
    }
}