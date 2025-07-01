import { generateText, ToolCallUnion, ToolResult, ToolSet } from 'ai';
import { groq } from '@ai-sdk/groq';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export class ProgressTracker {
    /**
     * Format tool calls and results for progress tracking
     */
    formatActionsAndResults(toolCalls: ToolCallUnion<ToolSet>[], toolResults: ToolResult<any, any, any>[]): string {
        let formatted = '';

        for (let i = 0; i < toolCalls.length; i++) {
            const call = toolCalls[i];
            const result = toolResults[i];

            formatted += `Tool: ${call.toolName}\n`;
            formatted += `Parameters: ${JSON.stringify(call.args)}\n`;
            formatted += `Result: ${JSON.stringify(result?.result || 'No result')}\n\n`;
        }

        return formatted;
    }

    /**
     * Update progress tracker with completed actions and generate next steps
     */
    async updateProgress(
        toolCalls: ToolCallUnion<ToolSet>[],
        toolResults: ToolResult<any, any, any>[],
        previousProgress?: string
    ): Promise<string> {
        try {
            const formattedActions = this.formatActionsAndResults(toolCalls, toolResults);

            const prompt = previousProgress
                ? `Current progress and todos:
            ${previousProgress}

            New actions completed:
            ${formattedActions}

            Update the progress tracker focusing on:
            - What tasks have been completed?
            - What new tasks or next steps have emerged?
            - What blockers or issues need attention?
            - What state or context needs to be preserved for continuing work?

            Format as a concise progress update that tracks:
            • Completed tasks and their outcomes
            • Current state and context
            • Next steps or remaining todos
            • Any blockers or issues to address

            Keep it focused on actionable progress tracking rather than detailed descriptions.`
                : `Actions completed:
                ${formattedActions}

                Create a concise progress tracker that captures:
                1. What was accomplished in these actions
                2. Current state and important context
                3. Next steps or todos that emerged
                4. Any issues or blockers encountered

                Focus on progress tracking and next steps rather than detailed action descriptions.`;

            const progressResult = await generateText({
                model: google('gemini-2.5-flash'),
                prompt,
            });

            return progressResult.text;
        } catch (error) {
            console.error('Error tracking progress:', error);
            const fallbackText = previousProgress
                ? `${previousProgress}\nCompleted: ${toolCalls[0]?.toolName || 'Unknown action'}. Result: ${JSON.stringify(toolResults[0]?.result || 'Unknown result')}`
                : `Completed: ${toolCalls[0]?.toolName || 'Unknown action'}. Result: ${JSON.stringify(toolResults[0]?.result || 'Unknown result')}`;
            return fallbackText;
        }
    }
}