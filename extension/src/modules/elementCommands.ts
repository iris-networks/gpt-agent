import { FocusCommand, SelectCommand, SubmitCommand } from "./commandTypes";
import { describeElement } from "./commandUtils";

/**
 * Focus an element at the specified coordinates
 */
export async function handleFocus(command: FocusCommand): Promise<string> {
  const { x, y } = command;
  const element = document.elementFromPoint(x, y);
  
  if (!element) {
    throw new Error(`No element found at coordinates (${x}, ${y})`);
  }
  
  if (element instanceof HTMLElement) {
    element.focus();
    return `Focused element at (${x}, ${y}): ${describeElement(element)}`;
  }
  
  throw new Error('Element cannot be focused');
}

/**
 * Select an element at the specified coordinates
 */
export async function handleSelect(command: SelectCommand): Promise<string> {
  const { x, y } = command;
  const element = document.elementFromPoint(x, y);
  
  if (!element) {
    throw new Error(`No element found at coordinates (${x}, ${y})`);
  }
  
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.focus();
    element.select();
    return `Selected text in ${describeElement(element)}`;
  }
  
  throw new Error('Element cannot be selected');
}

/**
 * Submit a form or element at the specified coordinates
 * This version simulates pressing Enter on the element, which typically submits forms
 */
export async function handleSubmit(command: SubmitCommand): Promise<string> {
  const { x, y } = command;
  const element = document.elementFromPoint(x, y);
  
  if (!element) {
    throw new Error(`No element found at coordinates (${x}, ${y})`);
  }
  
  // First focus the element
  if (element instanceof HTMLElement) {
    element.focus();
  }
  
  // Simulate pressing Enter which typically submits forms
  const enterKeyEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true
  });
  
  element.dispatchEvent(enterKeyEvent);
  
  // Also try regular click as a fallback for submit buttons
  if (element instanceof HTMLElement) {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    element.dispatchEvent(clickEvent);
  }
  
  return `Submitted element at (${x}, ${y})`;
}