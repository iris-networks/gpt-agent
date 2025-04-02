import { KeyPressCommand, TypeCommand } from "./commandTypes";

/**
 * Calculate a realistic typing delay based on text length and typing speed
 * @param text The text being typed
 * @returns Delay in milliseconds
 */
function calculateTypingDelay(text: string): number {
  if (!text || text.length === 0) return 300; // Default minimum delay
  
  // Base parameters
  const avgCharsPerMinute = 250; // Average typing speed (adjusted for web forms)
  const msPerChar = 60000 / avgCharsPerMinute; // Convert to ms per character
  const thinkingTime = 500; // Additional thinking time in milliseconds
  
  // Additional time for longer input to account for "review" time
  const reviewFactor = Math.min(1, text.length / 50); // Up to 100% extra for 50+ chars
  const reviewTime = 1000 * reviewFactor; // Up to 1000ms additional review time
  
  // Calculate total delay
  let delay = (text.length * msPerChar) + thinkingTime + reviewTime;
  
  // Add some randomness (±15%)
  const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
  delay = delay * randomFactor;
  
  // Add a minimum delay for very short text
  return Math.max(300, Math.round(delay));
}

/**
 * Type text into the active element or at specified coordinates
 */
export async function handleType(command: TypeCommand): Promise<string> {
  const { text, x, y } = command;
  
  // Extract text content without any Enter characters for normal typing
  // We'll handle Enter keypresses separately
  const textWithoutEnter = text.replace(/[\r\n]/g, '');
  const containsEnter = text.includes('\n') || text.includes('\r');
  
  // If coordinates are provided, click at those coordinates first
  if (x !== undefined && y !== undefined) {
    // Find element at coordinates
    const element = document.elementFromPoint(x, y);
    if (!element) {
      throw new Error(`No element found at coordinates (${x}, ${y})`);
    }
    
    // First, focus the element if it's focusable
    if (element instanceof HTMLElement) {
      element.focus();
    }
    
    // Get screen coordinates for more accurate simulation
    const screenX = window.screenX + x;
    const screenY = window.screenY + y;
    
    // Create detailed mouse events
    const mouseEventOptions: MouseEventInit = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      screenX: screenX,
      screenY: screenY,
      button: 0,
      buttons: 1,
      detail: 1
    };
    
    // Simulate mouse events for clicking at exact coordinates
    const clickEvents = ['mousedown', 'mouseup', 'click'];
    for (const eventType of clickEvents) {
      const clickEvent = new MouseEvent(eventType, mouseEventOptions);
      element.dispatchEvent(clickEvent);
    }
    
    // Direct element.click() as fallback
    if (element instanceof HTMLElement) {
      try {
        element.click();
      } catch (err) {
        console.warn('Direct click() failed:', err);
      }
    }
    
    // Additional verification to ensure an input element is selected
    if (!(document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement || 
          document.activeElement?.isContentEditable)) {
      console.warn('Clicked element is not a text input element, typing may not work as expected');
    }
    
    // Small delay after click before typing begins
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // First, type all characters except for Enter
  const typeCharacters = async (): Promise<void> => {
    for (let i = 0; i < textWithoutEnter.length; i++) {
      const char = textWithoutEnter[i];
      
      // For special keys like Tab, etc.
      let keyCode = char.charCodeAt(0);
      let keyName = char;
      let code = `Key${char.toUpperCase()}`;
      
      // Handle special keys (but not Enter)
      if (char === '\t') {
        keyName = 'Tab';
        code = 'Tab';
        keyCode = 9;
      } else if (char === ' ') {
        code = 'Space';
        keyCode = 32;
      }
      
      // Create keyboard events for the character
      const keyDown = new KeyboardEvent('keydown', {
        key: keyName,
        code: code,
        bubbles: true,
        cancelable: true,
        keyCode: keyCode
      });
      
      const keyPress = new KeyboardEvent('keypress', {
        key: keyName,
        code: code,
        bubbles: true,
        cancelable: true,
        keyCode: keyCode
      });
      
      const keyUp = new KeyboardEvent('keyup', {
        key: keyName,
        code: code,
        bubbles: true,
        cancelable: true,
        keyCode: keyCode
      });
      
      // Dispatch events to the active element
      document.activeElement?.dispatchEvent(keyDown);
      document.activeElement?.dispatchEvent(keyPress);
      
      // Special handling for contentEditable elements
      if (document.activeElement?.isContentEditable) {
        // Insert text at cursor position in contentEditable
        document.execCommand('insertText', false, char);
      } 
      // Special handling for input/textarea elements
      else if (document.activeElement instanceof HTMLInputElement || 
               document.activeElement instanceof HTMLTextAreaElement) {
        // Create and dispatch input event
        const inputEvent = new InputEvent('input', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true
        });
        document.activeElement.dispatchEvent(inputEvent);
        
        // Direct manipulation for cases where events don't work
        try {
          const input = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
          const start = input.selectionStart || 0;
          const end = input.selectionEnd || 0;
          const value = input.value;
          
          input.value = value.substring(0, start) + char + value.substring(end);
          input.selectionStart = input.selectionEnd = start + 1;
        } catch (e) {
          console.warn('Failed to directly manipulate input value:', e);
        }
      }
      
      document.activeElement?.dispatchEvent(keyUp);
      
      // Add a small random delay to simulate human typing (40-120ms)
      const delay = Math.floor(Math.random() * 80) + 40;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Trigger a change event after all typing is complete
    if (document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement) {
      const changeEvent = new Event('change', { bubbles: true });
      document.activeElement.dispatchEvent(changeEvent);
    }
  };
  
  // Execute typing without Enter keys
  await typeCharacters();
  
  // Wait an appropriate amount of time before pressing Enter
  if (containsEnter) {
    // Calculate realistic typing delay based on text length and typing speed
    // Average typing speed is ~200-300ms per character (including thinking)
    const typingDelay = calculateTypingDelay(textWithoutEnter);
    console.log(`Calculated typing delay: ${typingDelay}ms for ${textWithoutEnter.length} characters`);
    
    // Wait for the calculated delay before pressing Enter
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    
    // Create Enter key events
    const enterKeyDown = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
      keyCode: 13
    });
    
    const enterKeyPress = new KeyboardEvent('keypress', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
      keyCode: 13
    });
    
    const enterKeyUp = new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
      keyCode: 13
    });
    
    // Press Enter key
    document.activeElement?.dispatchEvent(enterKeyDown);
    document.activeElement?.dispatchEvent(enterKeyPress);
    
    // For input/textarea elements, submit the form if possible
    if (document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement) {
      
      // Try to find and submit the parent form
      const form = document.activeElement.form;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        const isDefaultPrevented = !form.dispatchEvent(submitEvent);
        
        if (!isDefaultPrevented) {
          try {
            form.submit();
          } catch (e) {
            console.warn('Form submission failed:', e);
          }
        }
      }
    }
    // For contentEditable, insert a newline
    else if (document.activeElement?.isContentEditable) {
      document.execCommand('insertText', false, '\n');
    }
    
    document.activeElement?.dispatchEvent(enterKeyUp);
    
    // Add a delay after Enter
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return `Typed "${text}" at ${x !== undefined && y !== undefined ? `coordinates (${x}, ${y})` : 'the current position'}`;
}

/**
 * Simulate keyboard key presses
 */
export async function handleKeyPress(command: KeyPressCommand): Promise<string> {
  const { sequence, isMac } = command;
  
  // Parse the key sequence (e.g., "Enter", "Tab", "ctrl+a", "shift+ArrowRight")
  const parts = sequence.split('+');
  const key = parts.pop() || '';
  
  // Map common key names to their codes
  const keyCodeMap: Record<string, { code: string, keyCode: number }> = {
    'enter': { code: 'Enter', keyCode: 13 },
    'tab': { code: 'Tab', keyCode: 9 },
    'escape': { code: 'Escape', keyCode: 27 },
    'esc': { code: 'Escape', keyCode: 27 },
    'space': { code: 'Space', keyCode: 32 },
    'backspace': { code: 'Backspace', keyCode: 8 },
    'delete': { code: 'Delete', keyCode: 46 },
    'arrowup': { code: 'ArrowUp', keyCode: 38 },
    'arrowdown': { code: 'ArrowDown', keyCode: 40 },
    'arrowleft': { code: 'ArrowLeft', keyCode: 37 },
    'arrowright': { code: 'ArrowRight', keyCode: 39 },
    'home': { code: 'Home', keyCode: 36 },
    'end': { code: 'End', keyCode: 35 },
    'pageup': { code: 'PageUp', keyCode: 33 },
    'pagedown': { code: 'PageDown', keyCode: 34 }
  };
  
  // Find the key info
  const keyLower = key.toLowerCase();
  const keyInfo = keyCodeMap[keyLower] || {
    code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
    keyCode: key.length === 1 ? key.charCodeAt(0) : 0
  };
  
  // Handle standard modifiers
  const options: KeyboardEventInit = {
    bubbles: true,
    cancelable: true,
    key: keyLower in keyCodeMap ? key.charAt(0).toUpperCase() + key.slice(1) : key,
    code: keyInfo.code,
    keyCode: keyInfo.keyCode,
    charCode: keyInfo.keyCode
  };
  
  // Add modifier keys
  if (parts.includes('ctrl') || (parts.includes('cmd') && !isMac)) options.ctrlKey = true;
  if (parts.includes('alt') || parts.includes('option')) options.altKey = true;
  if (parts.includes('shift')) options.shiftKey = true;
  if (parts.includes('meta') || (parts.includes('cmd') && isMac)) options.metaKey = true;
  
  // Create and dispatch keyboard events
  const keyDown = new KeyboardEvent('keydown', options);
  const keyPress = new KeyboardEvent('keypress', options);
  const keyUp = new KeyboardEvent('keyup', options);
  
  // Handle special cases (like shortcuts)
  if (options.ctrlKey || options.altKey || options.metaKey) {
    // Handle common keyboard shortcuts
    if (key.toLowerCase() === 'a' && (options.ctrlKey || options.metaKey)) {
      // Select all (Ctrl+A or Cmd+A)
      if (document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement) {
        document.activeElement.select();
      } else if (document.activeElement?.isContentEditable) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(document.activeElement);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // Try to select all content in the document
        document.execCommand('selectAll', false);
      }
    } else if (key.toLowerCase() === 'c' && (options.ctrlKey || options.metaKey)) {
      // Copy (Ctrl+C or Cmd+C)
      document.execCommand('copy', false);
    } else if (key.toLowerCase() === 'v' && (options.ctrlKey || options.metaKey)) {
      // Paste (Ctrl+V or Cmd+V) - can't simulate actual paste with contents
      document.execCommand('paste', false);
    } else if (key.toLowerCase() === 'x' && (options.ctrlKey || options.metaKey)) {
      // Cut (Ctrl+X or Cmd+X)
      document.execCommand('cut', false);
    }
  }
  
  // Dispatch the events to the active element
  if (document.activeElement) {
    document.activeElement.dispatchEvent(keyDown);
    
    // KeyPress event is not sent for navigation keys
    if (!(key.toLowerCase() in keyCodeMap && 
          ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'home', 'end', 'pageup', 'pagedown'].includes(key.toLowerCase()))) {
      document.activeElement.dispatchEvent(keyPress);
    }
    
    document.activeElement.dispatchEvent(keyUp);
  } else {
    // If no element is focused, dispatch to document
    document.dispatchEvent(keyDown);
    
    if (!(key.toLowerCase() in keyCodeMap && 
          ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'home', 'end', 'pageup', 'pagedown'].includes(key.toLowerCase()))) {
      document.dispatchEvent(keyPress);
    }
    
    document.dispatchEvent(keyUp);
  }
  
  return `Pressed key: ${sequence}`;
}