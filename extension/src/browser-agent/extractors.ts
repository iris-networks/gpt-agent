/**
 * Utilities for extracting structured data from the LLM response
 */

/**
 * Extracts thought content from XML tags
 * 
 * @param text - The raw text response from the LLM
 * @returns The extracted thought content or null if not found
 */
export function extractThought(text: string): string | null {
  const xmlThoughtMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
  return xmlThoughtMatch ? xmlThoughtMatch[1].trim() : null;
}

/**
 * Error class for tool input parsing failures
 */
export class ToolInputParseError extends Error {
  /**
   * @param message - Error message
   * @param toolName - Name of the tool that had the parsing error
   * @param rawInput - The raw input string that failed to parse
   */
  constructor(message: string, public toolName: string, public rawInput: string) {
    super(message);
    this.name = 'ToolInputParseError';
  }
}

/**
 * Extracts tool name and input from XML tags
 * Throws an error if the input cannot be parsed as JSON
 * 
 * @param text - The raw text response from the LLM
 * @returns A tuple containing the tool name and parsed input, or [null, null] if not found
 * @throws {ToolInputParseError} If the input cannot be parsed as valid JSON
 */
export function extractToolCall(text: string): [string | null, any | null] {
  const toolMatch = text.match(/<tool name="([^"]+)">\s*<input>([\s\S]*?)<\/input>\s*<\/tool>/);
  if (!toolMatch) return [null, null];

  const toolName = toolMatch[1].trim();
  const rawInput = toolMatch[2].trim();
  
  // Try to parse the tool input as JSON
  try {
    const parsedInput = JSON.parse(rawInput);
    return [toolName, parsedInput];
  } catch (e: unknown) {
    // Try one more time with cleaned input
    try {
      // Clean up any line breaks or extra spaces
      const cleanedInput = rawInput.replace(/\n\s*/g, ' ').trim();
      const parsedInput = JSON.parse(cleanedInput);
      return [toolName, parsedInput];
    } catch (e2: unknown) {
      // Throw a structured error with details
      const errorMessage = e2 instanceof Error ? e2.message : String(e2);
      throw new ToolInputParseError(
        `Failed to parse JSON input for tool "${toolName}": ${errorMessage}`,
        toolName,
        rawInput
      );
    }
  }
}

/**
 * Checks if the text contains a final answer in XML tags
 * 
 * @param text - The raw text response from the LLM
 * @returns True if the text contains a final answer, false otherwise
 */
export function hasFinalAnswer(text: string): boolean {
  return text.includes('<final_answer>');
}

/**
 * Extracts final answer from XML tags
 * 
 * @param text - The raw text response from the LLM
 * @returns The extracted final answer or empty string if not found
 */
export function extractFinalAnswer(text: string): string {
  const xmlAnswerMatch = text.match(/<final_answer>([\s\S]*?)<\/final_answer>/);
  return xmlAnswerMatch ? xmlAnswerMatch[1].trim() : '';
}