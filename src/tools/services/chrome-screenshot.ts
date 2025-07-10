import { ChromeUtils } from '../utils/chrome-utils';

export class ChromeScreenshotService {
    /**
     * Take a screenshot of the current Chrome page
     */
    static async takeChromeScreenshot(): Promise<string> {
        const page = ChromeUtils.getPage();
        if (!page || page.isClosed()) {
            throw new Error('Chrome browser is not running or page is closed');
        }

        try {
            console.log('[ChromeAgent] Taking screenshot...');
            
            // Take a full page screenshot
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: false, // Use viewport screenshot for consistency with qutebrowser behavior
                captureBeyondViewport: false
            });

            // Convert buffer to base64
            const base64Image = Buffer.from(screenshot).toString('base64');
            
            console.log('[ChromeAgent] Screenshot taken successfully');
            return base64Image;
        } catch (error) {
            console.error('[ChromeAgent] Failed to take screenshot:', error);
            throw new Error(`Failed to take screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Take a screenshot with a specific viewport size
     */
    static async takeChromeScreenshotWithViewport(width: number, height: number): Promise<string> {
        const page = ChromeUtils.getPage();
        if (!page || page.isClosed()) {
            throw new Error('Chrome browser is not running or page is closed');
        }

        try {
            // Set viewport size
            await page.setViewport({ width, height });
            
            // Take screenshot
            return await this.takeChromeScreenshot();
        } catch (error) {
            console.error('[ChromeAgent] Failed to take screenshot with viewport:', error);
            throw new Error(`Failed to take screenshot with viewport: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}