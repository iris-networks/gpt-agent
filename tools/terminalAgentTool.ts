import { tool, generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Low-level terminal execution tool
const executeCommandTool = tool({
  description: 'Execute a single terminal command',
  parameters: z.object({
    command: z.string().describe('The terminal command to execute')
  }),
  execute: async ({ command }) => {
    try {
      // Basic security validation
      if (command.includes('rm -rf') || command.includes('sudo')) {
        return { 
          error: 'Potentially dangerous command detected',
          output: 'Command execution blocked for security reasons' 
        };
      }
      
      const { stdout, stderr } = await execAsync(command);
      
      return {
        success: true,
        output: stdout || 'Command executed successfully with no output',
        error: stderr || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: 'Command execution failed'
      };
    }
  }
});

// High-level terminal agent tool
export const terminalAgentTool = tool({
  description: 'Execute complex terminal operations by breaking them into steps',
  parameters: z.object({
    task: z.string().describe('Description of the terminal task to perform'),
    maxSteps: z.number().optional().default(5).describe('Maximum number of steps to execute')
  }),
  execute: async ({ task, maxSteps = 5 }) => {
    console.log('Executing terminal agent tool with task:', task);
    // Create a terminal agent that can use the executeCommandTool
    const { text, steps, toolCalls, toolResults } = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      system: `You are a terminal expert that breaks down complex operations into individual commands.
               You should execute commands one at a time, checking results before proceeding.
               Always use best practices and be careful with sensitive operations.
               Never use dangerous commands like 'rm -rf /' or commands with 'sudo'.`,
      prompt: task,
      tools: { 
        execute: executeCommandTool 
      },
      maxSteps: maxSteps, // This is where we use the maxSteps parameter to control iterations
    });

    // Collect all steps for detailed reporting
    const executedCommands = steps.map(step => {
      const calls = step.toolCalls || [];
      const results = step.toolResults || [];
      
      return calls.map((call, idx) => ({
        command: call.args?.command || 'Unknown command',
        output: results[idx]?.result.output || 'No output',
        error: results[idx]?.result.error || null,
        success: results[idx]?.result.success || false
      }));
    }).flat();

    return {
      summary: text,
      executedCommands,
      stepsExecuted: executedCommands.length,
      maxStepsAllowed: maxSteps
    };
  }
});