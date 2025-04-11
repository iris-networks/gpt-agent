/**
 * Environment variables manager
 * Provides functions to get environment variable keys and update their values
 */

/**
 * Get the list of available environment variable keys
 * This only returns the keys, not their values
 */
export function getEnvKeys(): string[] {
  return Object.keys(process.env);
}

/**
 * Update environment variables in process.env
 * Allows updating any environment variable
 */
export function updateEnvVars(newVars: Record<string, string>): { 
  success: boolean; 
  updated: string[];
  message?: string;
} {
  try {
    const updated: string[] = [];
    
    Object.entries(newVars).forEach(([key, value]) => {
      // Allow updating any environment variable
      process.env[key] = value;
      updated.push(key);
    });
    
    return { 
      success: true, 
      updated,
      message: updated.length > 0 
        ? `Updated ${updated.length} environment variables` 
        : 'No environment variables were updated'
    };
  } catch (error) {
    return { 
      success: false, 
      updated: [],
      message: `Error updating environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}