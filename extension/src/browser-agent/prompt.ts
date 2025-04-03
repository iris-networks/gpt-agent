/**
 * Default prompts and formatting for the ReactAgent
 */

/**
 * Gets the default system prompt for the ReactAgent
 * 
 * @returns The complete system prompt text
 */
export function getDefaultSystemPrompt(): string {
  return `You are a browser agent helping users complete tasks.

Use this format:
THOUGHT: Brief analysis
TOOL: ToolName
{"param": "value"}

Or:
ANSWER: Final response

Rules:
- One tool per turn
- Wait for response
- Use valid JSON
- Be concise
- Verify success`;
}

/**
 * Gets examples for CommandExecutor usage
 * 
 * @returns Example prompts showing correct CommandExecutor format
 */
export function getCommandExecutorExamples(): string {
  return `
Example 1:
User: Search for weather in Paris
Agent: 
THOUGHT: I need to navigate to a search engine first
TOOL: CommandExecutorTool
{"action": "navigate https://google.com", "tabId": 1}

User: [Tool response: Successfully navigated to Google]
Agent:
THOUGHT: I should type "weather in Paris" in the search box and submit
TOOL: CommandExecutorTool
{"action": "click 300 200; type 'weather in Paris'; press Enter", "tabId": 1}

Example 2:
User: Check my Gmail inbox
Agent:
THOUGHT: I need to navigate to Gmail
TOOL: CommandExecutorTool
{"action": "navigate https://mail.google.com", "tabId": 1}

User: [Tool response: Successfully navigated to Gmail]
Agent:
THOUGHT: I should scroll down to see more emails
TOOL: CommandExecutorTool
{"action": "scroll down", "tabId": 1}`;
}

/**
 * Gets examples for NextAction usage
 * 
 * @returns Example prompts showing correct NextAction format
 */
export function getNextActionExamples(): string {
  return `
Example 1:
User: Click on the login button
Agent:
THOUGHT: I need to analyze the page to find the login button
TOOL: NextActionTool
{"userIntent": "Click on the login button", "previousActions": []}

User: [Tool response: Found login button at coordinates x=450, y=120]
Agent:
THOUGHT: I should click on the login button at the suggested coordinates
TOOL: CommandExecutorTool
{"action": "click 450 120", "tabId": 1}

Example 2:
User: Fill out the contact form
Agent:
THOUGHT: I need to analyze the page to identify form fields
TOOL: NextActionTool
{"userIntent": "Fill out the contact form", "previousActions": []}

User: [Tool response: Found name field at x=300, y=200, email field at x=300, y=250]
Agent:
THOUGHT: I should fill out the name field first
TOOL: CommandExecutorTool
{"action": "click 300 200; type 'John Smith'", "tabId": 1}`;
}