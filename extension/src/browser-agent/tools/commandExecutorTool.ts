import { z } from "zod";
import { Tool } from '../reactAgent';

const CommandExecutorInput = z.object({
  xdotoolCommand: z.string().describe('Command for browser automation'),
  tabId: z.number().describe('Tab Id on which you want to perform the action')
});

export class CommandExecutorTool implements Tool {
  name = "CommandExecutorTool";
  description = "Executes browser automation commands. Available commands:\n" +
    "- mousemove x y # Move pointer to x,y coordinates\n" +
    "- click 1 # Left click at current position\n" +
    "- click 2 # Middle click at current position\n" +
    "- click 3 # Right click at current position\n" +
    "- click x y # Left click at x,y coordinates\n" +
    "- rightclick x y # Right click at x,y coordinates\n" +
    "- doubleclick x y # Double click at x,y coordinates\n" +
    "- mousedown 1 # Press left mouse button\n" +
    "- mouseup 1 # Release left mouse button\n" +
    "- type 'text' # Type text at current position\n" +
    "- type x y 'text' # Type text at x,y coordinates\n" +
    "- key Return # Press Enter key\n" +
    "- key Tab # Press Tab key\n" +
    "- key Up Down Left Right # Press arrow keys\n" +
    "- key ctrl+a # Press Ctrl+A\n" +
    "- key ctrl+c # Press Ctrl+C\n" +
    "- key ctrl+v # Press Ctrl+V\n" +
    "- scroll 0 10 # Scroll down 10 pixels\n" +
    "- scroll 0 -10 # Scroll up 10 pixels\n" +
    "- scroll up # Scroll up\n" +
    "- scroll down # Scroll down\n" +
    "- scroll left # Scroll left\n" +
    "- scroll right # Scroll right\n" +
    "- navigate url # Navigate to specified URL\n" +
    "- back # Navigate back in history\n" +
    "- forward # Navigate forward in history\n" +
    "- reload # Reload the current page\n" +
    "- focus x y # Focus element at x,y coordinates\n" +
    "- select x y # Select input at x,y coordinates\n" +
    "- submit x y # Submit form at x,y coordinates";

  inputSchema = CommandExecutorInput;
  
  // Method to ensure content script is injected and ready in a tab
  private async ensureContentScriptLoaded(tabId: number): Promise<void> {
    try {
      // Check if we can communicate with the content script
      await new Promise<void>((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
          const error = chrome.runtime.lastError;
          if (error || !response || response.action !== 'pong') {
            // Content script not ready, inject it
            chrome.scripting.executeScript({
              target: { tabId },
              files: ['content-script.js']
            })
            .then(() => resolve())
            .catch(err => reject(new Error(`Failed to inject content script: ${err}`)));
          } else {
            // Content script already loaded
            resolve();
          }
        });
        
        // Set a timeout in case the sendMessage hangs
        setTimeout(() => {
          // Inject the content script if we haven't received a response
          chrome.scripting.executeScript({
            target: { tabId },
            files: ['content-script.js']
          })
          .then(() => resolve())
          .catch(err => reject(new Error(`Failed to inject content script: ${err}`)));
        }, 500);
      });
    } catch (error) {
      throw new Error(`Failed to ensure content script is loaded: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async execute(input: z.infer<typeof CommandExecutorInput>): Promise<string> {
    const { xdotoolCommand, tabId } = input;

    if (!xdotoolCommand) {
      throw new Error('Command is required');
    }

    // Parse the xdotool command
    const parsedCommand = this.parseXdotoolCommand(xdotoolCommand);

    // Check if the tab exists and is ready first
    try {
      // Verify the tab exists
      const tab = await chrome.tabs.get(tabId);
      if (!tab) {
        throw new Error(`Tab with ID ${tabId} does not exist`);
      }
      
      // Ensure the content script is loaded before sending the command
      await this.ensureContentScriptLoaded(tabId);
      
      // Execute the command by sending it to the content script with proper error handling
      return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tabId,
          { action: 'execute_command', command: parsedCommand },
          (response) => {
            // Handle potential chrome.runtime.lastError which occurs when content script isn't ready
            const error = chrome.runtime.lastError;
            if (error) {
              console.error(`Error sending message to tab ${tabId}:`, error.message);
              reject(`CommandExecutorTool error: ${error.message}`);
              return;
            }
            
            // Handle response from content script
            if (response && response.success) {
              resolve(response.result);
            } else {
              reject(response?.error || 'Unknown error executing command');
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`CommandExecutorTool error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private parseXdotoolCommand(command: string): any {
    const parts = command.trim().split(/\s+/);
    const action = parts[0].toLowerCase();
    
    switch (action) {
      case 'mousemove':
        return {
          type: 'mousemove',
          x: parseInt(parts[1], 10),
          y: parseInt(parts[2], 10)
        };
      
      case 'click':
        // Handle both click with button number and click with coordinates
        if (parts.length >= 3 && !isNaN(parseInt(parts[1], 10)) && !isNaN(parseInt(parts[2], 10))) {
          return {
            type: 'click',
            x: parseInt(parts[1], 10),
            y: parseInt(parts[2], 10),
            button: 1 // Default to left click
          };
        } else {
          const button = parts[1] ? parseInt(parts[1], 10) : 1;
          return {
            type: 'click',
            button: button
          };
        }
      
      case 'rightclick':
        return {
          type: 'click',
          x: parseInt(parts[1], 10),
          y: parseInt(parts[2], 10),
          button: 3
        };
      
      case 'doubleclick':
        return {
          type: 'doubleclick',
          x: parseInt(parts[1], 10),
          y: parseInt(parts[2], 10)
        };
      
      case 'mousedown':
        return {
          type: 'mousedown',
          button: parts[1] ? parseInt(parts[1], 10) : 1
        };
      
      case 'mouseup':
        return {
          type: 'mouseup',
          button: parts[1] ? parseInt(parts[1], 10) : 1
        };
      
      case 'type':
        // Extract text between quotes if present
        const textMatch = command.match(/'([^']*)'|"([^"]*)"/);
        const text = textMatch ? (textMatch[1] || textMatch[2]) : parts.slice(1).join(' ');
        
        // Check if coordinates are provided
        if (parts.length >= 3 && !isNaN(parseInt(parts[1], 10)) && !isNaN(parseInt(parts[2], 10))) {
          return {
            type: 'type',
            x: parseInt(parts[1], 10),
            y: parseInt(parts[2], 10),
            text: textMatch ? text : parts.slice(3).join(' ')
          };
        } else {
          return {
            type: 'type',
            text: text
          };
        }
      
      case 'key':
        const keySequence = parts.slice(1).join(' ');
        return {
          type: 'key',
          sequence: keySequence
        };
      
      case 'scroll':
        if (parts[1] === 'up') {
          return {
            type: 'scroll',
            direction: 'up'
          };
        } else if (parts[1] === 'down') {
          return {
            type: 'scroll',
            direction: 'down'
          };
        } else if (parts[1] === 'left') {
          return {
            type: 'scroll',
            direction: 'left'
          };
        } else if (parts[1] === 'right') {
          return {
            type: 'scroll',
            direction: 'right'
          };
        } else {
          return {
            type: 'scroll',
            x: parseInt(parts[1], 10) || 0,
            y: parseInt(parts[2], 10) || 0
          };
        }
      
      case 'navigate':
        return {
          type: 'navigate',
          url: parts.slice(1).join(' ')
        };
      
      case 'back':
        return {
          type: 'back'
        };
      
      case 'forward':
        return {
          type: 'forward'
        };
      
      case 'reload':
        return {
          type: 'reload'
        };
      
      case 'focus':
        return {
          type: 'focus',
          x: parseInt(parts[1], 10),
          y: parseInt(parts[2], 10)
        };
      
      case 'select':
        return {
          type: 'select',
          x: parseInt(parts[1], 10),
          y: parseInt(parts[2], 10)
        };
      
      case 'submit':
        return {
          type: 'submit',
          x: parseInt(parts[1], 10),
          y: parseInt(parts[2], 10)
        };
      
      default:
        throw new Error(`Unsupported command: ${action}`);
    }
  }
}
