/**
 * Utility functions for visual animations during command execution
 */

/**
 * Shows a red dot animation at the specified coordinates
 * @param x X coordinate
 * @param y Y coordinate
 * @param duration Duration in milliseconds for the animation to stay visible
 */
export function showClickAnimation(x: number, y: number, duration: number = 800): void {
  // Create the dot element
  const dot = document.createElement('div');
  
  // Style the dot
  Object.assign(dot.style, {
    position: 'fixed',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    border: '2px solid rgba(255, 255, 255, 0.7)',
    boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
    zIndex: '9999',
    pointerEvents: 'none', // Make sure it doesn't interfere with clicks
    transform: 'translate(-50%, -50%)', // Center the dot on the coordinates
    left: `${x}px`,
    top: `${y}px`,
    transition: 'all 0.2s ease-out'
  });
  
  // Add a ripple effect
  dot.animate([
    { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1 },
    { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.7 },
    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
  ], {
    duration: 300,
    iterations: 1
  });
  
  // Add to the DOM
  document.body.appendChild(dot);
  
  // Remove after the specified duration
  setTimeout(() => {
    // Fade out animation
    dot.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 200,
      iterations: 1
    }).onfinish = () => {
      document.body.removeChild(dot);
    };
  }, duration);
}