import { ReactAgent } from "./browser-agent/reactAgent";
import { CommandExecutorTool } from "./browser-agent/tools/commandExecutorTool";
import { NextActionTool } from "./browser-agent/tools/nextActionTool";

// Agent instance
let agent: ReactAgent | null = null;
let isAgentRunning = false;
let apiKey = '';

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) {
      apiKey = result.apiKey;
      // Initialize the agent once we have the API key
      initializeAgent();
    }
  });
}

// Initialize the agent with settings
function initializeAgent() {
  if (!apiKey) {
    console.warn('API key not set. Agent will not be initialized.');
    return;
  }
  
  try {
    agent = new ReactAgent({
      apiKey: apiKey,
      maxIterations: 20,
      tools: [
        new NextActionTool(),
        new CommandExecutorTool()
      ]
    });
    
    console.log('Agent initialized successfully');
    chrome.storage.local.set({ agentInitialized: true });
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    chrome.storage.local.set({ agentInitialized: false });
  }
}

// Run the agent with a prompt
async function runAgent(prompt: string, sessionId: string) {
  if (!agent) {
    return { 
      success: false, 
      error: 'Agent not initialized. Please set your API key in the settings.' 
    };
  }
  
  if (isAgentRunning) {
    return { 
      success: false, 
      error: 'Agent is already running. Please wait for the current task to complete.' 
    };
  }
  
  isAgentRunning = true;
  
  // Send initial update
  broadcastMessage({
    action: 'agent_update',
    data: {
      key: 'status',
      value: 'Starting agent processing...',
      sessionId
    }
  });
  
  try {
    await agent.runWithObserver(
      { prompt },
      {
        onUpdate: (update) => {
          // Send updates to client based on the type of update
          if (update.key === 'finalAnswer') {
            broadcastMessage({
              action: 'agent_update',
              data: {
                key: update.key,
                value: update.value,
                data: update.data,
                sessionId
              }
            });
          } else if (update.key === 'thought') {
            broadcastMessage({
              action: 'agent_update',
              data: {
                key: update.key,
                value: update.value,
                data: update.data,
                sessionId
              }
            });
          } else {
            broadcastMessage({
              action: 'agent_update',
              data: {
                key: update.key,
                value: update.value,
                data: update.data || '',
                sessionId
              }
            });
          }

          console.log(`Agent Update (${update.key}): ${update.value}`);
        },
        onError: (error) => {
          // Send errors to client
          broadcastMessage({
            action: 'agent_error',
            data: {
              message: error.message,
              sessionId
            }
          });

          console.error(`Agent Error: ${error.message}`);
        },
        onComplete: (result) => {
          console.log(`Agent completed: ${result.text}`);

          // Send completion message
          broadcastMessage({
            action: 'agent_complete',
            data: {
              result: result,
              sessionId
            }
          });
        }
      }
    );

    return { success: true };
  } catch (error) {
    // Send error if agent processing fails
    broadcastMessage({
      action: 'agent_error',
      data: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        sessionId
      }
    });

    console.error("Error running agent:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  } finally {
    isAgentRunning = false;
  }
}

// Helper function to broadcast messages to all clients
function broadcastMessage(message: any) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Suppress errors when no listeners
  });
}

// Open side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Initialize when the extension is installed/started
chrome.runtime.onInstalled.addListener(() => {
  loadSettings();
});

// Handle messages from clients (sidepanel, popup, content script)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'run_agent') {
    runAgent(message.prompt, message.sessionId || Date.now().toString())
      .then(sendResponse)
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        });
      });
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'check_agent') {
    sendResponse({ 
      initialized: !!agent,
      running: isAgentRunning
    });
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'update_settings') {
    // Update settings
    if (message.data?.apiKey) {
      apiKey = message.data.apiKey;
      chrome.storage.sync.set({ apiKey });
      
      // Reinitialize the agent with new settings
      initializeAgent();
    }
    
    sendResponse({ success: true });
    return true; // Keep the message channel open for async response
  }
});