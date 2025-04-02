import { Command } from "./commandTypes";
import { handleClick, handleDoubleClick, handleMouseMove } from "./mouseCommands";
import { handleType, handleKeyPress } from "./keyboardCommands";
import { handleNavigate, handleBack, handleForward, handleReload } from "./navigationCommands";
import { handleFocus, handleSelect, handleSubmit } from "./elementCommands";
import { handleScroll, handleWait } from "./utilityCommands";
import { showClickAnimation } from "./animationUtils";

/**
 * Execute a browser command
 * @param command The command object to execute
 * @returns A promise that resolves with a log message describing the action
 */
export async function executeCommand(command: Command): Promise<string> {
  console.log('Executing command:', command);
  
  // Show animation for commands that have x,y coordinates
  if ('x' in command && 'y' in command) {
    // @ts-expect-error
    showClickAnimation(command.x, command.y);
  }
  
  switch (command.type) {
    case 'click':
      return handleClick(command);
    case 'doubleclick':
      return handleDoubleClick(command);
    case 'mousemove':
      return handleMouseMove(command);
    case 'type':
      return handleType(command);
    case 'key':
      return handleKeyPress(command);
    case 'scroll':
      return handleScroll(command);
    case 'navigate':
      return handleNavigate(command);
    case 'back':
      return handleBack();
    case 'forward':
      return handleForward();
    case 'reload':
      return handleReload();
    case 'focus':
      return handleFocus(command);
    case 'select':
      return handleSelect(command);
    case 'submit':
      return handleSubmit(command);
    case 'wait':
      return handleWait(command);
    default:
      throw new Error(`Unknown command type: ${(command as any).type}`);
  }
}