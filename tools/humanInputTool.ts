import { tool } from 'ai';
import { z } from 'zod';
import notifier from 'node-notifier';

/**
 * Tool that waits for human input by pausing execution
 * The tool resolves when the user clicks "resume" in the UI
 */
export const humanInputTool = tool({
  description: 'Request human input when the agent cannot proceed independently. Use for captchas, login credentials, or any situation requiring human intervention.',
  parameters: z.object({
    title: z.string().describe('Short title for the human input request (e.g., "Captcha", "Login")'),
    reason: z.string().describe('Clear explanation of why human input is needed (e.g., "Please solve the captcha", "Login required")')
  }),
  execute: async ({ reason, title }) => {
    // Show notification to alert the user
    notifier.notify({
      title,
      message: reason,
      sound: true,
      wait: true
    });
    
    // Create a promise that will be resolved when the user provides input
    return new Promise((resolve) => { 
      notifier.on('click', () => {
        notifier.removeAllListeners();
        resolve({
          success: true,
          message: 'Human interaction completed'
        });
      });
    });
  }
});