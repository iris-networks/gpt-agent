import { tool } from 'ai';
import { z } from 'zod';
import { notify } from 'node-notifier';

/**
 * Tool that waits for human input by pausing execution
 * The tool resolves when the user clicks "resume" in the UI
 */
export const humanLayerTool = tool({
  description: 'If there is a captcha on the screen, or a login page is presented and user is required to enter credentials, it is then that this tool is invoked.',
  parameters: z.object({
    title: z.string().describe('Short title for the human input request (e.g., "Captcha", "Login")'),
    reason: z.string().describe('Clear explanation of why human input is needed (e.g., "Please solve the captcha", "Login required")')
  }),
  execute: async ({ reason, title }) => {
    console.log("humanLayerTool", reason, title);
    await new Promise<void>((resolve) => {
      const notification = notify({
        title: "New notification",
        message: "unable to continue",
        sound: true,
        wait: true,
        type: 'info'
      }, (err, response, metadata) => {
        resolve();
      });

      console.log(notification)
    });
  }
});