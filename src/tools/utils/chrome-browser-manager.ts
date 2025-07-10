import { IrisBrowser } from '../../modules/operators/services/IrisBrowser';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Manages Chrome browser lifecycle operations
 */
export class ChromeBrowserManager {
    private static browser: IrisBrowser | null = null;
    private static page: any = null;

    /**
     * Launches the Chrome browser using IrisBrowser
     */
    static async launchChrome(): Promise<void> {
        this.browser = new IrisBrowser();
        
        // Create user data directory for persistent sessions
        // Use containerized path when running in container, otherwise use home directory
        const userDataDir = process.env.IS_CONTAINERIZED 
            ? '/config/.config/chrome-user-data'
            : path.join(os.homedir(), '.iris', 'chrome-user-data');
        
        // Ensure the user data directory exists
        try {
            if (!fs.existsSync(userDataDir)) {
                fs.mkdirSync(userDataDir, { recursive: true });
                console.log(`[ChromeAgent] Created user data directory: ${userDataDir}`);
            }
        } catch (error) {
            console.warn(`[ChromeAgent] Failed to create user data directory: ${error}`);
            // Continue without userDataDir if we can't create it
        }
        
        await this.browser.launch({
            headless: false,
            defaultViewport: {
                width: 1280,
                height: 800
            },
            userDataDir: fs.existsSync(userDataDir) ? userDataDir : undefined
        });
        
        // Get the first page
        const pages = await this.browser.getBrowser()?.pages();
        if (pages && pages.length > 0) {
            this.page = pages[0];
        } else {
            this.page = await this.browser.getBrowser()?.newPage() || null;
        }

        if (this.page) {
            // Set viewport
            await this.page.setViewport({ width: 1280, height: 800 });
        }

        console.log('[ChromeAgent] Chrome launched successfully.');
    }

    /**
     * Check if Chrome is already running
     */
    static async isChromeRunning(): Promise<boolean> {
        return this.browser !== null && this.page !== null && !this.page.isClosed();
    }

    /**
     * Get the current page instance
     */
    static getPage(): any {
        return this.page;
    }

    /**
     * Get the browser instance
     */
    static getBrowser(): IrisBrowser | null {
        return this.browser;
    }

    /**
     * Close the browser
     */
    static async close(): Promise<void> {
        if (this.page && !this.page.isClosed()) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
        this.page = null;
        this.browser = null;
    }
}