/**
 * Utilities for extracting structured data from the LLM response
 */

/**
 * Extracts thought content
 * 
 * @param text - The raw text response from the LLM
 * @returns The extracted thought content or null if not found
 */
export function extractThought(text: string): string | null {
  const thoughtMatch = text.match(/THOUGHT:\s*(.*?)(?=\n\n|TOOL:|ANSWER:|$)/s);
  return thoughtMatch ? thoughtMatch[1].trim() : null;
}

/**
 * Error class for tool input parsing failures
 */
export class ToolInputParseError extends Error {
  constructor(message: string, public toolName: string, public rawInput: string) {
    super(message);
    this.name = 'ToolInputParseError';
  }
}

/**
 * Extracts tool name and input
 * 
 * @param text - The raw text response from the LLM
 * @returns A tuple containing the tool name and parsed input, or [null, null] if not found
 */
export function extractToolCall(text: string): [string | null, any | null] {
  const toolMatch = text.match(/TOOL:\s*([^\n]+)\s*\n\s*({[\s\S]*?})(?=\n\n|$)/);
  if (!toolMatch) return [null, null];

  const toolName = toolMatch[1].trim();
  const rawInput = toolMatch[2].trim();
  
  try {
    const parsedInput = JSON.parse(rawInput);
    return [toolName, parsedInput];
  } catch (e) {
    // Try with cleaned input
    try {
      const cleanedInput = rawInput.replace(/\n\s*/g, ' ').trim();
      return [toolName, JSON.parse(cleanedInput)];
    } catch (e2) {
      throw new ToolInputParseError(
        `Failed to parse JSON input for tool "${toolName}"`,
        toolName,
        rawInput
      );
    }
  }
}

/**
 * Checks if the text contains a final answer
 * 
 * @param text - The raw text response from the LLM
 * @returns True if the text contains a final answer, false otherwise
 */
export function hasFinalAnswer(text: string): boolean {
  return text.includes('ANSWER:');
}

/**
 * Extracts final answer
 * 
 * @param text - The raw text response from the LLM
 * @returns The extracted final answer or empty string if not found
 */
export function extractFinalAnswer(text: string): string {
  const answerMatch = text.match(/ANSWER:\s*([\s\S]*?)$/);
  return answerMatch ? answerMatch[1].trim() : '';
}