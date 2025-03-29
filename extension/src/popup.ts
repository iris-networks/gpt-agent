// This script handles the popup UI logic

document.addEventListener('DOMContentLoaded', () => {
  const connectionStatus = document.getElementById('connection-status') as HTMLDivElement;
  const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
  const runButton = document.getElementById('run-button') as HTMLButtonElement;
  const statusText = document.getElementById('status-text') as HTMLDivElement;
  
  // Check connection status when popup opens
  chrome.runtime.sendMessage(
    { action: 'check_connection' },
    (response) => {
      updateConnectionStatus(response?.connected || false);
    }
  );
  
  // Run agent when button is clicked
  runButton.addEventListener('click', () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    statusText.textContent = 'Running...';
    statusText.className = 'status running';
    runButton.disabled = true;
    
    chrome.runtime.sendMessage(
      { action: 'run_agent', prompt },
      (response) => {
        if (!response || !response.success) {
          statusText.textContent = 'Failed to start agent';
          statusText.className = 'status error';
          runButton.disabled = false;
        }
      }
    );
  });
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'agent_update') {
      statusText.textContent = `${message.data.key}: ${message.data.value}`;
      statusText.className = 'status running';
    } else if (message.action === 'agent_complete') {
      statusText.textContent = 'Completed: ' + message.data.result.text;
      statusText.className = 'status success';
      runButton.disabled = false;
    } else if (message.action === 'agent_error') {
      statusText.textContent = 'Error: ' + message.data.message;
      statusText.className = 'status error';
      runButton.disabled = false;
    }
  });
  
  function updateConnectionStatus(connected: boolean) {
    if (connected) {
      connectionStatus.textContent = 'Connected';
      connectionStatus.className = 'connection-status connected';
      runButton.disabled = false;
    } else {
      connectionStatus.textContent = 'Disconnected';
      connectionStatus.className = 'connection-status disconnected';
      runButton.disabled = true;
    }
  }
});