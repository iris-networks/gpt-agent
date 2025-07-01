import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';

export class TaskCompletionChecker {
    /**
     * Check if the task has been completed based on the user input and cumulative summary
     */
    async checkTaskCompletion(userInput: string, cumulativeSummary: string, screenshot?: string) {
        try {
            const completionCheck = await generateObject({
                model: google('gemini-2.5-flash'),
                prompt: `Analyze whether the given task has been completed based on the actions performed.

                Original task: ${userInput}
                
                Summary of actions performed:
                ${cumulativeSummary}
                
                Determine if the task has been successfully completed. Consider:
                1. Has the main objective been achieved?
                2. Are there any obvious missing steps?
                3. Have any error conditions been resolved?
                4. Does the summary indicate successful completion?
                
                Important: If the last action was a GUI action or navigation event, use the screenshot to verify it has been completed successfully.
                
                Be conservative - only mark as completed if there's clear evidence of success.`,
                schema: z.object({
                    isCompleted: z.boolean().describe('Whether the task has been completed'),
                    reason: z.string().describe('Brief description of the reasoning behind the conclusion')
                })
            });
            

            console.log("[checkTaskCompletion]", completionCheck.object)
            return completionCheck.object;
        } catch (error) {
            console.error('Error checking task completion:', error);
            return { isCompleted: false, reason: 'Could not determine completion status' };
        }
    }
}