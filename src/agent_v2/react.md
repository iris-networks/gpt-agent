# Build an Iterative Agent with Progressive Summarization using Vercel AI SDK

## Project Overview
Build an AI agent system that processes screenshots and executes tool calls iteratively, maintaining context through progressive summarization. The agent should handle long-running tasks by preserving action history while managing visual context efficiently.

## Technical Stack
- **Framework**: Vercel AI SDK (`ai` package)
- **Core Features**: Tool calling, message management
- **Context Strategy**: Progressive summarization with dual-screenshot context

## System Architecture

### Core Loop Structure
```
Initial State:
- System Message + User Message + Screenshot_1
- Execute Tool Call → Get Result
- Generate Summary of Action 1
- Check if task complete

Subsequent Iterations (N=2,3,...):
- System Message + User Message + Cumulative Summary + Screenshot_N + Screenshot_N-1
- Execute Tool Call → Get Result  
- Update Summary to include Actions 1 through N
- Check if task complete
```

### Key Implementation Requirements

#### 1. Message Structure
- **System Message**: Static agent instructions (never summarized)
- **User Message**: Original user request (never summarized, always included fresh)
- **Summary Message**: Cumulative summary of all previous actions (type: 'assistant')
- **Screenshot Messages**: Current and previous screenshots as image data

#### 2. Context Management Rules
```typescript
// For Iteration 1:
messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: [
    { type: 'text', text: userMessage },
    { type: 'image', image: screenshot_1 }
  ]}
]

// For Iteration N (N > 1):
messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userMessage },
  { role: 'assistant', content: summaryOfActions_1_to_N_minus_1 },
  { role: 'user', content: [
    { type: 'text', text: 'Current state:' },
    { type: 'image', image: screenshot_N },
    { type: 'text', text: 'Previous state:' },
    { type: 'image', image: screenshot_N_minus_1 }
  ]}
]
```

#### 3. Summary Generation
After each tool execution, generate a summary that:
- ✅ Includes all tool calls and their results from the current iteration
- ✅ Preserves important context from previous iterations
- ✅ Captures relevant visual changes mentioned in tool results
- ❌ Does NOT include the original user message
- ❌ Does NOT include screenshot data
- ❌ Does NOT include system instructions

#### 4. Tool Calling Pattern
```typescript
import { generateText, tool } from 'ai';

// Define your tools
const tools = {
  click: tool({
    description: 'Click on an element',
    parameters: z.object({
      elementId: z.string(),
      // ... other parameters
    }),
    execute: async ({ elementId }) => {
      // Tool implementation
      return { success: true, result: '...' };
    }
  }),
  // ... other tools
};

// Main agent loop
async function runAgentLoop(initialScreenshot: Buffer, userMessage: string) {
  let messages = buildInitialMessages(userMessage, initialScreenshot);
  let currentScreenshot = initialScreenshot;
  let previousScreenshot = null;
  let cumulativeSummary = '';
  let iteration = 1;
  
  while (true) {
    const result = await generateText({
      model: yourModel,
      messages,
      tools,
      maxToolRoundtrips: 1, // Process one tool at a time
      toolChoice: 'auto',
    });
    
    // Extract tool calls and results
    const toolCalls = extractToolCalls(result);
    const toolResults = extractToolResults(result);
    
    // Generate/update summary
    if (iteration === 1) {
      cumulativeSummary = await generateSummary(toolCalls, toolResults);
    } else {
      cumulativeSummary = await updateSummary(cumulativeSummary, toolCalls, toolResults);
    }
    
    // Check if task is complete
    if (await isTaskComplete(result)) {
      break;
    }
    
    // Prepare for next iteration
    previousScreenshot = currentScreenshot;
    currentScreenshot = await captureNewScreenshot();
    messages = buildIterationMessages(
      userMessage,
      cumulativeSummary,
      currentScreenshot,
      previousScreenshot
    );
    
    iteration++;
  }
  
  return { finalResult: result, totalIterations: iteration };
}
```

#### 5. Summary Generation Function
```typescript
async function generateSummary(toolCalls: ToolCall[], toolResults: ToolResult[]): Promise<string> {
  const summaryResult = await generateText({
    model: yourModel,
    prompt: `Summarize the following actions and their results concisely:
    
    Actions taken:
    ${formatToolCallsAndResults(toolCalls, toolResults)}
    
    Create a brief summary that captures:
    1. What actions were performed
    2. Key outcomes or state changes
    3. Any important information for future iterations
    
    Do NOT include the original user request or screenshot descriptions.`,
  });
  
  return summaryResult.text;
}
```

#### 6. Task Completion Check
Implement logic to determine when to stop the loop:
- Task explicitly completed
- Error condition met
- Maximum iterations reached
- No more actions needed

## Additional Considerations

### Error Handling
- Wrap tool executions in try-catch blocks
- Include error states in summaries
- Implement retry logic for failed tool calls

### Performance Optimization
- Implement proper cleanup for screenshot buffers
- Consider implementing a maximum iteration limit

### State Management
- Track iteration count
- Maintain screenshot history (current + previous only)
- Keep cumulative summary updated

### Logging and Debugging
- Log each iteration's inputs and outputs
- Track tool call sequences
- Monitor context size growth

## Example Usage
```typescript
const agent = new IterativeAgent({
  model: 'gpt-4-vision-preview',
  maxIterations: 20,
  tools: browserTools,
  systemPrompt: 'You are a web automation agent...'
});

const result = await agent.run({
  userMessage: 'Navigate to example.com and fill out the contact form',
  initialScreenshot: screenshotBuffer
});
```

Build this system with proper TypeScript types, error handling, and make it production-ready. The key innovation is the progressive summarization that maintains context across iterations while keeping only the two most recent screenshots for visual continuity.




----

## Vercel Tool Calling Example

```ts
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(object, null, 2));
```