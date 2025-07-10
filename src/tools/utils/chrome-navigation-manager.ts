/**
 * Manages navigation and scrolling functionality for Chrome browser automation
 */
export class ChromeNavigationManager {
    
    /**
     * Press a key
     */
    static async pressKey(page: any, key: string): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        // Map qutebrowser key names to Puppeteer key names
        const keyMap: { [key: string]: string } = {
            '<Return>': 'Enter',
            '<Escape>': 'Escape',
            '<Tab>': 'Tab',
            '<Space>': ' ',
            '<BackSpace>': 'Backspace'
        };

        const mappedKey = keyMap[key] || key.replace('<', '').replace('>', '');
        await page.keyboard.press(mappedKey as any);
        return `Pressed key: ${mappedKey}`;
    }

    /**
     * Scroll to a percentage of the page
     */
    static async scrollToPercentage(page: any, percent: number): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        await page.evaluate((pct: number) => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTo = (scrollHeight * pct) / 100;
            window.scrollTo(0, scrollTo);
        }, percent);

        return `Scrolled to ${percent}% of page`;
    }

    /**
     * Scroll page by a number of pages
     */
    static async scrollPage(page: any, pages: number): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        const direction = pages > 0 ? 'down' : 'up';
        const amount = Math.abs(pages);
        
        for (let i = 0; i < amount; i++) {
            await page.keyboard.press(pages > 0 ? 'PageDown' : 'PageUp');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return `Scrolled ${amount} page(s) ${direction}`;
    }

    /**
     * Search for text on the page
     */
    static async searchText(page: any, searchTerm: string): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        // Use browser's find functionality
        await page.keyboard.down('Meta');
        await page.keyboard.press('KeyF');
        await page.keyboard.up('Meta');
        await new Promise(resolve => setTimeout(resolve, 100));
        await page.keyboard.type(searchTerm);
        
        return `Searched for: ${searchTerm}`;
    }

    /**
     * Find next search result
     */
    static async searchNext(page: any): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        await page.keyboard.press('Enter');
        return 'Moved to next search result';
    }

    /**
     * Find previous search result
     */
    static async searchPrevious(page: any): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        await page.keyboard.down('Shift');
        await page.keyboard.press('Enter');
        await page.keyboard.up('Shift');
        return 'Moved to previous search result';
    }

    /**
     * Insert text at cursor position
     */
    static async insertText(page: any, text: string): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        // Process escape sequences to handle \n, \t, etc.
        const processedText = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
        await page.keyboard.type(processedText);
        return `Inserted text: ${text}`;
    }
}