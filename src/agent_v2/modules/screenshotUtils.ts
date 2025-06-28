import { Operator } from '@app/packages/ui-tars/sdk/src/types';

export class ScreenshotUtils {
    private operator: Operator;

    constructor(operator: Operator) {
        this.operator = operator;
    }

    /**
     * Takes a screenshot with constant delay retries in case of failures
     * This helps when the page is in a navigation state
     */
    async takeScreenshotWithBackoff(maxRetries = 4, delayMs = 500): Promise<{base64: string}> {
        let retries = 0;

        while (retries < maxRetries) {
            try {
                const screenshot = await this.operator.screenshot();
                return screenshot;
            } catch (error) {
                console.warn(`Screenshot attempt ${retries + 1} failed: ${error.message}`);
                retries++;

                if (retries >= maxRetries) {
                    console.error("Max screenshot retries reached, throwing last error");
                    throw error;
                }

                // Constant delay with small jitter
                const jitter = Math.random() * 100;
                await new Promise(resolve => setTimeout(resolve, delayMs + jitter));
            }
        }

        // Fallback in case loop exits unexpectedly
        return await this.operator.screenshot();
    }
}