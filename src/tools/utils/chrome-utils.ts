import { IrisBrowser } from '../../modules/operators/services/IrisBrowser';

export class ChromeUtils {
    private static readonly COMMAND_TIMEOUT_MS = 30000;
    private static browser: IrisBrowser | null = null;
    private static page: any = null;

    /**
     * Launches the Chrome browser using IrisBrowser
     */
    static async launchChrome(): Promise<void> {
        this.browser = new IrisBrowser();
        await this.browser.launch({
            headless: false,
            defaultViewport: {
                width: 1280,
                height: 800
            }
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

    /**
     * Execute a command that has been converted from qutebrowser to Chrome/Puppeteer
     */
    static async executeCommand(command: string, statusCallback?: (message: string) => void): Promise<string> {
        if (!this.page || this.page.isClosed()) {
            throw new Error('Chrome browser is not running or page is closed');
        }

        console.log(`[ChromeAgent] Executing command: ${command}`);
        statusCallback?.(`Executing: ${command}`);

        try {
            // Parse and execute the command
            const result = await this.parseAndExecuteCommand(command);
            console.log(`[ChromeAgent] Command result: ${result}`);
            return result;
        } catch (error: any) {
            const errorMsg = `Error executing command "${command}": ${error.message}`;
            console.error(`[ChromeAgent] ${errorMsg}`);
            return errorMsg;
        }
    }

    /**
     * Parse qutebrowser-style commands and convert them to Puppeteer actions
     */
    private static async parseAndExecuteCommand(command: string): Promise<string> {
        if (!this.page) {
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
                await this.page.goto(args.join(' '), { waitUntil: 'networkidle0', timeout: this.COMMAND_TIMEOUT_MS });
                return 'Page opened successfully';

            case 'back':
                await this.page.goBack({ waitUntil: 'networkidle0' });
                return 'Navigated back';

            case 'forward':
                await this.page.goForward({ waitUntil: 'networkidle0' });
                return 'Navigated forward';

            case 'reload':
                await this.page.reload({ waitUntil: 'networkidle0' });
                return 'Page reloaded';

            case 'tab-close':
                await this.page.close();
                return 'Tab closed';

            case 'hint':
                return await this.addHints(args[0]);

            case 'hint-follow':
                if (args.length === 0) {
                    throw new Error('Hint number required for hint-follow command');
                }
                return await this.followHint(args[0]);

            case 'insert-text':
                if (args.length === 0) {
                    throw new Error('Text required for insert-text command');
                }
                const text = args.join(' ');
                await this.page.keyboard.type(text);
                return `Inserted text: ${text}`;

            case 'fake-key':
                if (args.length === 0) {
                    throw new Error('Key required for fake-key command');
                }
                return await this.pressKey(args[0]);

            case 'xdotool-type':
                if (args.length === 0) {
                    throw new Error('Text required for xdotool-type command');
                }
                return await this.typeForFiltering(args.join(' '));

            case 'scroll-to-perc':
                if (args.length === 0) {
                    throw new Error('Percentage required for scroll-to-perc command');
                }
                return await this.scrollToPercentage(parseInt(args[0]));

            case 'scroll-page':
                return await this.scrollPage(parseInt(args[1] || '1'));

            case 'search':
                if (args.length === 0) {
                    throw new Error('Search text required for search command');
                }
                return await this.searchText(args.join(' '));

            case 'search-next':
                return await this.searchNext();

            case 'search-prev':
                return await this.searchPrevious();

            default:
                throw new Error(`Unknown command: ${action}`);
        }
    }

    /**
     * Add hint labels to clickable elements
     */
    private static async addHints(type: string = 'all'): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        // Remove existing hints first
        await this.page.evaluate(() => {
            const existingHints = document.querySelectorAll('[data-chrome-hint]');
            existingHints.forEach(hint => hint.remove());
        });

        // Add new hints
        const selector = type === 'links' ? 'a[href], button, [onclick]' : 
                        'a, button, input, textarea, select, [onclick], [role="button"], [tabindex], [contenteditable]';

        const hintCount = await this.page.evaluate((sel) => {
            const elements = Array.from(document.querySelectorAll(sel));
            const visibleElements = elements.filter(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return rect.width > 0 && rect.height > 0 && 
                       style.visibility !== 'hidden' && 
                       style.display !== 'none' &&
                       rect.top < window.innerHeight && 
                       rect.bottom > 0;
            });

            visibleElements.forEach((el, index) => {
                const hint = document.createElement('div');
                const hintId = (index + 1).toString();
                hint.textContent = hintId;
                hint.setAttribute('data-chrome-hint', hintId);
                hint.style.position = 'absolute';
                hint.style.backgroundColor = 'yellow';
                hint.style.color = 'black';
                hint.style.padding = '2px 4px';
                hint.style.fontSize = '12px';
                hint.style.fontWeight = 'bold';
                hint.style.border = '1px solid black';
                hint.style.zIndex = '999999';
                hint.style.fontFamily = 'monospace';
                
                const rect = el.getBoundingClientRect();
                hint.style.left = (rect.left + window.scrollX) + 'px';
                hint.style.top = (rect.top + window.scrollY) + 'px';
                
                // Store reference to the target element
                (hint as any).__targetElement = el;
                
                document.body.appendChild(hint);
            });

            return visibleElements.length;
        }, selector);

        return `Added ${hintCount} hints to page`;
    }

    /**
     * Follow/click a hint by its number
     */
    private static async followHint(hintNumber: string): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        const result = await this.page.evaluate((num) => {
            const hint = document.querySelector(`[data-chrome-hint="${num}"]`) as any;
            if (!hint || !hint.__targetElement) {
                return `Hint ${num} not found`;
            }

            const target = hint.__targetElement;
            
            // Remove all hints after clicking
            const allHints = document.querySelectorAll('[data-chrome-hint]');
            allHints.forEach(h => h.remove());

            // Click the target element
            if (target.click) {
                target.click();
                return `Clicked element with hint ${num}`;
            } else {
                target.focus();
                return `Focused element with hint ${num}`;
            }
        }, hintNumber);

        // Wait a bit for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return result;
    }

    /**
     * Press a key
     */
    private static async pressKey(key: string): Promise<string> {
        if (!this.page) {
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
        await this.page.keyboard.press(mappedKey as any);
        return `Pressed key: ${mappedKey}`;
    }

    /**
     * Type text for filtering purposes (similar to xdotool-type)
     */
    private static async typeForFiltering(text: string): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        // This simulates the xdotool-type behavior for filtering hints
        // We'll type the text and then filter the visible hints
        await this.page.keyboard.type(text);
        
        // Filter hints based on the text
        const filteredCount = await this.page.evaluate((filterText) => {
            const hints = document.querySelectorAll('[data-chrome-hint]') as NodeListOf<HTMLElement>;
            let visibleCount = 0;
            
            hints.forEach(hint => {
                const target = (hint as any).__targetElement;
                if (target) {
                    const targetText = target.textContent?.toLowerCase() || '';
                    const shouldShow = targetText.includes(filterText.toLowerCase());
                    hint.style.display = shouldShow ? 'block' : 'none';
                    if (shouldShow) visibleCount++;
                    
                    // If there's exactly one match, auto-click it
                    if (shouldShow && visibleCount === 1) {
                        setTimeout(() => {
                            target.click();
                            // Remove all hints
                            document.querySelectorAll('[data-chrome-hint]').forEach(h => h.remove());
                        }, 100);
                    }
                }
            });
            
            return visibleCount;
        }, text);

        return `Typed "${text}" and filtered to ${filteredCount} visible hints`;
    }

    /**
     * Scroll to a percentage of the page
     */
    private static async scrollToPercentage(percent: number): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        await this.page.evaluate((pct) => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTo = (scrollHeight * pct) / 100;
            window.scrollTo(0, scrollTo);
        }, percent);

        return `Scrolled to ${percent}% of page`;
    }

    /**
     * Scroll page by a number of pages
     */
    private static async scrollPage(pages: number): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        const direction = pages > 0 ? 'down' : 'up';
        const amount = Math.abs(pages);
        
        for (let i = 0; i < amount; i++) {
            await this.page.keyboard.press(pages > 0 ? 'PageDown' : 'PageUp');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return `Scrolled ${amount} page(s) ${direction}`;
    }

    /**
     * Search for text on the page
     */
    private static async searchText(searchTerm: string): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        // Use browser's find functionality
        await this.page.keyboard.down('Meta');
        await this.page.keyboard.press('KeyF');
        await this.page.keyboard.up('Meta');
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.page.keyboard.type(searchTerm);
        
        return `Searched for: ${searchTerm}`;
    }

    /**
     * Find next search result
     */
    private static async searchNext(): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        await this.page.keyboard.press('Enter');
        return 'Moved to next search result';
    }

    /**
     * Find previous search result
     */
    private static async searchPrevious(): Promise<string> {
        if (!this.page) {
            throw new Error('No page available');
        }

        await this.page.keyboard.down('Shift');
        await this.page.keyboard.press('Enter');
        await this.page.keyboard.up('Shift');
        return 'Moved to previous search result';
    }

    static SYSTEM_PROMPT = `You are an expert Chrome browser automation agent. Your goal is to complete the user's task by interacting with a web browser using Chrome and Puppeteer.

**About Chrome automation:**
You control Chrome browser through Puppeteer commands. Unlike qutebrowser's keyboard-focused interface, you interact with elements through hint numbers that appear as yellow labels on clickable elements.

**Your Operating Loop:**
1.  **Analyze the current state** (based on the user's request and the latest screenshot).
2.  **Formulate a plan** which consists of a 'thought' and a sequence of 'steps' (commands).
3.  **Output the plan** as a single JSON object.

Your plan will be executed, a new screenshot will be taken, and then you will start the loop again.

**JSON Output Format:**
You MUST respond with a JSON object with the following structure.
\`\`\`json
{
  "action": "ACTION_NAME",
  "thought": "Short reason for the sequence of steps you are about to take. If finishing, this is your final summary.",
  "wittyMessage": "A short, funny, and cryptic message that will be displayed to the user to obscure what you are actually doing. Be creative and humorous but keep it brief. Use emojis.",
  "steps": [
    { "command": ":command_1" },
    { "command": ":command_2" },
    ...
  ]
}
\`\`\`
- \`action\`: (Required) Must be one of \`execute\` or \`finish\`.
- \`thought\`: (Required) Your reasoning. For the \`finish\` action, this will be your final summary.
- \`wittyMessage\`: (Required) A brief, funny message shown to the user that hides your actual actions. Examples: "🔮 Consulting the digital oracle...", "🎭 Performing internet magic tricks...", "🕵️ Sneaking through the web like a digital ninja..."
- \`steps\`: (Conditional) **Required** when \`action\` is \`execute\`. It's an array of command objects.

**Command Chaining Strategy:**
You should chain commands when you can confidently predict the outcome. For example, after activating an input field, you know you can immediately type into it and press enter.

**Search Strategy:**
When using \`:search\` to find text on a page, consider the context:
- For unique terms or specific information: Use \`:search\` and go directly to the first match.
- For common terms that might have multiple occurrences: Use \`:search\` then evaluate if you need to use \`:search-next\` to check other matches.
- If no results appear with \`:search EXACT_TEXT\`, try \`:search PARTIAL\` with shorter/partial terms or \`:search SIMILAR\` with similar words.
- The search will highlight all matches on the page, so you can visually assess if there are multiple results worth exploring.

**Advanced Hinting for Cluttered Screens:**
When a page is very cluttered (e.g., a calendar), hint numbers can obscure the text. In these cases, you can use a powerful filtering technique:
1.  First, issue the \`:hint\` command to display all hints.
2.  Instead of following with \`:hint-follow\`, use the \`:xdotool-type\` command to type the first few letters of the text on the element you want to click.
3.  Chrome will filter the hints in real-time. If your text uniquely identifies an element, Chrome will "click" it automatically. If not, the hints will be filtered, and you can then use \`:hint-follow\` on the smaller set of visible hints in the next step.

**Booking Website Interaction Pattern:**
For booking websites (flights, hotels, etc.) that use autocomplete dropdowns, follow this pattern:
1.  \`:hint\` → \`:hint-follow XX\` to activate the input field
2.  \`:insert-text YOUR_TEXT\` to type your search term
3.  Wait briefly for the dropdown to appear (include a pause or take screenshot)
4.  \`:hint\` again to see the dropdown options
5.  \`:hint-follow YY\` to select the desired option from the dropdown
6.  Repeat this pattern for each input field (departure, destination, dates, etc.)

This pattern is essential for sites where typing triggers dynamic content that needs to be interacted with.

**Available Commands (for the 'command' field):**

**Navigation:**
- \`:open URL\`: Navigate to a specific webpage.
- \`:back\`, \`:forward\`, \`:reload\`

**Tab Management:**
- \`:tab-close\`: Close the current tab.

**Page Interaction:**
- \`:hint\`: Display **numerical** labels on all clickable elements. ALWAYS take a screenshot after to see the labels.
- \`:hint links\`: Display **numerical** hints only for links.
- \`:hint-follow NUMBER\`: Click element with the specified numerical label.
- \`:insert-text TEXT\`: Insert text at the cursor.
- \`:fake-key <Return|Escape|Tab>\`: Press Enter, Escape, or Tab.
- \`:xdotool-type TEXT\`: Type characters to filter elements by their text.

**Scrolling & Search:**
- \`:scroll-to-perc PERCENT\`: Scroll to a percentage of the page (0-100).
- \`:scroll-page 0 1\`: Scroll one page down.
- \`:search TEXT\`: Search for text on the current page. Preferred over scrolling to find text.
- \`:search-next\`: Find the next match after using \`:search\`.
- \`:search-prev\`: Find the previous match after using \`:search\`.

**CRITICAL RULES:**
1.  All commands MUST start with a colon \`:\`.
2.  After a plan involving \`:hint\` is executed, the next screenshot will show the **numerical hint labels**. Use these numbers in your next plan.
3.  You can only see the screen via the screenshots provided. You are blind otherwise.
4.  Your final output MUST be an \`action: "finish"\` object. Your \`thought\` for this action is the final summary.
5.  Close any unnecessary popups.

Also ignore any browser errors that shows up. Now, begin the task.`;
}