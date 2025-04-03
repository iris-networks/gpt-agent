import { z } from "zod";
import { Tool } from '../reactAgent';
import { OcularProcessor } from "../../utils/image_processor";
import { NextToolInput } from "../../utils/schemas";

export class NextActionTool implements Tool {
  name = "NextActionTool";
  description = "Finds the next best action to take to meet the user's goal, this will also tell the agent if the last action was successful or not. Always called before making a decision.";
  inputSchema = NextToolInput;

  // Track the last active tab ID and window ID globally
  static lastActiveTabId: number | null = null;
  static lastActiveWindowId: number | null = null;

  // Listen for tab activation and store the last active tab
  static setupTabTracking() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onActivated.addListener((activeInfo) => {
        NextActionTool.lastActiveTabId = activeInfo.tabId;
        NextActionTool.lastActiveWindowId = activeInfo.windowId;
      });
    }
  }

  constructor() {
    // Set up the tab tracking when this tool is instantiated
    NextActionTool.setupTabTracking();
  }

  async execute(input: z.infer<typeof NextToolInput>): Promise<string> {
    const { userIntent, previousActions = '' } = input;
    const screenshot = await this.takeScreenshot();
    
    const processor = new OcularProcessor();
    const result = await processor.getMatchingElement({
      "previousActions": previousActions,
      "userIntent": userIntent,
    }, screenshot.dataURI, {
      "height": screenshot.dimensions.height,
      "width": screenshot.dimensions.width,
      "scalingFactor": screenshot.dimensions.scalingFactor,
    });

    return result + "TabId: " + NextActionTool.lastActiveTabId + `, WindowId: ` + NextActionTool.lastActiveWindowId;
  }

  private async takeScreenshot(): Promise<{
    dataURI: string;
    dimensions: {
      width: number;
      height: number;
      scalingFactor: number;
    };
  }> {
    try {
      // Check if Chrome extension API is available
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('Chrome extension API not available. This tool can only be used within a browser extension context.');
      }

      // Ensure permissions are granted
      await this.ensurePermissions(['tabs', 'activeTab']);

      // Determine which tab to capture
      let tabId = null;
      let windowId = null;

      // First check: use the tracked last active tab if available
      if (NextActionTool.lastActiveTabId) {
        try {
          const tab = await chrome.tabs.get(NextActionTool.lastActiveTabId);
          if (tab) {
            tabId = tab.id;
            windowId = tab.windowId;
            console.log(`Using tracked last active tab: ${tabId}`);
          }
        } catch (e) {
          console.warn('Stored tab no longer exists:', e);
        }
      }

      // Second check: if no valid tab ID yet, find the active tab in the current window
      if (!tabId) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTabs && activeTabs.length > 0 && activeTabs[0].id) {
          tabId = activeTabs[0].id;
          windowId = activeTabs[0].windowId;
          console.log(`Using current active tab: ${tabId}`);
        }
      }

      // Third check: if still no valid tab ID, get any tab from any window
      if (!tabId) {
        const allTabs = await chrome.tabs.query({});
        if (allTabs && allTabs.length > 0 && allTabs[0].id) {
          tabId = allTabs[0].id;
          windowId = allTabs[0].windowId;
          console.log(`Using fallback to any tab: ${tabId}`);
        } else {
          throw new Error('No valid tabs found to capture');
        }
      }

      // Update our tracked values with the tab we're about to capture
      NextActionTool.lastActiveTabId = tabId;
      NextActionTool.lastActiveWindowId = windowId;

      // Get window info for proper dimensions
      const windowInfo = await chrome.windows.get(windowId!);

      // Capture the screenshot
      console.log(`Capturing screenshot of window: ${windowId}`);
      const dataURI = await chrome.tabs.captureVisibleTab(windowId!, { format: 'png' });

      // Get device pixel ratio for scaling
      const devicePixelRatio = await chrome.scripting.executeScript({
        target: { tabId: tabId! },
        func: () => window.devicePixelRatio
      });

      // Get the inner dimensions of the window (viewport size)
      const windowDimensions = await chrome.scripting.executeScript({
        target: { tabId: tabId! },
        func: () => ({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        })
      });

      const scalingFactor = devicePixelRatio[0]?.result || 1.0;
      const innerWidth = windowDimensions[0]?.result?.innerWidth || windowInfo.width;
      const innerHeight = windowDimensions[0]?.result?.innerHeight || windowInfo.height;

      if(!innerWidth || !innerHeight) {
        throw new Error('Window dimensions not available');
      }

      return {
        dataURI,
        dimensions: {
          width: innerWidth,
          height: innerHeight,
          scalingFactor
        }
      };
    } catch (error: any) {
      console.error('Error taking screenshot:', error);
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }
  
  // Ensure we have necessary permissions
  private async ensurePermissions(permissions: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.permissions.contains({ permissions }, (result) => {
        if (result) {
          resolve();
        } else {
          chrome.permissions.request({ permissions }, (granted) => {
            if (granted) {
              resolve();
            } else {
              reject(new Error(`Required permissions not granted: ${permissions.join(', ')}`));
            }
          });
        }
      });
    });
  }
}