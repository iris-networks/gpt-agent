/**
 * Interface for platform-specific implementations
 */
export interface PlatformStrategy {
  /**
   * Get platform-specific command description
   */
  getCommandDescription(): string;

  /**
   * Execute a platform-specific command
   * @param command - The command to execute
   */
  executeCommand(command: string): Promise<string>;
  getToolDescription(): string; // Add this new method
}

export interface ScreenInteractionToolInput {
  strategyOverride?: PlatformStrategy;
  timeoutMs?: number;
}