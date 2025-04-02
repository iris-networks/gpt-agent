import { ScrollCommand, WaitCommand } from "./commandTypes";

/**
 * Scroll the page or element
 */
export async function handleScroll(command: ScrollCommand): Promise<string> {
  const { direction, x, y } = command;
  
  if (direction) {
    // Handle directional scrolling
    let deltaX = 0;
    let deltaY = 0;
    const scrollAmount = 100; // Default scroll amount
    
    switch (direction.toLowerCase()) {
      case 'up':
        deltaY = -scrollAmount;
        break;
      case 'down':
        deltaY = scrollAmount;
        break;
      case 'left':
        deltaX = -scrollAmount;
        break;
      case 'right':
        deltaX = scrollAmount;
        break;
    }
    
    window.scrollBy({
      top: deltaY,
      left: deltaX,
      behavior: 'smooth'
    });
    
    return `Scrolled ${direction}`;
  } else if (x !== undefined || y !== undefined) {
    // Scroll to specific coordinates
    window.scrollTo({
      top: y || 0,
      left: x || 0,
      behavior: 'smooth'
    });
    
    return `Scrolled to position (${x || 0}, ${y || 0})`;
  }
  
  throw new Error('Invalid scroll command');
}

/**
 * Wait for the specified number of milliseconds
 */
export async function handleWait(command: WaitCommand): Promise<string> {
  const { ms } = command;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Waited for ${ms}ms`);
    }, ms);
  });
}