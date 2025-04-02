// Message handling functionality for the Zenobia agent

import { executeCommand } from './commands';


// Initialize message listeners
export function initMessageListeners(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle ping to check if content script is loaded and ready
    if (message.action === 'ping') {
      sendResponse({ action: 'pong' });
      return true; // Keep the message channel open for the response
    }
    
    if (message.action === 'execute_command') {
      console.log('Received execute_command action:', message.command);
      executeCommand(message.command)
        .then((result) => {
          console.log('Command executed successfully:', result);
          sendResponse({ success: true, result });
        })
        .catch((error) => {
          console.error('Error executing command:', error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
        });
      return true; // Keep the message channel open for async response
    }
  });
}