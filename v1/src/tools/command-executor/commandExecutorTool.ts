import { z } from "zod";
import { StringToolOutput, Tool, type ToolEmitter, type ToolInput } from "beeai-framework";
import { Emitter } from "beeai-framework/emitter/emitter";
import type { PlatformStrategy, ScreenInteractionToolInput } from "../../interfaces/platform-strategy";
import { PlatformStrategyFactory } from "./platform-strategy-factory";

/**
 * Tool for executing commands using platform-specific strategies
 */
export class CommandExecutorTool extends Tool<StringToolOutput> {
  private _inputSchema = z.object({
    command: z.string().describe("The command to execute")
  });
  
  inputSchema() {
    return this._inputSchema;
  }
  
  name = "CommandExecutorTool";
  // This static description will be replaced in the constructor with the platform-specific one
  description = "Executes platform-specific commands";

  public readonly emitter: ToolEmitter<ToolInput<this>, StringToolOutput> = Emitter.root.child({
    namespace: ["tool", "command_executor"],
    creator: this,
  });

  private strategy: PlatformStrategy;
  private timeoutMs: number;

  constructor({ strategyOverride, timeoutMs = 5000, ...options }: ScreenInteractionToolInput = {}) {
    super(options);
    this.strategy = strategyOverride || PlatformStrategyFactory.createStrategy();
    
    // override with platform specific command description
    this._inputSchema = z.object({
      command: z.string().describe(this.strategy.getCommandDescription())
    });
    
    // Update the description to use the platform-specific description from the strategy
    this.description = this.strategy.getToolDescription?.() || 
      `A tool that executes platform-specific commands and operations. IMPORTANT: You MUST ALWAYS call NextActionTool before using this tool. CommandExecutorTool should only be used after NextActionTool has provided analysis and coordinates.\n${this.strategy.getCommandDescription()}`;
    
    this.timeoutMs = timeoutMs;
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    const { command } = input;
    
    if (!command) {
      throw new Error('Command is required');
    }
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${this.timeoutMs}ms`)), this.timeoutMs);
    });
    
    try {
      // Execute the command with timeout
      const execPromise = this.strategy.executeCommand(command);
      
      // Race against the timeout
      const result = await Promise.race([execPromise, timeoutPromise]);
      
      return new StringToolOutput(result || 'Command executed successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new StringToolOutput(`One or more of the commands have failed, you should use the screen tool to see where you are right now: ${errorMessage}`);
    }
  }
}