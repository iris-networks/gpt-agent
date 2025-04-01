/**
 * Tool formatting utilities for the ReactAgent
 */

// Internal imports
import { Tool } from './types';
import { formatToolExample } from './prompt';

/**
 * Formats tools for the AI model with detailed schema information
 * Assumes all tools have Zod object schemas
 * 
 * @param tools - Array of tools to format
 * @returns Formatted string with tool descriptions and examples
 */
export function formatTools(tools: Tool[]): string {
  return tools.map((tool) => {
    // Convert the Zod schema to a human-readable format
    let schemaDescription = 'Input Parameters:\n';
    
    // Build parameter examples for the tool usage example
    const paramExamples = Object.keys(tool.inputSchema.shape)
      .map(key => `"${key}": "example value"`)
      .join(',\n  ');
    
    Object.entries(tool.inputSchema.shape).forEach(([key, value]: [string, any]) => {
      const isRequired = !value.isOptional?.();
      const type = value._def?.typeName || 'any';
      const description = value.description || '';
      
      schemaDescription += `  - ${key}${isRequired ? ' (required)' : ' (optional)'}: ${type}\n`;
      if (description) {
        schemaDescription += `    Description: ${description}\n`;
      }
      
      // If there are specific constraints
      if (value._def?.checks) {
        const checks = value._def.checks;
        checks.forEach((check: any) => {
          if (check.kind === 'min') {
            schemaDescription += `    Minimum: ${check.value}\n`;
          } else if (check.kind === 'max') {
            schemaDescription += `    Maximum: ${check.value}\n`;
          } else if (check.kind === 'regex') {
            schemaDescription += `    Pattern: ${check.regex.toString()}\n`;
          }
        });
      }
      
      // If it's an enum
      if (value._def?.values) {
        schemaDescription += `    Allowed values: ${value._def.values.join(', ')}\n`;
      }
    });
    
    return `Tool: ${tool.name}
Description: ${tool.description}
${schemaDescription}

${formatToolExample(tool.name, paramExamples)}`;
  }).join('\n\n');
}