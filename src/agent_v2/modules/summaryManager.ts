import { generateText, ToolCallUnion, ToolResult, ToolSet } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export class SummaryManager {
    /**
     * Format tool calls and results for summary generation
     */
    formatToolCallsAndResults(toolCalls: ToolCallUnion<ToolSet>[], toolResults: ToolResult<any, any, any>[]): string {
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
     * Generate initial summary after first iteration
     */
    async generateSummary(toolCalls: ToolCallUnion<ToolSet>[], toolResults: ToolResult<any, any, any>[]): Promise<string> {
        try {
            const formattedActions = this.formatToolCallsAndResults(toolCalls, toolResults);

            const summaryResult = await generateText({
                model: anthropic('claude-sonnet-4-20250514'),
                prompt: `Summarize the following actions and their results concisely:

                Actions taken:
                ${formattedActions}

                Create a brief summary that captures:
                1. What actions were performed
                2. Key outcomes or state changes
                3. Any important information for future iterations

                Do NOT include the original user request or screenshot descriptions.`,
            });

            return summaryResult.text;
        } catch (error) {
            console.error('Error generating summary:', error);
            return `Action performed: ${toolCalls[0]?.toolName || 'Unknown action'}. Result: ${JSON.stringify(toolResults[0]?.result || 'Unknown result')}`;
        }
    }

    /**
     * Update summary with new actions for subsequent iterations
     */
    async updateSummary(
        previousSummary: string,
        toolCalls: ToolCallUnion<ToolSet>[], 
        toolResults: ToolResult<any, any, any>[]
    ): Promise<string> {
        try {
            const formattedActions = this.formatToolCallsAndResults(toolCalls, toolResults);

            const updatedSummary = await generateText({
                model: anthropic('claude-sonnet-4-20250514'),
                prompt: `Summary of past screenstates and actions:
                ${previousSummary}

                New actions taken / tool calls (new changes):
                ${formattedActions}

                Update the summary to include both the previous information and these new actions.
                Make sure to:
                1. Preserve important context from previous iterations
                2. Add details about new actions and their results
                3. Include relevant visual changes mentioned in tool results
                4. Keep the summary concise and focused on key information

                Do NOT include the original user message, screenshot data, or system instructions.`,
            });

            return updatedSummary.text;
        } catch (error) {
            console.error('Error updating summary:', error);
            return `${previousSummary}\nAdditional action: ${toolCalls[0]?.toolName || 'Unknown action'}. Result: ${JSON.stringify(toolResults[0]?.result || 'Unknown result')}`;
        }
    }
}