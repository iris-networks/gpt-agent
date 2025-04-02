let container: HTMLDivElement | null = null;
let isAgentRunning = false;

// Initialize the UI
function initUI() {
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
function runAgent(prompt: string) {
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

// Execute a command from the agent
function executeCommand(command: string | any): Promise<string> {
  if (!command) return Promise.reject('No command provided');
  
  console.log('Executing command:', command);
  
  try {
    // Handle structured command objects from commandExecutorTool
    if (typeof command === 'object' && command.type) {
      switch (command.type) {
        case 'mousemove':
          // Just move the mouse without clicking
          return Promise.resolve(`Moved pointer to [${command.x},${command.y}]`);
          
        case 'click':
          // If x and y are provided, click at those coordinates
          if (command.x !== undefined && command.y !== undefined) {
            return simulateClick(command.x, command.y, command.button || 1);
          }
          // Otherwise, click at current position with specified button
          return Promise.resolve(`Clicked with button ${command.button || 1}`);
          
        case 'doubleclick':
          if (command.x !== undefined && command.y !== undefined) {
            return simulateDoubleClick(command.x, command.y);
          }
          return Promise.reject('Coordinates required for double click');
          
        case 'mousedown':
          // Not fully implemented yet
          return Promise.resolve(`Mouse down with button ${command.button || 1}`);
          
        case 'mouseup':
          // Not fully implemented yet
          return Promise.resolve(`Mouse up with button ${command.button || 1}`);
          
        case 'type':
          // If x and y are provided, type at those coordinates
          if (command.x !== undefined && command.y !== undefined) {
            return simulateType(command.x, command.y, command.text);
          }
          // Otherwise, we can't type without coordinates
          return Promise.reject('Coordinates required for typing');
          
        case 'key':
          // Handle key presses with the sequence
          return simulateKeyPress(command.sequence);
          
        case 'scroll':
          // Handle scrolling with direction or x,y values
          if (command.direction) {
            return simulateScroll(command.direction);
          } else if (command.y > 0) {
            return simulateScroll('down');
          } else if (command.y < 0) {
            return simulateScroll('up');
          } else if (command.x > 0) {
            return simulateScroll('right');
          } else if (command.x < 0) {
            return simulateScroll('left');
          }
          return Promise.resolve('No scroll direction specified');
          
        case 'navigate':
          return navigateTo(command.url);
          
        case 'back':
          return navigateHistory('back');
          
        case 'forward':
          return navigateHistory('forward');
          
        case 'reload':
          return reloadPage();
          
        case 'focus':
          return focusElement(command.x, command.y);
          
        case 'select':
          return selectElement(command.x, command.y);
          
        case 'submit':
          return submitForm(command.x, command.y);
          
        default:
          return Promise.reject(`Unknown command type: ${command.type}`);
      }
    }
    
    // Handle string commands (legacy format) with regex parsing
    if (typeof command === 'string') {
      // Parse the command
      // Basic format: command [x,y] 'optional text'
      const clickMatch = command.match(/click\s+\[(\d+),(\d+)\]/i);
      const typeMatch = command.match(/type\s+\[(\d+),(\d+)\]\s+'([^']*)'/i);
      const pressMatch = command.match(/press\s+(\w+)/i);
      const scrollMatch = command.match(/scroll\s+(up|down|left|right)/i);
      
      if (clickMatch) {
        // Click command
        const x = parseInt(clickMatch[1]);
        const y = parseInt(clickMatch[2]);
        return simulateClick(x, y);
      } else if (typeMatch) {
        // Type command
        const x = parseInt(typeMatch[1]);
        const y = parseInt(typeMatch[2]);
        const text = typeMatch[3];
        return simulateType(x, y, text);
      } else if (pressMatch) {
        // Press key command
        const key = pressMatch[1];
        return simulateKeyPress(key);
      } else if (scrollMatch) {
        // Scroll command
        const direction = scrollMatch[1];
        return simulateScroll(direction);
      } else {
        // Unknown command
        return Promise.resolve(`Unknown command: ${command}`);
      }
    }
    
    // If we get here, the command format is not recognized
    return Promise.reject(`Unsupported command format: ${typeof command}`);
  } catch (error) {
    return Promise.reject(`Error executing command: ${error}`);
  }
}

// Simulate a click at coordinates with specific button
function simulateClick(x: number, y: number, button: number = 1): Promise<string> {
  return new Promise((resolve) => {
    const element = document.elementFromPoint(x, y);
    
    if (!element) {
      resolve(`No element found at coordinates [${x},${y}]`);
      return;
    }
    
    // Create and dispatch mouse events
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button: button - 1, // 0 = left, 1 = middle, 2 = right
    });
    
    // For right-click, we need to dispatch contextmenu event
    if (button === 3) {
      const contextMenuEvent = new MouseEvent('contextmenu', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 2,
      });
      element.dispatchEvent(contextMenuEvent);
    } else {
      element.dispatchEvent(clickEvent);
    }
    
    resolve(`Clicked element at [${x},${y}] with button ${button}`);
  });
}

// Simulate a double click at coordinates
function simulateDoubleClick(x: number, y: number): Promise<string> {
  return new Promise((resolve) => {
    const element = document.elementFromPoint(x, y);
    
    if (!element) {
      resolve(`No element found at coordinates [${x},${y}]`);
      return;
    }
    
    // Create and dispatch double click event
    const dblClickEvent = new MouseEvent('dblclick', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    
    element.dispatchEvent(dblClickEvent);
    resolve(`Double-clicked element at [${x},${y}]`);
  });
}

// Navigate to a URL
function navigateTo(url: string): Promise<string> {
  return new Promise((resolve) => {
    // Add http:// if not present and not a relative URL
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    
    window.location.href = url;
    resolve(`Navigating to ${url}`);
  });
}

// Navigate history (back/forward)
function navigateHistory(direction: string): Promise<string> {
  return new Promise((resolve) => {
    if (direction === 'back') {
      window.history.back();
      resolve('Navigated back');
    } else if (direction === 'forward') {
      window.history.forward();
      resolve('Navigated forward');
    } else {
      resolve(`Unknown navigation direction: ${direction}`);
    }
  });
}

// Reload the page
function reloadPage(): Promise<string> {
  return new Promise((resolve) => {
    window.location.reload();
    resolve('Reloading page');
  });
}

// Focus an element at coordinates
function focusElement(x: number, y: number): Promise<string> {
  return new Promise((resolve) => {
    const element = document.elementFromPoint(x, y) as HTMLElement;
    
    if (!element) {
      resolve(`No element found at coordinates [${x},${y}]`);
      return;
    }
    
    if (element.focus) {
      element.focus();
      resolve(`Focused element at [${x},${y}]`);
    } else {
      resolve(`Element at [${x},${y}] cannot be focused`);
    }
  });
}

// Select an input element at coordinates
function selectElement(x: number, y: number): Promise<string> {
  return new Promise((resolve) => {
    const element = document.elementFromPoint(x, y) as HTMLInputElement;
    
    if (!element) {
      resolve(`No element found at coordinates [${x},${y}]`);
      return;
    }
    
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.focus();
      element.select();
      resolve(`Selected input at [${x},${y}]`);
    } else {
      resolve(`Element at [${x},${y}] is not an input field`);
    }
  });
}

// Submit a form at coordinates
function submitForm(x: number, y: number): Promise<string> {
  return new Promise((resolve) => {
    const element = document.elementFromPoint(x, y) as HTMLElement;
    
    if (!element) {
      resolve(`No element found at coordinates [${x},${y}]`);
      return;
    }
    
    // Find the closest form
    let form: HTMLFormElement | null = null;
    let currentElement: HTMLElement | null = element;
    
    while (currentElement && !form) {
      if (currentElement instanceof HTMLFormElement) {
        form = currentElement;
      } else {
        currentElement = currentElement.parentElement;
      }
    }
    
    if (form) {
      // Create and dispatch submit event
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      
      form.dispatchEvent(submitEvent);
      
      // If the event wasn't cancelled, submit the form
      if (!submitEvent.defaultPrevented) {
        form.submit();
      }
      
      resolve(`Submitted form`);
    } else {
      resolve(`No form found for element at [${x},${y}]`);
    }
  });
}

// Simulate typing text
function simulateType(x: number, y: number, text: string): Promise<string> {
  return new Promise((resolve) => {
    const element = document.elementFromPoint(x, y) as HTMLElement;
    
    if (!element) {
      resolve(`No element found at coordinates [${x},${y}]`);
      return;
    }
    
    // Focus the element
    if (element.focus) {
      element.focus();
    }
    
    // If it's an input or textarea, set its value
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = text;
      
      // Create and dispatch input event
      const inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(inputEvent);
      
      // Create and dispatch change event
      const changeEvent = new Event('change', {
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(changeEvent);
      
      resolve(`Typed "${text}" into element at [${x},${y}]`);
    } else {
      resolve(`Element at [${x},${y}] is not an input field`);
    }
  });
}

// Simulate pressing a key
function simulateKeyPress(key: string): Promise<string> {
  return new Promise((resolve) => {
    // Create and dispatch keyboard events
    const keydownEvent = new KeyboardEvent('keydown', {
      key: key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(keydownEvent);
    
    const keyupEvent = new KeyboardEvent('keyup', {
      key: key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(keyupEvent);
    
    resolve(`Pressed key "${key}"`);
  });
}

// Simulate scrolling
function simulateScroll(direction: string): Promise<string> {
  return new Promise((resolve) => {
    const scrollAmount = 300; // pixels
    
    switch (direction.toLowerCase()) {
      case 'up':
        window.scrollBy(0, -scrollAmount);
        break;
      case 'down':
        window.scrollBy(0, scrollAmount);
        break;
      case 'left':
        window.scrollBy(-scrollAmount, 0);
        break;
      case 'right':
        window.scrollBy(scrollAmount, 0);
        break;
    }
    
    resolve(`Scrolled ${direction}`);
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!container) return;
  
  const statusElement = container.querySelector('#zenobia-status') as HTMLDivElement;
  const logElement = container.querySelector('#zenobia-log') as HTMLDivElement;
  
  if (message.action === 'agent_update') {
    // Add update to log
    const updateLog = document.createElement('div');
    updateLog.innerHTML = `<span style="color: #4285f4;">${message.data.key}:</span> ${message.data.value}`;
    updateLog.style.marginBottom = '5px';
    logElement.appendChild(updateLog);
    logElement.scrollTop = logElement.scrollHeight;
  }
  
  if (message.action === 'agent_complete') {
    // Update status
    statusElement.innerText = 'Completed';
    statusElement.style.backgroundColor = '#4caf50';
    isAgentRunning = false;
    
    // Add completion to log
    const completeLog = document.createElement('div');
    completeLog.innerHTML = `<strong>Result:</strong> ${message.data.result.text}`;
    completeLog.style.marginBottom = '5px';
    completeLog.style.fontWeight = 'bold';
    logElement.appendChild(completeLog);
    logElement.scrollTop = logElement.scrollHeight;
  }
  
  if (message.action === 'agent_error') {
    // Update status
    statusElement.innerText = 'Error';
    statusElement.style.backgroundColor = '#ff5252';
    isAgentRunning = false;
    
    // Add error to log
    const errorLog = document.createElement('div');
    errorLog.innerHTML = `<strong style="color: #ff5252;">Error:</strong> ${message.data.message}`;
    errorLog.style.marginBottom = '5px';
    logElement.appendChild(errorLog);
    logElement.scrollTop = logElement.scrollHeight;
  }
  
  if (message.action === 'execute_command') {
    executeCommand(message.command)
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((error) => {
        sendResponse({ success: false, error });
      });
    return true; // Keep the message channel open for async response
  }
});

// Initialize when the content script runs
initUI();