// WebSocket connection to our agent
let socket: WebSocket | null = null;

// Default server settings
let serverUrl = 'ws://localhost:3000/agent';
let apiKey = '';

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['apiUrl', 'apiKey'], (result) => {
    if (result.apiUrl) {
      // Convert HTTP URL to WebSocket URL if necessary
      const url = new URL(result.apiUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      serverUrl = `${protocol}//${url.host}/agent`;
    }
    
    if (result.apiKey) {
      apiKey = result.apiKey;
    }
    
    // Reconnect with new settings if we were previously connected
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      connectToServer();
    }
  });
}

// Connect to WebSocket server
function connectToServer() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  socket = new WebSocket(serverUrl);

  socket.onopen = () => {
    console.log('Connected to Zenobia agent server');
    chrome.storage.local.set({ connected: true });
    
    // Broadcast connection status to all clients
    chrome.runtime.sendMessage({ 
      action: 'connection_status', 
      connected: true 
    }).catch(() => {
      // Suppress errors when no listeners
    });
  };

  socket.onclose = () => {
    console.log('Disconnected from Zenobia agent server');
    chrome.storage.local.set({ connected: false });
    
    // Broadcast connection status to all clients
    chrome.runtime.sendMessage({ 
      action: 'connection_status', 
      connected: false 
    }).catch(() => {
      // Suppress errors when no listeners
    });
    
    // Try to reconnect after 5 seconds
    setTimeout(connectToServer, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    chrome.storage.local.set({ connected: false });
    
    // Broadcast connection status to all clients
    chrome.runtime.sendMessage({ 
      action: 'connection_status', 
      connected: false 
    }).catch(() => {
      // Suppress errors when no listeners
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle messages from the server
      if (data.type === 'update') {
        // Send updates to any active clients
        chrome.runtime.sendMessage({ action: 'agent_update', data }).catch(() => {
          // Suppress errors when no listeners
        });
      } else if (data.type === 'complete') {
        // Send completion to any active clients
        chrome.runtime.sendMessage({ action: 'agent_complete', data }).catch(() => {
          // Suppress errors when no listeners
        });
      } else if (data.type === 'error') {
        // Send errors to any active clients
        chrome.runtime.sendMessage({ action: 'agent_error', data }).catch(() => {
          // Suppress errors when no listeners
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
}

// Open side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Connect when the extension is installed/started
chrome.runtime.onInstalled.addListener(() => {
  loadSettings();
  connectToServer();
});

// Handle messages from clients (sidepanel, popup, content script)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'run_agent') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        prompt: message.prompt,
        sessionId: message.sessionId || Date.now().toString(),
        apiKey: apiKey // Include API key with requests
      }));
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Not connected to server' });
      connectToServer(); // Try to reconnect
    }
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'check_connection') {
    const isConnected = socket && socket.readyState === WebSocket.OPEN;
    sendResponse({ connected: isConnected });
    if (!isConnected) {
      connectToServer(); // Try to reconnect
    }
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'update_settings') {
    // Update settings and reconnect
    if (message.data?.apiUrl) {
      try {
        const url = new URL(message.data.apiUrl);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        serverUrl = `${protocol}//${url.host}/agent`;
      } catch (error) {
        console.error('Invalid URL:', error);
      }
    }
    
    if (message.data?.apiKey) {
      apiKey = message.data.apiKey;
    }
    
    // Reconnect with new settings
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
    connectToServer();
    
    sendResponse({ success: true });
    return true; // Keep the message channel open for async response
  }
});