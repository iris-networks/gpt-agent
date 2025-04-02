// UI-related functionality for the Zenobia agent

let container: HTMLDivElement | null = null;
let isAgentRunning = false;

// Initialize the UI
export function initUI(): void {
  // Check if UI is already initialized
  if (container) return;

  // Create container element
  container = document.createElement('div');
  container.id = 'zenobia-agent-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.backgroundColor = '#ffffff';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  container.style.padding = '15px';
  container.style.zIndex = '9999';
  container.style.display = 'none';
  container.style.width = '300px';
  container.style.maxHeight = '400px';
  container.style.overflowY = 'auto';
  container.style.fontFamily = 'Arial, sans-serif';

  // Add content to container
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
      <h3 style="margin: 0; color: #333;">Zenobia Agent</h3>
      <button id="zenobia-close" style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div id="zenobia-status" style="margin-bottom: 10px; padding: 5px; border-radius: 4px; background-color: #f0f0f0;">
      Ready
    </div>
    <div id="zenobia-log" style="margin-bottom: 10px; max-height: 200px; overflow-y: auto; font-size: 12px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
      <!-- Log messages will be added here -->
    </div>
    <div style="display: flex; flex-direction: column;">
      <textarea id="zenobia-prompt" placeholder="Enter a task for the agent..." style="width: 100%; height: 60px; margin-bottom: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;"></textarea>
      <button id="zenobia-run" style="background-color: #4285f4; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Run Agent</button>
    </div>
  `;

  // Add event listeners
  container.querySelector('#zenobia-close')?.addEventListener('click', () => {
    if (container) container.style.display = 'none';
  });

  container.querySelector('#zenobia-run')?.addEventListener('click', () => {
    const promptInput = container!.querySelector('#zenobia-prompt') as HTMLTextAreaElement;
    const prompt = promptInput.value.trim();
    
    if (prompt && !isAgentRunning) {
      runAgent(prompt);
      promptInput.value = '';
    }
  });

  // Add to DOM
  document.body.appendChild(container);

  // Add floating button to show UI
  const floatingButton = document.createElement('button');
  floatingButton.id = 'zenobia-floating-button';
  floatingButton.textContent = 'Z';
  floatingButton.style.position = 'fixed';
  floatingButton.style.bottom = '20px';
  floatingButton.style.right = '20px';
  floatingButton.style.width = '50px';
  floatingButton.style.height = '50px';
  floatingButton.style.borderRadius = '50%';
  floatingButton.style.backgroundColor = '#4285f4';
  floatingButton.style.color = 'white';
  floatingButton.style.border = 'none';
  floatingButton.style.fontSize = '24px';
  floatingButton.style.cursor = 'pointer';
  floatingButton.style.zIndex = '9998';
  floatingButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';

  floatingButton.addEventListener('click', () => {
    if (container) {
      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
  });

  document.body.appendChild(floatingButton);
}

// Run the agent
export function runAgent(prompt: string): void {
  if (!container) return;
  
  const statusElement = container.querySelector('#zenobia-status') as HTMLDivElement;
  const logElement = container.querySelector('#zenobia-log') as HTMLDivElement;
  
  // Update UI
  isAgentRunning = true;
  statusElement.innerText = 'Running...';
  statusElement.style.backgroundColor = '#ffeb3b';
  
  // Add prompt to log
  const promptLog = document.createElement('div');
  promptLog.innerHTML = `<strong>Prompt:</strong> ${prompt}`;
  promptLog.style.marginBottom = '5px';
  logElement.appendChild(promptLog);
  logElement.scrollTop = logElement.scrollHeight;
  
  // Send message to background script
  chrome.runtime.sendMessage(
    { action: 'run_agent', prompt },
    (response) => {
      if (!response.success) {
        // Handle error
        statusElement.innerText = 'Error: ' + (response.error || 'Failed to run agent');
        statusElement.style.backgroundColor = '#ff5252';
        isAgentRunning = false;
      }
    }
  );
}

// Update UI with agent status
export function updateAgentStatus(status: string, color: string): void {
  if (!container) return;
  
  const statusElement = container.querySelector('#zenobia-status') as HTMLDivElement;
  statusElement.innerText = status;
  statusElement.style.backgroundColor = color;
}

// Add a log message to the UI
export function addLogMessage(message: string, isError: boolean = false): void {
  if (!container) return;
  
  const logElement = container.querySelector('#zenobia-log') as HTMLDivElement;
  const logEntry = document.createElement('div');
  
  if (isError) {
    logEntry.innerHTML = `<strong style="color: #ff5252;">Error:</strong> ${message}`;
  } else {
    logEntry.innerHTML = message;
  }
  
  logEntry.style.marginBottom = '5px';
  logElement.appendChild(logEntry);
  logElement.scrollTop = logElement.scrollHeight;
}

// Set the agent running state
export function setAgentRunning(running: boolean): void {
  isAgentRunning = running;
}

// Get the container element
export function getContainer(): HTMLDivElement | null {
  return container;
}