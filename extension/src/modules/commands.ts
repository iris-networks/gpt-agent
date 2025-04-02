// Command execution functionality for the Zenobia agent

// Execute a command from the agent
export function executeCommand(command: string | any): Promise<string> {
  if (!command) return Promise.reject('No command provided');
  
  console.log('Executing command:', command);
  
  try {
    // Handle structured command objects from commandExecutorTool
    if (typeof command === 'object' && command.type) {
      switch (command.type) {
        case 'mousemove':
          // Just move the mouse without clicking
          return showVisualFeedback(command.x, command.y).then(() => {
            return Promise.resolve(`Moved pointer to [${command.x},${command.y}]`);
          });
          
        case 'click':
          // If x and y are provided, click at those coordinates
          if (command.x !== undefined && command.y !== undefined) {
            return showVisualFeedback(command.x, command.y).then(() => {
              return simulateClick(command.x, command.y, command.button || 1);
            });
          }
          // Otherwise, click at current position with specified button
          return Promise.resolve(`Clicked with button ${command.button || 1}`);
          
        case 'doubleclick':
          if (command.x !== undefined && command.y !== undefined) {
            return showVisualFeedback(command.x, command.y).then(() => {
              return simulateDoubleClick(command.x, command.y);
            });
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
            return showVisualFeedback(command.x, command.y).then(() => {
              return simulateType(command.x, command.y, command.text);
            });
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
          return showVisualFeedback(command.x, command.y).then(() => {
            return focusElement(command.x, command.y);
          });
          
        case 'select':
          return showVisualFeedback(command.x, command.y).then(() => {
            return selectElement(command.x, command.y);
          });
          
        case 'submit':
          return showVisualFeedback(command.x, command.y).then(() => {
            return submitForm(command.x, command.y);
          });
          
        default:
          return Promise.reject(`Unknown command type: ${command.type}`);
      }
    }
    
    // If we get here, the command format is not recognized
    return Promise.reject(`Unsupported command format: ${typeof command}`);
  } catch (error) {
    return Promise.reject(`Error executing command: ${error}`);
  }
}

// Function to show visual feedback before an action
function showVisualFeedback(x: number, y: number, duration: number = 2000): Promise<void> {
  return new Promise((resolve) => {
    // Create a div element for the visual indicator
    const indicator = document.createElement('div');
    
    // Style the indicator as a red circle
    Object.assign(indicator.style, {
      position: 'fixed',
      left: `${x - 15}px`,
      top: `${y - 15}px`,
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
      border: '2px solid red',
      zIndex: '2147483647', // Maximum z-index
      pointerEvents: 'none', // Make sure it doesn't interfere with clicks
      transition: 'all 0.3s ease-in-out',
      boxShadow: '0 0 10px rgba(255, 0, 0, 0.7)'
    });
    
    // Add a pulsing animation
    indicator.animate([
      { transform: 'scale(0.8)', opacity: 0.7 },
      { transform: 'scale(1.2)', opacity: 1 },
      { transform: 'scale(0.8)', opacity: 0.7 }
    ], {
      duration: 1000,
      iterations: Math.ceil(duration / 1000)
    });
    
    // Add the indicator to the DOM
    document.body.appendChild(indicator);
    
    // Remove the indicator after the specified duration
    setTimeout(() => {
      document.body.removeChild(indicator);
      resolve();
    }, duration);
  });
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
    
    // @ts-expect-error
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