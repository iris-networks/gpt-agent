// Message handling functionality for the Zenobia agent

import { executeCommand } from './commands';
import { 
  initUI, 
  updateAgentStatus, 
  addLogMessage, 
  setAgentRunning, 
  getContainer 
} from './ui';

// Initialize message listeners
export function initMessageListeners(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle ping to check if content script is loaded and ready
    if (message.action === 'ping') {
      sendResponse({ action: 'pong' });
      return true; // Keep the message channel open for the response
    }
    
    // Initialize UI if not yet initialized
    if (!getContainer()) {
      initUI();
    }
    
    if (!getContainer()) {
      console.error('Container initialization failed');
      sendResponse({ success: false, error: 'Content script UI not initialized' });
      return true;
    }
    
    if (message.action === 'agent_update') {
      // Add update to log
      addLogMessage(`<span style="color: #4285f4;">${message.data.key}:</span> ${message.data.value}`);
    }
    
    if (message.action === 'agent_complete') {
      // Update status
      updateAgentStatus('Completed', '#4caf50');
      setAgentRunning(false);
      
      // Add completion to log
      addLogMessage(`<strong>Result:</strong> ${message.data.result.text}`, false);
    }
    
    if (message.action === 'agent_error') {
      // Update status
      updateAgentStatus('Error', '#ff5252');
      setAgentRunning(false);
      
      // Add error to log
      addLogMessage(message.data.message, true);
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