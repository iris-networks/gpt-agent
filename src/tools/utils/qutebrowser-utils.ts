import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);

export class QutebrowserUtils {
    private static readonly COMMAND_TIMEOUT_MS = 30000;
    // Note: It's good practice to have this configurable or derived, but hardcoding for simplicity here.
    private static readonly BASEDIR = '/config/.local/share/qutebrowser';

    /**
     * Launches the qutebrowser application as a detached background process.
     * This is a "fire and forget" operation. The caller should add a delay
     * after calling this to allow the browser to initialize.
     */
    static async launchQutebrowser(): Promise<void> {
        const isMac = platform() === 'darwin';
        const command = 'qutebrowser';
        const args: string[] = isMac ? [] : ['--basedir', this.BASEDIR];
        const cwd = isMac ? undefined : '/config';

        const env: NodeJS.ProcessEnv = isMac ? process.env : {
            ...process.env,
            DISPLAY: ':1',
            // Set a fallback for XDG_RUNTIME_DIR if not present, especially for containerized environments
            XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
        };

        console.log(`[QuteBrowserAgent] Launching qutebrowser with command: '${command} ${args.join(' ')}'`);

        // We use `spawn` instead of `exec` because `exec` waits for the process to exit,
        // which is not what we want for launching a long-running application.
        const child: ChildProcess = spawn(command, args, {
            // `detached: true` allows the child process to continue running even if the parent exits.
            detached: true,
            // `stdio: 'ignore'` prevents the parent from waiting for the child's I/O streams to close.
            stdio: 'ignore',
            env: env,
            cwd: cwd
        });

        // `unref()` allows the parent Node.js script to exit independently of the child process.
        // Without this, the parent would wait for the child to exit.
        child.unref();

        // There's no need to wait here; the caller is responsible for the post-launch delay.
        return Promise.resolve();
    }


    static SYSTEM_PROMPT = `You are an expert qutebrowser automation agent. Your goal is to complete the user's task by interacting with a web browser.

**About qutebrowser:**
qutebrowser is a keyboard-focused web browser with a minimalist GUI. You interact with it not by clicking, but by issuing commands, much like a command-line interface. Your primary tools are commands to navigate, get 'hints' to identify clickable elements, and then 'follow' those hints to click them. **Hints will always be numerical.**

**Your Operating Loop:**
1.  **Analyze the current state** (based on the user's request and the latest screenshot).
2.  **Formulate a plan** which consists of a 'thought' and a sequence of 'steps' (commands).
3.  **Output the plan** as a single JSON object.

Your plan will be executed, a new screenshot will be taken, and then you will start the loop again.

**JSON Output Format:**
You MUST respond with a JSON object with the following structure.
\`\`\`json
{
  "action": "ACTION_NAME",
  "thought": "Your detailed reasoning for the sequence of steps you are about to take. If finishing, this is your final summary.",
  "steps": [
    { "command": ":command_1" },
    { "command": ":command_2" },
    ...
  ]
}
\`\`\`
- \`action\`: (Required) Must be one of \`execute\` or \`finish\`.
- \`thought\`: (Required) Your reasoning. For the \`finish\` action, this will be your final summary.
- \`steps\`: (Conditional) **Required** when \`action\` is \`execute\`. It's an array of command objects.

**Command Chaining Strategy:**
You should chain commands when you can confidently predict the outcome. For example, after activating an input field, you know you can immediately type into it and press enter.

**EXAMPLE of a single turn for "Search Google for 'AI SDK' and click the first result":**

*Initial State: Blank page.*

1.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "First, I need to open Google and then get the hint labels to find the search bar.",
      "steps": [
        { "command": ":open https://google.com" },
        { "command": ":hint" }
      ]
    }
    \`\`\`
    *(Agent executes these, then takes a screenshot showing hint labels)*

*New State: Screenshot shows Google with hint '15' on the search bar.*

2.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "The search bar has the hint '15'. I will follow that hint, type my search query, and press Enter to submit. This is a confident chain of actions.",
      "steps": [
        { "command": ":hint-follow 15" },
        { "command": ":insert-text AI SDK" },
        { "command": ":fake-key <Return>" }
      ]
    }
    \`\`\`
    *(Agent executes these, then takes a screenshot of the search results)*

*New State: Screenshot shows search results.*

3.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "The search results are visible. I need to display hints to click the first result.",
      "steps": [
        { "command": ":hint links" }
      ]
    }
    \`\`\`
    *(Agent executes this, then takes a screenshot showing new hints)*

*New State: Screenshot shows hint '21' on the first search result.*

4.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "The first result has the hint '21'. I will follow it.",
      "steps": [
        { "command": ":hint-follow 21" }
      ]
    }
    \`\`\`
    *(Agent executes this, then takes a screenshot of the final page)*

*New State: Screenshot of the Vercel AI SDK page.*

5.  **Your JSON output:**
    \`\`\`json
    {
      "action": "finish",
      "thought": "I have successfully navigated to Google, searched for 'AI SDK', and clicked the first result, which led to the Vercel AI SDK documentation page. The task is complete."
    }
    \`\`\`

**Available Commands (for the 'command' field):**

**Navigation:**
- \`:open URL\`: Navigate to a specific webpage.
- \`:back\`: Go back.
- \`:forward\`: Go forward.
- \`:reload\`: Refresh the page.

**Page Interaction:**
- \`:hint\`: Display **numerical** labels on all clickable elements. ALWAYS take a screenshot after to see the labels.
- \`:hint links\`: Display **numerical** hints only for links.
- \`:hint-follow NUMBER\`: Click element with the specified numerical label.
- \`:insert-text TEXT\`: Insert text at the cursor (for forms/inputs).
- \`:fake-key <Return>\`: Press Enter.
- \`:fake-key <Escape>\`: Press Escape.
- \`:fake-key <Tab>\`: Press Tab.

**Scrolling:**
- \`:scroll-to-perc PERCENT\`: Scroll to a percentage of the page (0-100).
- \`:scroll-page 0 1\`: Scroll one page down.

**CRITICAL RULES:**
1.  All commands MUST start with a colon \`:\`.
2.  After a plan involving \`:hint\` is executed, the next screenshot will show the **numerical hint labels**. Use these numbers in your next plan.
3.  You can only see the screen via the screenshots provided. You are blind otherwise.
4.  Your final output MUST be an \`action: "finish"\` object. Your \`thought\` for this action is the final summary.

Now, begin the task.`;

    /**
     * Check if qutebrowser is already running
     */
    static async isQutebrowserRunning(): Promise<boolean> {
        try {
            const isMac = platform() === 'darwin';
            // On Mac, we just grep for the process name.
            // On Linux, we grep for the process with our specific basedir to ensure we find the correct instance.
            const grepPattern = isMac ? '[q]utebrowser' : `[q]utebrowser --basedir ${this.BASEDIR}`;

            const { stdout } = await execAsync(`ps aux | grep "${grepPattern}"`, {
                env: isMac ? process.env : {
                    ...process.env,
                    DISPLAY: ':1',
                    XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
                }
            });
            return stdout.trim().length > 0;
        } catch (error) {
            // `exec` throws an error if `grep` finds no matches, which is the expected behavior for "not running".
            return false;
        }
    }

    /**
     * Execute a keyboard command for qutebrowser automation
     */
    static async executeKeyboardCommand(command: string, statusCallback?: (message: string) => void): Promise<string> {
        const isMac = platform() === 'darwin';

        // Qutebrowser commands are sent via the command line interface.
        // On Mac, qutebrowser handles this out of the box.
        // On Linux, we must specify the basedir to send the command to the correct running instance.
        const qutebrowserCommand = command.startsWith(':')
            ? isMac
                ? `qutebrowser "${command}"`
                : `qutebrowser --basedir "${this.BASEDIR}" "${command}"`
            : command;

        console.log(`[QuteBrowserAgent] Executing command: ${qutebrowserCommand}`);
        statusCallback?.(`Executing: ${qutebrowserCommand}`);

        try {
            const { stdout, stderr } = await execAsync(qutebrowserCommand, {
                cwd: isMac ? undefined : '/config',
                timeout: this.COMMAND_TIMEOUT_MS,
                env: isMac ? process.env : {
                    ...process.env,
                    DISPLAY: ':1',
                    XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
                }
            });

            let output = '';
            if (stdout.trim()) output += `STDOUT:\n${stdout.trim()}`;
            if (stderr.trim()) output += `\nSTDERR:\n${stderr.trim()}`;

            const result = output || 'Command executed successfully.';
            console.log(`[QuteBrowserAgent] Command result: ${result}`);
            return result;

        } catch (error: any) {
            const errorMsg = `Error executing command "${qutebrowserCommand}": ${error.message}`;
            console.error(`[QuteBrowserAgent] ${errorMsg}`);
            // Return the error so the model can see what went wrong and potentially correct its course.
            return errorMsg;
        }
    }

    /**
     * Get the basedir path for qutebrowser
     */
    static getBasedir(): string {
        return this.BASEDIR;
    }

    /**
     * Get the command timeout in milliseconds
     */
    static getCommandTimeout(): number {
        return this.COMMAND_TIMEOUT_MS;
    }
}