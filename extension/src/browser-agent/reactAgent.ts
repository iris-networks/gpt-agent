/**
 * ReactAgent class implementation for browser automation
 */

// External imports
import { generateText } from 'ai';

// Internal imports
import { extractThought, extractToolCall, hasFinalAnswer, extractFinalAnswer } from './extractors';
import { ReActAgentOptions, AgentObserver, AgentResult, Tool } from './types';
import { getDefaultSystemPrompt, getCommandExecutorExamples, getNextActionExamples } from './prompt';
import { formatTools } from './toolFormatter';
import { validateToolInput } from './validator';
import { getModelProvider, ProviderType } from './modelProviders';

// Re-export the Tool type for convenience
export { Tool } from './types';
export { ProviderType } from './modelProviders';

/**
 * ReactAgent - An agent that uses ReAct (Reasoning and Acting) pattern to perform tasks
 * with browser automation tools
 */
export class ReactAgent {
  private apiKey: string;
  private providerType: ProviderType;
  private modelName?: string;
  private systemPrompt: string;
  private maxIterations: number;
  private tools: Tool[];
  private memory: string[] = [];

  /**
   * Create a new ReactAgent instance
   * 
   * @param options - Configuration options for the agent
   */
  constructor(options: ReActAgentOptions) {
    this.apiKey = options.apiKey;
    this.providerType = options.providerType || ProviderType.ANTHROPIC;
    this.modelName = options.modelName;
    this.maxIterations = options.maxIterations || 10;
    this.tools = options.tools || [];
    
    // Create the system prompt with examples
    let systemPrompt = options.systemPrompt || getDefaultSystemPrompt();
    
    // Add tool-specific examples
    let examples = "";
    if (this.tools.some(tool => tool.name === "CommandExecutorTool")) {
      examples += getCommandExecutorExamples();
    }
    if (this.tools.some(tool => tool.name === "NextActionTool")) {
      examples += examples ? "\n\n" + getNextActionExamples() : getNextActionExamples();
    }
    
    // Combine system prompt with examples
    if (examples) {
      systemPrompt += "\n\nEXAMPLES:" + examples;
    }
    
    this.systemPrompt = systemPrompt;
  }

  /**
   * Run the agent with a prompt
   * 
   * @param input - Object containing the user prompt
   * @returns Promise resolving to the agent result
   */
  async run(input: { prompt: string }): Promise<{ result: AgentResult }> {
    return new Promise((resolve, reject) => {
      this.runWithObserver(
        input,
        {
          onUpdate: () => {},
          onError: (error) => reject(error),
          onComplete: (result) => resolve({ result })
        }
      );
    });
  }

  /**
   * Run the agent with an observer to monitor execution
   * 
   * @param input - Object containing the user prompt
   * @param observer - Observer with callbacks for updates, errors, and completion
   * @returns Promise that resolves when the agent finishes
   */
  async runWithObserver(
    input: { prompt: string },
    observer: AgentObserver
  ): Promise<void> {
    try {
      const { prompt } = input;
      let iterations = 0;
      let finalAnswer: string | null = null;

      // Notify observer about starting
      observer.onUpdate({ key: 'status', value: 'Starting agent processing...' });

      // Initialize memory with user prompt
      this.memory = [`Human: ${prompt}\n`];

      while (iterations < this.maxIterations && !finalAnswer) {
        iterations++;

        // Notify observer about current iteration
        observer.onUpdate({
          key: 'iteration',
          value: `Iteration ${iterations}/${this.maxIterations}`
        });

        // Generate next agent step
        const step = await this.generateNextStep();
        
        // Extract thought, action, and action input from step
        const thought = extractThought(step);
        
        // Extract tool call with error handling
        let action = null;
        let actionInput = null;
        
        try {
          [action, actionInput] = extractToolCall(step);
        } catch (error: unknown) {
          // Handle JSON parsing errors in tool input
          const errorMessage = error instanceof Error ? error.message : String(error);
          observer.onUpdate({
            key: 'error',
            value: `Error parsing tool input: ${errorMessage}`,
            data: error
          });
          // Add error to memory so the model can correct itself
          this.memory.push(`Error: ${errorMessage}\n`);
          // Continue with the loop so the model can try again
          continue;
        }

        // If the agent has a thought, notify observer
        if (thought) {
          observer.onUpdate({
            key: 'thought',
            value: 'Agent thinking...',
            data: thought
          });
        }

        // Check if the agent has a final answer
        if (hasFinalAnswer(step)) {
          finalAnswer = extractFinalAnswer(step);
          observer.onUpdate({
            key: 'finalAnswer',
            value: 'Agent found solution',
            data: finalAnswer
          });
          break;
        }

        // If the agent wants to use a tool
        if (action && actionInput) {
          // Find the tool
          const tool = this.tools.find(t => t.name === action);
          
          if (!tool) {
            const errorMsg = `Tool ${action} not found`;
            observer.onUpdate({
              key: 'error',
              value: errorMsg
            });
            throw new Error(errorMsg);
          }

          // Notify observer about tool execution
          observer.onUpdate({
            key: 'toolExecution',
            value: `Executing ${action}`,
            data: actionInput
          });

          try {
            // Validate the input against the tool's schema
            const validatedInput = validateToolInput(tool, actionInput);
            
            // Execute the tool with validated input
            const result = await tool.execute(validatedInput);
            
            // Add tool result to memory
            this.memory.push(`${action} result: ${result}\n`);
            
            observer.onUpdate({
              key: 'toolResult',
              value: `${action} returned result`,
              data: result
            });
          } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.memory.push(`${action} error: ${errorMsg}\n`);
            
            observer.onUpdate({
              key: 'toolError',
              value: `Error executing ${action}`,
              data: errorMsg
            });
          }
        }
      }

      // If we reached max iterations without a final answer
      if (!finalAnswer) {
        finalAnswer = "I've reached the maximum number of iterations without finding a complete solution. Here's what I've done so far: " + 
          this.memory.join('\n');
      }

      // Notify observer about completion
      observer.onComplete({
        text: finalAnswer,
        iterations
      });

    } catch (error: unknown) {
      // Notify observer about error
      observer.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Generate the next step using the AI model
   * 
   * @returns Promise resolving to the generated text from the LLM
   * @private
   */
  private async generateNextStep(): Promise<string> {
    try {
      // Get the appropriate model provider
      const provider = getModelProvider({
        apiKey: this.apiKey,
        providerType: this.providerType,
        modelName: this.modelName
      });
  
      // Get system prompt and add tool descriptions
      const toolDescriptions = formatTools(this.tools);
      const fullPrompt = `${this.systemPrompt}\n\nAVAILABLE TOOLS:\n${toolDescriptions}`;
  
      // Prepare messages
      const messages = [
        {
          role: 'user',
          content: [{
            type: 'text',
            text: fullPrompt
          }]
        },
        {
          role: 'user',
          content: [{
            type: 'text',
            text: this.memory.join('\n')
          }]
        }
      ];
      
      try {
        // Generate text using the selected provider
        const { text } = await provider.generateText(messages);
    
        // Add the assistant's response to memory
        this.memory.push(`Assistant: ${text}\n`);
        
        return text;
      } catch (providerError) {
        // Check if error is related to authentication or API keys
        const errorStr = String(providerError);
        if (
          errorStr.includes('API key') || 
          errorStr.includes('authentication') || 
          errorStr.includes('auth') || 
          errorStr.includes('credentials') ||
          errorStr.includes('401') ||
          errorStr.includes('403')
        ) {
          throw new Error(`Authentication error: Your API key may be invalid or expired. Please check your settings. Details: ${errorStr}`);
        }
        // Re-throw other errors
        throw providerError;
      }
    } catch (error: unknown) {
      throw new Error(`Error generating next step: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clear the agent's memory
   */
  clearMemory(): void {
    this.memory = [];
  }

  /**
   * Get a copy of the agent's memory
   * 
   * @returns Array of memory entries
   */
  getMemory(): string[] {
    return [...this.memory];
  }
}