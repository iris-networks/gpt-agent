import { promisify } from "util";
import { exec as execCallback } from "child_process";
import type { PlatformStrategy } from "../../../interfaces/platform-strategy";

const exec = promisify(execCallback);

/**
 * macOS implementation using AppleScript
 */
export class MacOSStrategy implements PlatformStrategy {
  private async checkDependencies(): Promise<void> {
    try {
      await exec('which cliclick');
    } catch (error) {
      throw new Error('Missing dependency: cliclick (mouse/keyboard control). Install with: brew install cliclick');
    }
  }

  getCommandDescription(): string {
    return "Exact command(s) to be run, to simulate a human performing a task on macOS.";
  }

  getToolDescription(): string {
    return `This tool simulates keyboard and mouse actions primarily using cliclick.
  
  ALLOWED COMMANDS (DO NOT USE ANYTHING OUTSIDE OF THIS LIST):
  1. Opening an app using Spotlight and creating a new tab:
     - Open app via Spotlight: cliclick kd:cmd kp:space ku:cmd w:500 t:"APP_NAME" kp:return
     - Open new tab in current app: cliclick kd:cmd t:"t" ku:cmd
  
  2. Adding entry to input/searchbox:
     - Click on input field: cliclick c:X,Y
     - Type text into field: cliclick t:"YOUR_TEXT"
     - Submit with Enter: cliclick kp:return
     - Combined example: cliclick c:X,Y w:200 t:"search term" kp:return
  
  3. Filling a form:
     - Click on first field: cliclick c:X,Y
     - Type information: cliclick t:"information"
     - Move to next field: cliclick kp:tab
     - Submit form: cliclick c:SUBMIT_X,SUBMIT_Y
     - Combined example: cliclick c:X,Y t:"Name" kp:tab t:"Email" kp:tab t:"Password" c:SUBMIT_X,SUBMIT_Y
  
  OTHER COMMON COMMANDS:
  - Click: cliclick c:X,Y
  - Type text: cliclick t:"text"
  - Press special key: cliclick kp:keyname (return, space, tab, esc, arrow-keys)
  - Press modifier key: cliclick kd:keyname (cmd, alt, ctrl, shift)
  - Release modifier key: cliclick ku:keyname
  - Wait: cliclick w:milliseconds
  - Move cursor: cliclick m:X,Y
  - Double-click: cliclick dc:X,Y
  
  EXAMPLES:
  - Open Chrome and search: cliclick kd:cmd kp:space ku:cmd w:500 t:"chrome" kp:return w:1000 c:450,75 t:"search query" kp:return
  - Fill login form: cliclick c:400,300 t:"username" kp:tab t:"password" c:400,400`;
  }
  

  constructor() {
    this.checkDependencies().catch(error => {
      console.error('Dependency check failed:', error.message);
      process.exit(1);
    });
  }

  async executeCommand(command: string): Promise<string> {
    try {
      const { stdout } = await exec(command);
      return stdout;
    } catch (error) {
      console.error(`Error executing command: ${error}`);
      throw new Error(`Failed to execute command: ${error}`);
    }
  }
}