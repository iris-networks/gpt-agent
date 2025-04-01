import { z } from "zod";
import { Tool } from '../reactAgent';

const CommandExecutorInput = z.object({
  command: z.string().describe('The command to execute in the browser (click, type, press, scroll)')
});

export class CommandExecutorTool implements Tool {
  name = "CommandExecutorTool";
  description = "Executes browser automation commands. Available commands:\n" +
    "- click [x,y] # Click at coordinates\n" +
    "- type [x,y] 'text' # Type text at coordinates\n" +
    "- press Key # Press keyboard key (Enter, Tab, ArrowDown, etc.)\n" +
    "- scroll direction # Scroll page (up, down, left, right)";

  inputSchema = CommandExecutorInput;

  async execute(input: z.infer<typeof CommandExecutorInput>): Promise<string> {
    const { command } = input;
    
    if (!command) {
      throw new Error('Command is required');
    }
    
    // Execute the command by sending it to the content script
    return this.executeInBrowser(command);
  }

  private async executeInBrowser(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0] || !tabs[0].id) {
          reject("No active tab found");
          return;
        }
        
        chrome.tabs.sendMessage(
          tabs[0].id, 
          { action: 'execute_command', command },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
              return;
            }
            
            if (response && response.success) {
              resolve(response.result);
            } else {
              reject(response?.error || "Failed to execute command");
            }
          }
        );
      });
    });
  }
}
