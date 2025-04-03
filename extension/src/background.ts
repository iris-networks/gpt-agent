import { ReactAgent, ProviderType } from "./browser-agent/reactAgent";
import { CommandExecutorTool } from "./browser-agent/tools/commandExecutorTool";
import { NextActionTool } from "./browser-agent/tools/nextActionTool";

// Agent instance
let agent: ReactAgent | null = null;
let isAgentRunning = false;
let apiKey = '';
let serverUrl = '';
let providerType: ProviderType = ProviderType.ANTHROPIC;
let modelName = '';

// Default max iterations
let maxIterations = 10;

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['apiKey', 'serverUrl', 'providerType', 'modelName', 'maxIterations'], (result) => {
    if (result.apiKey) {
      apiKey = result.apiKey;
    }
    
    if (result.serverUrl) {
      serverUrl = result.serverUrl;
    }
    
    if (result.providerType) {
      providerType = result.providerType as ProviderType;
    }
    
    if (result.modelName) {
      modelName = result.modelName;
    }
    
    if (result.maxIterations) {
      maxIterations = result.maxIterations;
    }
    
    // Initialize the agent once we have the API key
    if (apiKey) {
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
    const config: any = {
      apiKey: apiKey,
      providerType: providerType,
      maxIterations: maxIterations,
      tools: [
        new NextActionTool(),
        new CommandExecutorTool()
      ]
    };
    
    // Add server URL if available
    if (serverUrl) {
      config.serverUrl = serverUrl;
    }
    
    // Add model name if available
    if (modelName) {
      config.modelName = modelName;
    }
    
    agent = new ReactAgent(config);
    
    console.log('Agent initialized successfully with provider:', providerType);
    chrome.storage.local.set({ 
      agentInitialized: true,
      currentProvider: providerType
    });
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    chrome.storage.local.set({ agentInitialized: false });
  }
}

// Run the agent with a prompt
async function runAgent(prompt: string, sessionId: string) {
  // If agent isn't initialized, try to re-initialize it from stored configs
  if (!agent) {
    await new Promise(resolve => {
      chrome.storage.sync.get(['apiKey', 'serverUrl', 'providerType', 'modelName'], (result) => {
        if (result.apiKey) {
          apiKey = result.apiKey;
          serverUrl = result.serverUrl || '';
          providerType = result.providerType as ProviderType || ProviderType.ANTHROPIC;
          modelName = result.modelName || '';
          
          // Try to initialize
          initializeAgent();
          resolve(null);
        } else {
          resolve(null);
        }
      });
    });
    
    // If still not initialized after attempt, return error
    if (!agent) {
      return { 
        success: false, 
        error: 'Agent not initialized. Please set your API key in the settings.' 
      };
    }
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
          if (update.key === 'iteration') {
            // Handle iteration updates
            broadcastMessage({
              action: 'agent_update',
              data: {
                key: update.key,
                value: update.value,
                data: update.data,
                sessionId
              }
            });
          } else if (update.key === 'finalAnswer') {
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
            
            // Store thought in activity log
            storeActivity(sessionId, 'thought', update.data);
          } else if (update.key === 'toolExecution') {
            broadcastMessage({
              action: 'agent_update',
              data: {
                key: update.key,
                value: update.value,
                data: update.data,
                sessionId
              }
            });
            
            // Store tool call in activity log
            const toolName = update.value.replace('Executing ', '');
            storeActivity(
              sessionId, 
              'tool-call', 
              typeof update.data === 'string' ? update.data : JSON.stringify(update.data, null, 2),
              toolName
            );
          } else if (update.key === 'toolResult') {
            broadcastMessage({
              action: 'agent_update',
              data: {
                key: update.key,
                value: update.value,
                data: update.data,
                sessionId
              }
            });
            
            // Store tool result in activity log
            const toolName = update.value.replace(' returned result', '');
            storeActivity(
              sessionId, 
              'tool-result', 
              typeof update.data === 'string' ? update.data : JSON.stringify(update.data, null, 2),
              toolName
            );
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
          
          // Store final answer in activity log
          storeActivity(sessionId, 'answer', result.text);
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

// Helper function to store activity in local storage
function storeActivity(sessionId: string, type: string, content: string, toolName?: string) {
  const activity: any = {
    type,
    content,
    sessionId,
    timestamp: new Date().toISOString()
  };
  
  if (toolName) {
    activity.toolName = toolName;
  }
  
  chrome.storage.local.get(['activities'], (result) => {
    const activities = result.activities || [];
    activities.push(activity);
    chrome.storage.local.set({ activities: activities.slice(-50) }); // Keep last 50 activities
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

// Handle service worker startup
self.addEventListener('activate', () => {
  loadSettings();
});

// Ensure the agent is reinitialized when the service worker becomes active again
chrome.runtime.onStartup.addListener(() => {
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
    // If agent isn't initialized, try to re-initialize from stored configs
    if (!agent) {
      chrome.storage.sync.get(['apiKey', 'serverUrl', 'providerType', 'modelName'], (result) => {
        if (result.apiKey) {
          apiKey = result.apiKey;
          serverUrl = result.serverUrl || '';
          providerType = result.providerType as ProviderType || ProviderType.ANTHROPIC;
          modelName = result.modelName || '';
          
          // Try to initialize
          initializeAgent();
          
          // Send response after initialization attempt
          sendResponse({ 
            initialized: !!agent,
            running: isAgentRunning
          });
        } else {
          // No API key stored
          sendResponse({ 
            initialized: false,
            running: isAgentRunning
          });
        }
      });
    } else {
      // Agent already initialized
      sendResponse({ 
        initialized: true,
        running: isAgentRunning
      });
    }
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'navigate') {
    // Handle navigation from the background script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.update(tabs[0].id, { url: message.url });
      }
    });
    return true;
  }
  
  if (message.action === 'update_settings') {
    let settingsUpdated = false;
    
    // Update API Key if provided
    if (message.data?.apiKey) {
      apiKey = message.data.apiKey;
      chrome.storage.sync.set({ apiKey });
      settingsUpdated = true;
    }
    
    // Update Server URL if provided
    if (message.data?.serverUrl !== undefined) {
      serverUrl = message.data.serverUrl;
      chrome.storage.sync.set({ serverUrl });
      settingsUpdated = true;
    }
    
    // Update Provider Type if provided
    if (message.data?.providerType !== undefined) {
      providerType = message.data.providerType;
      chrome.storage.sync.set({ providerType });
      settingsUpdated = true;
    }
    
    // Update Model Name if provided
    if (message.data?.modelName !== undefined) {
      modelName = message.data.modelName;
      chrome.storage.sync.set({ modelName });
      settingsUpdated = true;
    }
    
    // Update Max Iterations if provided
    if (message.data?.maxIterations !== undefined) {
      maxIterations = parseInt(message.data.maxIterations);
      chrome.storage.sync.set({ maxIterations });
      settingsUpdated = true;
    }
    
    // Reinitialize the agent with new settings if anything was updated
    if (settingsUpdated) {
      // Ensure we set agent to null first to force reinitialization
      agent = null;
      initializeAgent();
    }
    
    sendResponse({ success: true });
    return true; // Keep the message channel open for async response
  }
});