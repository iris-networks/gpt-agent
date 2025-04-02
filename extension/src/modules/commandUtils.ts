/**
 * Helper function to describe an element for logging purposes without relying on CSS selectors
 */
export function describeElement(element: Element): string {
  if (!element) return 'unknown element';
  
  const tagName = element.tagName.toLowerCase();
  const textContent = element.textContent?.trim().substring(0, 20);
  const rect = element.getBoundingClientRect();
  
  // Element dimensions for better identification
  const dimensions = `[${Math.round(rect.width)}x${Math.round(rect.height)}]`;
  
  let description = `${tagName} ${dimensions}`;
  
  // Add input type information if applicable
  if (element instanceof HTMLInputElement) {
    description += ` (type=${element.type})`;
  }
  
  // Add button text if it's a button
  if (element instanceof HTMLButtonElement || 
      (element instanceof HTMLElement && element.getAttribute('role') === 'button')) {
    description += ' button';
  }
  
  // Add image info if it's an image
  if (element instanceof HTMLImageElement) {
    description += ' image';
  }
  
  // Add text content if available
  if (textContent) {
    description += ` with text "${textContent}${textContent.length > 20 ? '...' : ''}"`;
  }
  
  return description;
}

/**
 * Calculate a realistic typing delay based on text length and typing speed
 * @param text The text being typed
 * @returns Delay in milliseconds
 */
export function calculateTypingDelay(text: string): number {
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