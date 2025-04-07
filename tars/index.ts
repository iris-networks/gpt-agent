import {
    Message,
    SystemMessage,
    ToolMessage,
    UserMessage,
} from "beeai-framework/backend/core";
import { ToolOutput } from "beeai-framework/tools/base";
import screenshot from "screenshot-desktop";
import sharp from "sharp"; // For image resizing
import { executorTool } from "./tarsTool";
import { paraTool } from "./paraTool";
import { GroqChatModel } from "beeai-framework/adapters/groq/backend/chat";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";

// Define available models
const models = {
    groq: () => new GroqChatModel("meta-llama/llama-4-scout-17b-16e-instruct"),
    anthropic: () => new AnthropicChatModel("claude-3-7-sonnet-20250219")
};

// Select which model to use - change this to switch models
const modelType = "anthropic"; // Change to "groq" to use Groq model
const model = models[modelType]();

const tools = [executorTool, paraTool];

const systemPrompt = `You are a GUI automation agent that controls a computer screen through tools. When given a task:

1. **OBSERVE**: Carefully analyze the screenshot to identify all relevant UI elements including their complete text, position, and context. Pay special attention to:
   - Authorship information (who posted/wrote content)
   - Visual hierarchies showing relationships between elements
   - Distinct visual sections and their boundaries
   - Text formatting that indicates different types of content
   - **Whether content extends beyond the visible area (requiring scrolling)**

2. **PLAN**: Create a clear step-by-step path to accomplish the goal, accounting for the visual structure of the interface

3. **EXECUTE**: Perform ONE precise action at a time using available tools, being as descriptive as possible

4. **VERIFY**: After each step, check the result and adapt as needed

When interacting with UI elements:
- ALWAYS use unambiguous, complete descriptions when referring to elements that include both content AND visual/positional context (e.g., "the blue 'Post Comment' button at the bottom-right of the reply form" not just "the button")
- Identify elements by their relationship to other elements (e.g., "the reply button directly beneath John's comment", "the edit icon within Maria's post")
- When multiple similar elements exist, distinguish them by nearby content, position, or unique visual attributes
- Before interacting with content, verify WHO created it by identifying author names, profile pictures, or ownership indicators
- Look for shortcuts or more efficient paths that may appear in the interface

For forms and interactive elements:
- When completing forms, ALWAYS include an explicit step to locate and click the submission element, using its exact label
- After form submission, explicitly verify success before proceeding
- Check for confirmation messages, errors, or state changes after interactions

For repetitive tasks across multiple items:
- Create unique identifiers for each item based on distinct characteristics (e.g., "comment by user John about pricing", "reply with timestamp 2 hours ago")
- Avoid using simple numerical identifiers like "first" or "second"
- Track which items you've already interacted with to avoid duplicates
- Explicitly state which specific item you're acting on in each step

**For navigating content that requires scrolling:**
- Regularly assess whether relevant content might be outside the visible area
- Look for scroll bars, partial content at screen edges, or UI patterns suggesting more content
- When scrolling is needed, specify direction and approximate amount (e.g., "scroll down to view more comments")
- After scrolling, take time to observe new content that has appeared before continuing

Maintain a concise progress tracker:
✓ Completed: [List specific actions taken]
◯ Next: [Current action to execute]
◯ Pending: [Brief remaining steps]

Respond to errors or unexpected states by:
1. Acknowledging the issue
2. Describing what you observe in the current state
3. Proposing an alternative approach`;

const initialUserMessage = "Go to linkedin and write warm comments on posts authored by Arné Niitsoo."

let messages: Message[] = [
    new SystemMessage(systemPrompt),
    new UserMessage({
        type: 'text',
        text: initialUserMessage
    })
];

async function run() {
    const MAX_ITERATIONS = 10; // Maximum number of iterations before stopping
    let iterationCount = 0;
    
    // Track only the last action
    let lastAction: string | null = null;
    
    while (true) {
        // Check if we've reached the maximum number of iterations
        if (iterationCount >= MAX_ITERATIONS) {
            console.log(`Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`);
            break;
        }
        
        iterationCount++;
        
        // Reset messages to initial state but include last action in the initial message
        let userMessageText = initialUserMessage;
        
        // Add last action to the user message if there is one
        if (lastAction) {
            userMessageText += "\n\nThe last action performed was:\n" + lastAction;
        }
        
        messages = [
            new SystemMessage(systemPrompt),
            new UserMessage({
                type: 'text',
                text: userMessageText
            })
        ];
        
        // Previous separate message for actions is now removed as it's incorporated above

        // Capture and resize screenshot
        const captureScreenshot = async (): Promise<Buffer> => {
            try {
                // Get all displays
                const displays = await screenshot.listDisplays();
                // @ts-expect-error
                const img = await screenshot({ screen: displays[displays.length - 1].id});

                // Resize the image to reduce size
                const resizedImg = await sharp(img)
                    .resize({ width: 800 }) // Resize to width of 800px, maintaining aspect ratio
                    .jpeg({ quality: 70 }) // Convert to JPEG with 70% quality
                    .toBuffer();

                return resizedImg;
            } catch (error) {
                console.error("Error capturing screenshot:", error);
                return Buffer.from([]); // Return empty buffer in case of error
            }
        };

        const screenshotBuffer = await captureScreenshot();

        messages.push(
            new UserMessage([
                {
                    "type": "text",
                    "text": "Here is what is available on the screen..."
                },
                {
                    "type": "image",
                    "image": screenshotBuffer,
                    "mimeType": "image/jpeg", // Changed to jpeg since we're converting it
                }
            ])
        );

        const response = await model.create({
            messages,
            tools,
        });

        messages.push(...response.messages);
        const toolCalls = response.getToolCalls();
        for (const { args, toolName, toolCallId } of toolCalls) {
            console.log(`-> running '${toolName}' tool with ${JSON.stringify(args)}`);
            const tool = tools.find((tool) => tool.name === toolName)!;
            const response: ToolOutput = await tool.run(args as any);
            const actionSummary = response.getTextContent();
            // Update lastAction instead of adding to previousActions array
            lastAction = actionSummary;
        }

        // messages.push(...toolResults);
        
        // Write messages to a file
        const fs = require('fs');
        const path = require('path');
        const logsDir = path.join(__dirname, 'logs');
        
        console.log("logs directory" + logsDir)
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        // Create a timestamped filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFile = path.join(logsDir, `conversation-${timestamp}-iteration-${iterationCount}.json`);
        
        // Write to file
        fs.writeFileSync(logFile, JSON.stringify(messages, null, 2));
        console.log(`Messages written to ${logFile}`);
        
        // const answer = response.getTextContent();
        // if (answer) {
        //     previousActions.push(answer);
        // }
        
        // Check if there are no more tool calls to make
        if (toolCalls.length === 0) {
            console.log("No more tool calls to make. Task completed.");
            break;
        }
    }
}

run().then(console.log).catch(err => {
    console.error(err);
});