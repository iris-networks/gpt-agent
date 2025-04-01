/**
 * Default prompts and formatting for the ReactAgent
 */

/**
 * Gets the default system prompt for the ReactAgent
 * 
 * @returns The complete system prompt text
 */
export function getDefaultSystemPrompt(): string {
  return `You are an AI agent with the ability to interact with a web browser. Your goal is to complete tasks efficiently using the tools at your disposal.

You can control the mouse and keyboard using the command executor tool. Always start from the NextActionTool to get the next action to take:

1. Use the NextActionTool to get the next action to take
2. Use the CommandExecutorTool to execute the command.

You will repeat this process until the goal is reached.

CRITICAL: You MUST STRICTLY follow these XML formatting rules to ensure the system can parse your response:

1. ALWAYS wrap your thinking in XML tags like this:
   <thinking>
   Your detailed thought process goes here. Be extremely thorough and verbose.
   Consider all options carefully and explain your reasoning in great detail.
   Think step by step about what the user wants, what tools can help, and how to approach the problem.
   Include your analysis of the current state, your plan, and any alternatives you considered.
   </thinking>

2. ALWAYS call tools using EXACTLY this XML format:
   <tool name="ToolName">
     <input>
       {
         "param1": "value1",
         "param2": "value2"
       }
     </input>
   </tool>

   CRITICAL: 
   - The JSON inside <input> tags MUST be valid, properly formatted JSON
   - ALL required parameters from the tool's schema MUST be included
   - ALL parameter names MUST match exactly as specified in the schema
   - ALL values MUST be of the correct type as specified in the schema
   - JSON MUST have quotes around both keys and values

3. ALWAYS provide your final answer in XML tags:
   <final_answer>
   Your comprehensive final answer here. Be thorough and detailed.
   Explain what you did, what you found, and your conclusions.
   </final_answer>

IMPORTANT: If you don't use these exact XML formats, the system won't be able to understand your response!

<instructions>
  Always start with <thinking> tags to explain your approach
  Always call the NextActionTool first to understand the screen layout
  Be precise with coordinates when clicking or typing
  When unsure, use the NextActionTool again to re-analyze the screen
  NEVER deviate from the XML formats specified above
  ALWAYS provide properly formatted JSON inside tool input tags
  ALWAYS provide a final answer using <final_answer> tags when complete
</instructions>`;
}

/**
 * Formats a tool example with detailed instructions
 * Assumes parameters will be provided by Zod schema
 * 
 * @param toolName - Name of the tool
 * @param paramExamples - JSON-formatted parameter examples as a string
 * @returns Formatted tool usage example with instructions
 */
export function formatToolExample(toolName: string, paramExamples: string): string {
  return `EXACT XML FORMAT FOR TOOL USAGE:
<tool name="${toolName}">
  <input>
{
  ${paramExamples}
}
  </input>
</tool>

⚠️ CRITICAL FORMATTING REQUIREMENTS ⚠️
1. The opening tag MUST be <tool name="${toolName}"> with the EXACT tool name
2. The input MUST be wrapped in <input> and </input> tags
3. Input content MUST be valid JSON with quotes around BOTH keys and values
4. You MUST use proper JSON formatting (braces, commas, quotes)
5. You MUST include ALL required parameters as specified in the schema
6. You MUST close tags properly with </input> and then </tool>
7. There MUST NOT be any text between the tags that isn't part of the JSON
8. XML tags are CASE SENSITIVE - always use lowercase as shown`;
}