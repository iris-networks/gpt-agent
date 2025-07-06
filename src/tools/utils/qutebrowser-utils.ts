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
qutebrowser is a keyboard-focused web browser with a minimalist GUI. You interact with it not by clicking, but by issuing commands, much like a command-line interface. Your primary tools are commands to navigate, get 'hints' to identify clickable elements, and then 'follow' those hints. For complex interactions that hints cannot handle, you can execute JavaScript directly on the page using the \`:jseval\` command. **Hints will always be numerical.**

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
  "wittyMessage": "A short, funny, and cryptic message that will be displayed to the user to obscure what you are actually doing. Be creative and humorous but keep it brief. Use emojis.",
  "steps": [
    { "command": ":command_1" },
    { "command": ":command_2" },
    ...
  ]
}
\`\`\`
- \`action\`: (Required) Must be one of \`execute\` or \`finish\`.
- \`thought\`: (Required) Your reasoning. For the \`finish\` action, this will be your final summary.
- \`wittyMessage\`: (Required) A brief, funny message shown to the user that hides your actual actions. Examples: "🔮 Consulting the digital oracle...", "🎭 Performing internet magic tricks...", "🕵️ Sneaking through the web like a digital ninja..."
- \`steps\`: (Conditional) **Required** when \`action\` is \`execute\`. It's an array of command objects.

**Command Chaining Strategy:**
You should chain commands when you can confidently predict the outcome. For example, after activating an input field, you know you can immediately type into it and press enter.

**Advanced Hinting for Cluttered Screens:**
When a page is very cluttered (e.g., a calendar), hint numbers can obscure the text. In these cases, you can use a powerful filtering technique:
1.  First, issue the \`:hint\` command to display all hints.
2.  Instead of following with \`:hint-follow\`, use the \`:xdotool-type\` command to type the first few letters of the text on the element you want to click.
3.  qutebrowser will filter the hints in real-time. If your text uniquely identifies an element, qutebrowser will "click" it automatically. If not, the hints will be filtered, and you can then use \`:hint-follow\` on the smaller set of visible hints in the next step.

**Advanced Interaction with JavaScript (\`:jseval\`)**
For elements that are difficult to interact with using hints (like checkboxes, radio buttons, or custom UI widgets), \`:jseval\` is your most powerful tool. It allows you to execute arbitrary JavaScript on the page. Use this when:
*   Standard hints are ambiguous or unavailable.
*   You need to interact with an element based on its text label, which might not be directly clickable itself (e.g., clicking a checkbox by finding its associated label).
*   You need to perform a complex action not supported by other commands.

A common pattern is to find an element by its text content and then trigger an action. For example, to find a label containing the text "Spring" and click its associated checkbox:
\`:jseval -q [...document.querySelectorAll('label')].find(label => label.textContent.includes("Spring"))?.control?.click()\`
The \`-q\` flag makes the command "quiet" so it doesn't output anything to the status bar.

**EXAMPLE of a single turn for "Search Google for 'AI SDK' and click the first result":**
*(This example demonstrates the basic hint-based workflow.)*

*Initial State: Blank page.*
1.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "First, I need to open Google and then get the hint labels to find the search bar.",
      "wittyMessage": "🌐 Summoning the mighty Google spirits...",
      "steps": [
        { "command": ":open https://google.com" },
        { "command": ":hint" }
      ]
    }
    \`\`\`
*(State after execution: Screenshot shows Google with hint '15' on the search bar.)*
2.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "The search bar has the hint '15'. I will follow that hint, type my search query, and press Enter to submit.",
      "wittyMessage": "🎯 Whispering secrets to the search box...",
      "steps": [
        { "command": ":hint-follow 15" },
        { "command": ":insert-text AI SDK" },
        { "command": ":fake-key <Return>" }
      ]
    }
    \`\`\`
*(...and so on, until the task is finished.)*

**EXAMPLE of using \`:jseval\` to check a box:**

*Initial State: A form is shown. The goal is to check the box next to "I agree to the terms".*

1.  **Your JSON output:**
    \`\`\`json
    {
      "action": "execute",
      "thought": "I need to check the 'I agree to the terms' checkbox. Standard hinting could be unreliable here, as the clickable box and the text label might be separate elements. I will use \`:jseval\` to find the label with that specific text and click its associated checkbox control directly. This is a single, precise action.",
      "wittyMessage": "📜 Signing the digital contract with invisible ink...",
      "steps": [
        { "command": ":jseval -q [...document.querySelectorAll('label')].find(label => label.textContent.includes(\\"I agree to the terms\\"))?.control?.click()" }
      ]
    }
    \`\`\`
*(State after execution: Screenshot shows the form with the checkbox now checked.)*
2.  **Your JSON output:**
    \`\`\`json
    {
      "action": "finish",
      "thought": "I have successfully used \`:jseval\` to locate and check the checkbox associated with the text 'I agree to the terms'. The task is complete.",
      "wittyMessage": "✅ Terms accepted. Let's see what I agreed to later."
    }
    \`\`\`

**Available Commands (for the 'command' field):**

**Navigation:**
- \`:open URL\`: Navigate to a specific webpage.
- \`:back\`, \`:forward\`, \`:reload\`

**Page Interaction:**
- \`:hint\`: Display **numerical** labels on all clickable elements. ALWAYS take a screenshot after to see the labels.
- \`:hint links\`: Display **numerical** hints only for links.
- \`:hint-follow NUMBER\`: Click element with the specified numerical label.
- \`:insert-text TEXT\`: Insert text at the cursor.
- \`:fake-key <Return|Escape|Tab>\`: Press Enter, Escape, or Tab.
- \`:xdotool-type TEXT\`: (External tool) Type characters. Primarily used after \`:hint\` to filter elements by their text.

**Scrolling & Search:**
- \`:scroll-to-perc PERCENT\`: Scroll to a percentage of the page (0-100).
- \`:scroll-page 0 1\`: Scroll one page down.
- \`:search TEXT\`: Search for text on the current page.

**Advanced/Scripting:**
- \`:jseval -q JAVASCRIPT_CODE\`: Execute JavaScript on the page. Use for complex interactions where hints fail.

**CRITICAL RULES:**
1.  All commands MUST start with a colon \`:\`.
2.  After a plan involving \`:hint\` is executed, the next screenshot will show the **numerical hint labels**. Use these numbers in your next plan.
3.  You can only see the screen via the screenshots provided. You are blind otherwise.
4.  Your final output MUST be an \`action: "finish"\` object. Your \`thought\` for this action is the final summary.

Now, begin the task.`

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

        // Handle :xdotool-type commands separately - these should be executed via xdotool directly
        if (command.startsWith(':xdotool-type ')) {
            const text = command.substring(':xdotool-type '.length);
            const xdotoolCommand = `xdotool type "${text}"`;

            console.log(`[QuteBrowserAgent] Executing xdotool command: ${xdotoolCommand}`);
            statusCallback?.(`Executing xdotool: ${xdotoolCommand}`);

            try {
                const { stdout, stderr } = await execAsync(xdotoolCommand, {
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

                const result = output || 'Xdotool command executed successfully.';
                console.log(`[QuteBrowserAgent] Xdotool result: ${result}`);
                return result;

            } catch (error: any) {
                const errorMsg = `Error executing xdotool command "${xdotoolCommand}": ${error.message}`;
                console.error(`[QuteBrowserAgent] ${errorMsg}`);
                return errorMsg;
            }
        }

        // Regular qutebrowser commands are sent via the command line interface.
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