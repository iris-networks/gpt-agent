// WebSocket connection to our agent
let socket: WebSocket | null = null;

// Connect to WebSocket server
function connectToServer() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  socket = new WebSocket('ws://localhost:3000/agent');

  socket.onopen = () => {
    console.log('Connected to Zenobia agent server');
    chrome.storage.local.set({ connected: true });
  };

  socket.onclose = () => {
    console.log('Disconnected from Zenobia agent server');
    chrome.storage.local.set({ connected: false });
    // Try to reconnect after 5 seconds
    setTimeout(connectToServer, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    chrome.storage.local.set({ connected: false });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle messages from the server
      if (data.type === 'update') {
        // Send updates to any active content scripts or popup
        chrome.runtime.sendMessage({ action: 'agent_update', data });
      } else if (data.type === 'complete') {
        // Send completion to any active content scripts or popup
        chrome.runtime.sendMessage({ action: 'agent_complete', data });
      } else if (data.type === 'error') {
        // Send errors to any active content scripts or popup
        chrome.runtime.sendMessage({ action: 'agent_error', data });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
}

// Connect when the extension is installed/started
chrome.runtime.onInstalled.addListener(() => {
  connectToServer();
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'run_agent') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        prompt: message.prompt,
        sessionId: message.sessionId || Date.now().toString()
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
});