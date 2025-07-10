import { ChromeHintManager } from './chrome-hint-manager';
import { ChromeNavigationManager } from './chrome-navigation-manager';

/**
 * Executes Chrome browser commands by parsing and routing them to appropriate handlers
 */
export class ChromeCommandExecutor {
    private static readonly COMMAND_TIMEOUT_MS = 30000;

    /**
     * Parse qutebrowser-style commands and convert them to Puppeteer actions
     */
    static async parseAndExecuteCommand(page: any, command: string): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        // Remove leading colon if present
        const cleanCommand = command.startsWith(':') ? command.substring(1) : command;
        const parts = cleanCommand.split(' ');
        const action = parts[0];
        const args = parts.slice(1);

        switch (action) {
            case 'open':
                if (args.length === 0) {
                    throw new Error('URL required for open command');
                }
                await page.goto(args.join(' '), { waitUntil: 'networkidle0', timeout: this.COMMAND_TIMEOUT_MS });
                return 'Page opened successfully';

            case 'back':
                await page.goBack({ waitUntil: 'networkidle0' });
                return 'Navigated back';

            case 'forward':
                await page.goForward({ waitUntil: 'networkidle0' });
                return 'Navigated forward';

            case 'reload':
                await page.reload({ waitUntil: 'networkidle0' });
                return 'Page reloaded';

            case 'tab-close':
                await page.close();
                return 'Tab closed';

            case 'hint':
                return await ChromeHintManager.addHints(page, args[0]);

            case 'hint-follow':
                if (args.length === 0) {
                    throw new Error('Hint number required for hint-follow command');
                }
                return await ChromeHintManager.followHint(page, args[0]);

            case 'insert-text':
                if (args.length === 0) {
                    throw new Error('Text required for insert-text command');
                }
                const text = args.join(' ');
                return await ChromeNavigationManager.insertText(page, text);

            case 'fake-key':
                if (args.length === 0) {
                    throw new Error('Key required for fake-key command');
                }
                return await ChromeNavigationManager.pressKey(page, args[0]);

            case 'xdotool-type':
                if (args.length === 0) {
                    throw new Error('Text required for xdotool-type command');
                }
                return await ChromeHintManager.typeForFiltering(page, args.join(' '));

            case 'scroll-to-perc':
                if (args.length === 0) {
                    throw new Error('Percentage required for scroll-to-perc command');
                }
                return await ChromeNavigationManager.scrollToPercentage(page, parseInt(args[0]));

            case 'scroll-page':
                return await ChromeNavigationManager.scrollPage(page, parseInt(args[1] || '1'));

            case 'search':
                if (args.length === 0) {
                    throw new Error('Search text required for search command');
                }
                return await ChromeNavigationManager.searchText(page, args.join(' '));

            case 'search-next':
                return await ChromeNavigationManager.searchNext(page);

            case 'search-prev':
                return await ChromeNavigationManager.searchPrevious(page);

            default:
                throw new Error(`Unknown command: ${action}`);
        }
    }
}