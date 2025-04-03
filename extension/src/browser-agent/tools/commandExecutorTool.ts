import { z } from "zod";
import { Tool } from '../reactAgent';

const CommandExecutorInput = z.object({
  action: z.string().describe('Browser action to execute'),
  tabId: z.number().describe('Target tab ID (optional for some actions like list_tabs)')
});

// "list_tabs - Lists all open tabs in all windows with their IDs\n" +
// "read_tab [tabId] - Read the content of any tab by ID (even inactive)\n" +
// "\n" +
export class CommandExecutorTool implements Tool {
  name = "CommandExecutorTool";
  description = "Execute browser actions:\n" +
    "# Tab Management\n" +
    "# Mouse Actions\n" +
    "click/rightclick/doubleclick x y - Mouse actions at coordinates\n" +
    "mousemove/move x y - Move mouse pointer\n" +
    "\n" +
    "# Keyboard Actions\n" +
    "type 'text' - Type in active element\n" +
    "type x y 'text' - Type at coordinates\n" +
    "press/key Enter/Tab/Escape/ctrl+a - Press keys with modifiers\n" +
    "\n" +
    "# Navigation\n" +
    "goto/navigate url - Go to URL\n" +
    "back/forward/reload - History navigation\n" +
    "scroll up/down/left/right - Directional scrolling\n" +
    "scroll x y - Scroll to position\n" +
    "\n" +
    "# Element Interaction\n" +
    "focus/select x y - Focus or select element\n" +
    "submit x y - Submit a form\n" +
    "wait 1000 - Wait for milliseconds\n" +
    "\n" +
    "# Chaining\n" +
    "Chain with semicolons: click 100 100; type 'Hello'; press Enter" + 
    "\n" +
    "Chain actions together whenever you can \n";

  inputSchema = CommandExecutorInput;
  
  async execute(input: z.infer<typeof CommandExecutorInput>): Promise<string> {
    let { action, tabId } = input;
    
    try {
      // Check if it's a special command for tab management
      if (action.trim().toLowerCase().startsWith('list_tabs')) {
        return await this.listTabs();
      }
      
      if (action.trim().toLowerCase().startsWith('read_tab')) {
        // Extract targetTabId from the command if specified
        const parts = action.trim().split(/\s+/);
        const targetTabId = parts.length > 1 ? parseInt(parts[1], 10) : tabId;
        return await this.readTabContent(targetTabId);
      }
      
      // Verify if the provided tab ID exists, otherwise find active tab
      try {
        await chrome.tabs.get(tabId);
      } catch (error) {
        // If tab doesn't exist, get the active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length === 0 || !tabs[0].id) {
          throw new Error('No active tab found');
        }
        tabId = tabs[0].id;
        console.log(`Tab ${input.tabId} not found, using active tab ${tabId} instead`);
      }
      
      // Ensure content script is loaded
      await this.ensureContentScript(tabId);
      
      // Execute each command sequentially
      const commands = this.parseCommands(action);
      const results = [];
      
      for (const cmd of commands) {
        const result = await this.executeCommand(tabId, cmd);
        if (result) results.push(result);
      }
      
      return results.length ? results.join('\n') : 'Done';
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  private async ensureContentScript(tabId: number): Promise<void> {
    try {
      // Check if content script is already loaded
      const response = await new Promise<any>(resolve => {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, res => {
          resolve(res);
          if (chrome.runtime.lastError) resolve(null);
        });
        setTimeout(() => resolve(null), 300);
      });
      
      // If not loaded, inject it
      if (!response) {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content-script.js']
        });
      }
    } catch (error) {
      throw new Error(`Content script injection failed: ${error}`);
    }
  }
  
  private parseCommands(actionString: string): any[] {
    const commands = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    // Split by semicolons, respecting quotes
    for (let i = 0; i < actionString.length; i++) {
      const char = actionString[i];
      
      if ((char === "'" || char === '"') && (i === 0 || actionString[i-1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
      }
      
      if (char === ';' && !inQuotes) {
        if (current.trim()) commands.push(this.parseCommand(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) commands.push(this.parseCommand(current.trim()));
    
    return commands;
  }
  
  private parseCommand(cmd: string): any {
    const parts = cmd.trim().split(/\s+/);
    const action = parts[0].toLowerCase();
    const textMatch = cmd.match(/['"]([^'"]*)['"]/);
    const text = textMatch ? textMatch[1] : null;
    
    // Get platform-specific info
    const isMac = navigator.platform.toLowerCase().includes('mac');
    
    switch (action) {
      case 'click':
        return { type: 'click', x: +parts[1], y: +parts[2], button: 1 };
      case 'rightclick':
        return { type: 'click', x: +parts[1], y: +parts[2], button: 3 };
      case 'doubleclick':
        return { type: 'doubleclick', x: +parts[1], y: +parts[2] };
      case 'mousemove':
      case 'move':
        return { type: 'mousemove', x: +parts[1], y: +parts[2] };
      case 'type':
        if (parts.length >= 3 && !isNaN(+parts[1])) {
          return {
            type: 'type',
            x: +parts[1],
            y: +parts[2],
            text: text || parts.slice(3).join(' ')
          };
        }
        return { type: 'type', text: text || parts.slice(1).join(' ') };
      case 'press':
      case 'key':
        let keySeq = parts.slice(1).join(' ');
        if (isMac) keySeq = keySeq.replace(/ctrl\+/gi, 'cmd+');
        return { type: 'key', sequence: keySeq, isMac };
      case 'scroll':
        if (['up','down','left','right'].includes(parts[1])) {
          return { type: 'scroll', direction: parts[1] };
        }
        return { type: 'scroll', x: +parts[1] || 0, y: +parts[2] || 0 };
      case 'goto':
      case 'navigate':
        return { type: 'navigate', url: parts.slice(1).join(' ') };
      case 'back': return { type: 'back' };
      case 'forward': return { type: 'forward' };
      case 'reload': return { type: 'reload' };
      case 'focus': return { type: 'focus', x: +parts[1], y: +parts[2] };
      case 'select': return { type: 'select', x: +parts[1], y: +parts[2] };
      case 'submit': return { type: 'submit', x: +parts[1], y: +parts[2] };
      case 'wait': return { type: 'wait', ms: +parts[1] || 500 };
      default:
        throw new Error(`Unknown command: ${action}`);
    }
  }
  
  private async executeCommand(tabId: number, command: any): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabId,
        { action: 'execute_command', command },
        response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
            return;
          }
          
          if (response?.success) {
            resolve(response.result || '');
          } else {
            reject(response?.error || 'Command failed');
          }
        }
      );
    });
  }
  
  /**
   * List all open tabs in all windows
   */
  private async listTabs(): Promise<string> {
    try {
      const windows = await chrome.windows.getAll({ populate: true });
      let result = "Open tabs:\n";
      
      for (const window of windows) {
        result += `\nWindow ${window.id} ${window.focused ? '(focused)' : ''}\n`;
        
        if (window.tabs) {
          for (const tab of window.tabs) {
            result += `${tab.id}: ${tab.active ? '[ACTIVE] ' : ''}${tab.title} - ${tab.url}\n`;
          }
        }
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to list tabs: ${error}`);
    }
  }
  
  /**
   * Read content from a specified tab
   */
  private async readTabContent(tabId: number): Promise<string> {
    try {
      // Verify if the provided tab ID exists, otherwise find active tab
      try {
        await chrome.tabs.get(tabId);
      } catch (error) {
        // If tab doesn't exist, get the active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length === 0 || !tabs[0].id) {
          throw new Error('No active tab found');
        }
        tabId = tabs[0].id;
        console.log(`Tab ${tabId} not found for readTabContent, using active tab ${tabId} instead`);
      }
      
      // Inject content script if needed
      await this.ensureContentScript(tabId);
      
      // Execute content reading script
      const scriptResult = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          // Simplified HTML representation for text content
          const body = document.body;
          
          // @ts-expect-error
          function extractVisibleText(node) {
            let text = '';
            
            if (node.nodeType === Node.TEXT_NODE) {
              // Check if parent node is visible
              const style = window.getComputedStyle(node.parentNode);
              if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                return node.textContent.trim();
              }
              return '';
            }
            
            // Skip certain tags that might contain non-content text
            const nodeName = node.nodeName.toLowerCase();
            if (['script', 'style', 'noscript', 'svg'].includes(nodeName)) {
              return '';
            }
            
            // Process children
            for (const child of node.childNodes) {
              text += ' ' + extractVisibleText(child);
            }
            
            return text.trim();
          }
          
          // Get page title and meta description
          const title = document.title || '';
          const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
          
          // Extract visible text content
          const textContent = extractVisibleText(body);
          
          return {
            url: document.URL,
            title,
            metaDescription,
            textContent
          };
        }
      });
      
      if (!scriptResult || scriptResult.length === 0) {
        return "No content could be extracted from the tab.";
      }
      
      const content = scriptResult[0].result;
      return [
        `URL: ${content.url}`,
        `Title: ${content.title}`,
        content.metaDescription ? `Description: ${content.metaDescription}` : '',
        '-------- CONTENT --------',
        content.textContent.substring(0, 10000) + (content.textContent.length > 10000 ? '...(truncated)' : '')
      ].filter(Boolean).join('\n');
      
    } catch (error) {
      throw new Error(`Failed to read tab content: ${error}`);
    }
  }
}