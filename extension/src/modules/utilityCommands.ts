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
    
    // Get viewport height for scrolling about 75% of a page
    const viewportHeight = window.innerHeight * 0.75;
    const viewportWidth = window.innerWidth * 0.75;
    
    switch (direction.toLowerCase()) {
      case 'up':
        deltaY = -viewportHeight;
        break;
      case 'down':
        deltaY = viewportHeight;
        break;
      case 'left':
        deltaX = -viewportWidth;
        break;
      case 'right':
        deltaX = viewportWidth;
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