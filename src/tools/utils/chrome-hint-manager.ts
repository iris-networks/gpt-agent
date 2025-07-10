/**
 * Manages hint functionality for Chrome browser automation
 */
export class ChromeHintManager {
    
    /**
     * Add hint labels to clickable elements
     */
    static async addHints(page: any, type: string = 'all'): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        // Remove existing hints first
        await page.evaluate(() => {
            const existingHints = document.querySelectorAll('[data-chrome-hint]');
            existingHints.forEach((hint: Element) => hint.remove());
        });

        // Add new hints
        const selector = type === 'links' ? 'a[href], button, [onclick]' : 
                        'a, button, input, textarea, select, [onclick], [role="button"], [tabindex], [contenteditable]';

        const hintCount = await page.evaluate((sel: string) => {
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
    static async followHint(page: any, hintNumber: string): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        const result = await page.evaluate((num: string) => {
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
     * Type text for filtering purposes (similar to xdotool-type)
     */
    static async typeForFiltering(page: any, text: string): Promise<string> {
        if (!page) {
            throw new Error('No page available');
        }

        // This simulates the xdotool-type behavior for filtering hints
        // We'll type the text and then filter the visible hints
        // Process escape sequences to handle \n, \t, etc.
        const processedText = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
        await page.keyboard.type(processedText);
        
        // Filter hints based on the text
        const filteredCount = await page.evaluate((filterText: string) => {
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
}