/**
 * Tool formatting utilities for the ReactAgent
 */

import { Tool } from './types';

/**
 * Formats tools for the AI model
 * 
 * @param tools - Array of tools to format
 * @returns Formatted string with tool descriptions
 */
export function formatTools(tools: Tool[]): string {
  return tools.map((tool) => {
    // Create parameter description from Zod schema
    let paramsDescription = '';
    
    Object.entries(tool.inputSchema.shape).forEach(([key, value]: [string, any]) => {
      const isRequired = !value.isOptional?.();
      const description = value.description || '';
      
      // Extract parameter type information
      let paramType = 'unknown';
      if (value._def) {
        paramType = value._def.typeName || 'unknown';
        
        // Handle array types
        if (paramType === 'ZodArray') {
          const elementType = value._def.type?._def?.typeName || 'unknown';
          paramType = `array of ${elementType.replace('Zod', '').toLowerCase()}`;
        } else {
          // Clean up type name (remove 'Zod' prefix and lowercase)
          paramType = paramType.replace('Zod', '').toLowerCase();
        }
      }
      
      paramsDescription += `  - ${key}${isRequired ? ' (required)' : ''} [${paramType}]: ${description}\n`;
    });
    
    return `TOOL: ${tool.name}
Description: ${tool.description}
Parameters:
${paramsDescription}`;
  }).join('\n\n');
}