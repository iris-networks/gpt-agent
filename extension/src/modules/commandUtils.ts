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