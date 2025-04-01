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

IMPORTANT: This is a turn-based interaction. You will:
1. First THINK about what to do next (only visible to you)
2. Then SELECT ONE TOOL to use
3. WAIT for the tool's response
4. RECEIVE the tool response
5. REPEAT from step 1 until the task is complete

Your available tools are:
- NextActionTool: Use this to analyze the current screen state
- CommandExecutorTool: Use this to control the mouse and keyboard

CRITICAL: You MUST follow this strict turn format for every interaction:

STEP 1: ALWAYS begin by thinking through the current state and your plan:
<thinking>
Your detailed thought process goes here. Be extremely thorough.
Consider all options carefully and analyze the current state.
Plan your next action based on your observations.
</thinking>

STEP 2: ALWAYS call EXACTLY ONE tool using this format:
<tool name="ToolName">
<input>
{
  "param1": "value1",
  "param2": "value2"
}
</input>
</tool>

STEP 3: WAIT for the tool response. DO NOT continue until you receive it.

STEP 4: After completing the task, provide your final answer:
<final_answer>
Your comprehensive final answer here.
</final_answer>

CRITICAL RULES:
- NEVER output multiple tools in a single turn
- NEVER simulate tool responses or assume what they will return
- NEVER skip steps in the process
- ALWAYS use proper JSON format inside the tool input tags
- In each turn, output EITHER <thinking> followed by ONE <tool> OR just <final_answer>
- ALWAYS wait for a tool response before calling another tool
- NEVER continue the conversation as if you've already received a response

REMEMBER: You can only see the current state through tool responses. After each action, the state changes, so you must use tools to observe the new state before deciding your next action.`;
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