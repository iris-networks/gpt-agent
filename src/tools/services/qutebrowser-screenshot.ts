import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { platform, homedir } from 'os';
import { join } from 'path';
import { sleep } from '@app/packages/ui-tars/shared/src/utils';

const execAsync = promisify(exec);

export class QutebrowserScreenshotService {
    /**
     * Take screenshot targeting QuteBrowser window
     */
    static async takeQutebrowserScreenshot(): Promise<string> {
        const screenshotPath = `/tmp/qutebrowser_screenshot_${Date.now()}.png`;

        try {
            if (platform() === 'darwin') {
                // macOS: Use system default screenshot tool
                await execAsync(`screencapture -x "${screenshotPath}"`, {
                    timeout: 5000
                });
                await sleep(1000)
            } else {
                // Linux: Use scrot with X11 display settings
                await execAsync(`scrot -u -q 100 "${screenshotPath}"`, {
                    timeout: 5000,
                    env: {
                        ...process.env,
                        DISPLAY: ':1',
                        XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
                    }
                });
            }

            const screenshotBuffer = readFileSync(screenshotPath);
            console.log(`[QuteBrowserAgent] Screenshot captured successfully`);
            return screenshotBuffer.toString('base64');
        } catch (error) {
            const errorMsg = `Failed to take screenshot: ${error.message}`;
            console.error(`[QuteBrowserAgent] ${errorMsg}`);
            // Propagate the error to be handled by the main loop
            throw new Error(errorMsg);
        }
    }
}