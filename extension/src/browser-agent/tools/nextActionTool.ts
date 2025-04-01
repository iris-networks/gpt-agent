import { z } from "zod";
import { Tool } from '../reactAgent';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const NextActionInput = z.object({
  userIntent: z.string().describe('The exact task the user asked the ai agent to complete'),
  previousActions: z.array(z.string()).optional().describe('List of actions already taken so far')
});

export class NextActionTool implements Tool {
  name = "NextActionTool";
  description = "Finds the next best action to take to meet the user's goal. Always called before making a decision.";

  inputSchema = NextActionInput;

  async execute(input: z.infer<typeof NextActionInput>): Promise<string> {
    const { userIntent, previousActions = [] } = input;

    try {
      // Step 1: Take screenshot
      const screenshot = await this.takeScreenshot();
      
      // Step 2: Analyze DOM elements
      const domAnalysis = await this.analyzeDom();

      // Step 3: Get the next action recommendation
      return this.getNextAction(userIntent, previousActions, screenshot, domAnalysis);
    } catch (error) {
      throw new Error(`NextActionTool error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Take a screenshot of the current page
  private async takeScreenshot(): Promise<{
    buffer: Buffer;
    dimensions: {
      width: number;
      height: number;
      scalingFactor: number;
    };
  }> {
    try {
      // This tool requires Chrome extension APIs to function
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('Chrome extension API not available. This tool can only be used within a browser extension context.');
      }

      // Using Chrome extension API
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Get window info for proper dimensions
      const windowInfo = await chrome.windows.get(tab.windowId);

      // Capture screenshot as data URL
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

      // Get device pixel ratio for scaling
      const devicePixelRatio = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.devicePixelRatio
      });

      const scalingFactor = devicePixelRatio[0]?.result || 1.0;

      // Convert data URL to buffer
      const base64Data = dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      return {
        buffer,
        dimensions: {
          width: windowInfo.width || 1920,
          height: windowInfo.height || 1080,
          scalingFactor
        }
      };
    } catch (error: any) {
      console.error('Error taking screenshot:', error);
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }

  // Analyze DOM elements in the page
  private async analyzeDom(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0] || !tabs[0].id) {
          reject("No active tab found");
          return;
        }
        
        chrome.tabs.sendMessage(
          tabs[0].id, 
          { action: 'analyze_dom' },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
              return;
            }
            
            if (response && response.success) {
              resolve(response.elements);
            } else {
              reject(response?.error || "Failed to analyze DOM");
            }
          }
        );
      });
    });
  }


  private async getNextAction(
    userIntent: string,
    previousActions: string[],
    screenshot: { buffer: Buffer, dimensions: any },
    pageLayout: string,
  ): Promise<string> {
    const config = await this.getConfig();
    if (!config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    const anthropic = createAnthropic({
      apiKey: config.apiKey
    });

    try {
      const { text } = await generateText({
        model: anthropic(config.modelName || 'claude-3-haiku-20240307'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a browser automation assistant. Your task is to determine the next action to take based on the page content.

User's goal: ${userIntent}

Previous actions: ${previousActions.length > 0 ? previousActions.join('\n') : 'None'}

Page dimensions: ${screenshot.dimensions.width / screenshot.dimensions.scalingFactor}x${screenshot.dimensions.height / screenshot.dimensions.scalingFactor}

<layout>
  ${pageLayout}
</layout>

Determine the best next action to take to achieve the user's goal. Return ONLY the command to execute in one of these formats:
- click [x,y] # Brief reason
- type [x,y] 'text' # Brief reason
- press Key # Brief reason
- scroll direction # Brief reason

Ensure coordinates are visible on screen and the rationale is brief but clear.`
              },
              {
                type: 'image',
                image: screenshot.buffer,
                mimeType: 'image/png'
              }
            ]
          }
        ]
      });

      return text;
    } catch (error) {
      console.error('Error getting next action:', error);
      throw new Error(`Failed to get next action: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get configuration from Chrome storage
  private async getConfig(): Promise<{ apiKey: string; modelName?: string }> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'modelName'], (result) => {
        resolve({
          apiKey: result.apiKey || '',
          modelName: result.modelName || ''
        });
      });
    });
  }
}
