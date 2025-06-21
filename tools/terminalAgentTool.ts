import { tool, generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { spawn } from 'child_process';
import * as os from 'os';
import { EventEmitter } from 'events';

let terminal: ReturnType<typeof spawn> | null = null;
let isInitialized = false;
const terminalEvents = new EventEmitter();

function getTerminal(): ReturnType<typeof spawn> {
  if (!terminal) {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    terminal = spawn(shell, [], {
      cwd: process.env.HOME || os.homedir(),
      env: process.env,
      stdio: 'pipe'
    });

    terminal.stdout.setEncoding('utf8');
    terminal.stderr.setEncoding('utf8');

    terminal.stdout.on('data', (data) => {
      terminalEvents.emit('data', data.toString());
    });

    terminal.stderr.on('data', (data) => {
      terminalEvents.emit('data', data.toString());
    });

    terminal.on('close', () => {
      terminal = null;
    });

    initializeTerminalAsAbcUser();
    isInitialized = true;
  }

  return terminal;
}

function initializeTerminalAsAbcUser() {
  const term = getTerminal();

  // Preserve working directory before switching user
  term.stdin.write('export CURRENT_DIR=$(pwd)\n');

  const cmds = [
    'whoami',
    `if [ "$(whoami)" != "abc" ]; then su - abc -c "cd $CURRENT_DIR 2>/dev/null || cd ~; exec bash"; fi`
  ];

  cmds.forEach((cmd, i) => {
    setTimeout(() => {
      term.stdin.write(`${cmd}\n`);
    }, i * 300);
  });
}

async function executeInTerminal(command: string): Promise<{ output: string; error: string | null; success: boolean }> {
  return new Promise((resolve) => {
    const term = getTerminal();
    let output = '';
    const startMarker = `CMD_START_${Date.now()}`;
    const endMarker = `CMD_END_${Date.now()}`;

    const handler = (data: string) => {
      output += data;
    };

    terminalEvents.on('data', handler);

    term.stdin.write(`echo ${startMarker}\n`);
    term.stdin.write(`${command}\n`);
    term.stdin.write(`echo ${endMarker}\n`);

    setTimeout(() => {
      terminalEvents.removeListener('data', handler);
      const lines = output.split('\n');
      const startIdx = lines.findIndex(l => l.includes(startMarker));
      const endIdx = lines.findIndex(l => l.includes(endMarker));
      const result = startIdx >= 0 && endIdx >= 0 ? lines.slice(startIdx + 1, endIdx).join('\n') : output;

      resolve({
        success: true,
        output: result.trim(),
        error: null
      });
    }, 1000);
  });
}

const executeCommandTool = tool({
  description: 'Execute a single terminal command',
  parameters: z.object({
    command: z.string().describe('The terminal command to execute')
  }),
  execute: async ({ command }) => {
    if (/(sudo|su |^su|rm -rf|doas|pkexec)/.test(command)) {
      return {
        success: false,
        error: 'Security restriction: command not allowed',
        output: 'Command execution blocked for security reasons'
      };
    }

    const result = await executeInTerminal(command);
    const whoami = await executeInTerminal('whoami');

    if (whoami.output.trim() !== 'abc') {
      terminal?.stdin.write('exit\n');
      initializeTerminalAsAbcUser();

      // Switch to abc user and retry the command instead of throwing error
      const retryResult = await executeInTerminal(command);
      return {
        ...retryResult,
        output: `Switched to abc user. ${retryResult.output}`
      };
    }

    return result;
  }
});

export const terminalAgentTool = tool({
  description: 'Execute complex terminal operations by breaking them into steps',
  parameters: z.object({
    task: z.string().describe("What is the task that this agent needs to perform using the terminal in natural language."),
    maxSteps: z.number().optional().default(3)
  }),
  execute: async ({ task, maxSteps }) => {
    if (!isInitialized) {
      initializeTerminalAsAbcUser();
      isInitialized = true;
    }

    const { text, steps, toolCalls, toolResults } = await generateText({
      model: anthropic('claude-3-5-haiku-latest'),
      system: `You are a terminal expert. You generate a plan of action and can then keep using the tools to perform the task that you get from user`,
      prompt: task,
      tools: { execute: executeCommandTool },
      maxSteps
    });

    const executedCommands = (steps || []).flatMap(step => {
      return (step.toolCalls || []).map((call, i) => ({
        output: step.toolResults?.[i]?.result?.output || '',
        error: step.toolResults?.[i]?.result?.error || null,
        success: step.toolResults?.[i]?.result?.success || false
      }));
    });

    return {
      summary: text,
      executedCommands
    };
  }
});