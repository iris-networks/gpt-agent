import { promisify } from "util";
import { exec as execCallback } from "child_process";
import type { PlatformStrategy } from "../../../interfaces/platform-strategy";

const exec = promisify(execCallback);

/**
 * Linux implementation using xdotool
 */
export class LinuxStrategy implements PlatformStrategy {
  constructor() {
    // Check if xdotool is installed
    this.checkDependencies().catch(error => {
      console.error('Dependency check failed:', error.message);
      process.exit(1);
    });
  }

  private async checkDependencies(): Promise<void> {
    try {
      await Promise.all([
        exec('which xdotool'),
        exec('which scrot')
      ]);
    } catch (error) {
      throw new Error('Missing required dependencies: xdotool (input control) and scrot (screenshots). Install with: sudo apt-get install xdotool scrot');
    }
  }

  getCommandDescription(): string {
    return 'Core Linux automation commands: '
      + 'xdotool (keyboard/mouse input), '
      + 'scrot (screenshot capture), '
      + 'xdg-open (application launching), '
      + 'xrandr (display settings), '
      + 'pactl (audio control)';
  }
  
  getToolDescription(): string {
    return `This tool simulates keyboard and mouse actions primarily using xdotool.
  
  ALLOWED COMMANDS (DO NOT USE ANYTHING OUTSIDE OF THIS LIST):
  1. Opening an app using the application launcher:
     - Open app via launcher: xdotool key super && sleep 0.5 && xdotool type "APP_NAME" && xdotool key Return
     - Open new tab in current app: xdotool key ctrl+t
  
  2. Adding entry to input/searchbox:
     - Click on input field: xdotool mousemove X Y click 1
     - Type text into field: xdotool type "YOUR_TEXT"
     - Submit with Enter: xdotool key Return
     - Combined example: xdotool mousemove X Y click 1 && sleep 0.2 && xdotool type "search term" && xdotool key Return
  
  3. Filling a form:
     - Click on first field: xdotool mousemove X Y click 1
     - Type information: xdotool type "information"
     - Move to next field: xdotool key Tab
     - Submit form: xdotool mousemove SUBMIT_X SUBMIT_Y click 1
     - Combined example: xdotool mousemove X Y click 1 && xdotool type "Name" && xdotool key Tab && xdotool type "Email" && xdotool key Tab && xdotool type "Password" && xdotool mousemove SUBMIT_X SUBMIT_Y click 1
  
  OTHER COMMON COMMANDS:
  - Click: xdotool mousemove X Y click 1
  - Type text: xdotool type "text"
  - Press special key: xdotool key keyname (Return, space, Tab, Escape, Up, Down, Left, Right)
  - Press modifier key combination: xdotool key ctrl+c (copy), ctrl+v (paste)
  - Wait: sleep seconds
  - Move cursor: xdotool mousemove X Y
  - Double-click: xdotool mousemove X Y click 2
  - Take screenshot: scrot 'screenshot.png'
  
  EXAMPLES:
  - Open Firefox and search: xdotool key super && sleep 0.5 && xdotool type "firefox" && xdotool key Return && sleep 1 && xdotool mousemove 450 75 click 1 && xdotool type "search query" && xdotool key Return
  - Fill login form: xdotool mousemove 400 300 click 1 && xdotool type "username" && xdotool key Tab && xdotool type "password" && xdotool mousemove 400 400 click 1`;
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