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

1. OBSERVE: Carefully analyze the screenshot to identify all relevant UI elements including their complete text, position, and context
2. PLAN: Create a clear step-by-step path to accomplish the goal
3. EXECUTE: Perform ONE precise action at a time using available tools
4. VERIFY: After each step, check the result and adapt as needed

When interacting with UI elements:
- ALWAYS use unambiguous, complete descriptions when referring to elements (e.g., "the blue 'Post Comment' button at bottom-right" not just "the button")
- For elements with identical or similar labels, use additional context identifiers like position, nearby text, or visual attributes
- When completing forms, ALWAYS include an explicit step to locate and click the submission element, using its exact label (e.g., "Post", "Comment", "Submit", "Continue")
- After form submission, explicitly verify success before proceeding

For repetitive tasks across multiple items:
- Create unique identifiers for each item (e.g., "first comment by user John", "second comment with text starting with 'Great article'")
- Track which items you've already interacted with to avoid duplicates
- Explicitly state which specific item you're acting on in each step

Maintain a concise progress tracker:
✓ Completed: [List specific actions taken]
◯ Next: [Current action to execute]
◯ Pending: [Brief remaining steps]

Respond to errors or unexpected states by:
1. Acknowledging the issue
2. Describing what you observe in the current state
3. Proposing an alternative approach`;

const initialUserMessage = "Search for isabelle choo from my linkedin network, like her first 5 posts. please uniquely identify each of your steps so as to not repeat yourself."

let messages: Message[] = [
    new SystemMessage(systemPrompt),
    new UserMessage({
        type: 'text',
        text: initialUserMessage
    })
];

// Keep track of previous actions
let previousActions: string[] = [];

async function run() {
    const MAX_ITERATIONS = 10; // Maximum number of iterations before stopping
    let iterationCount = 0;
    
    while (true) {
        // Check if we've reached the maximum number of iterations
        if (iterationCount >= MAX_ITERATIONS) {
            console.log(`Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`);
            break;
        }
        
        iterationCount++;
        
        // Reset messages to initial state but include previous actions in the initial message
        let userMessageText = initialUserMessage;
        
        // Add previous actions to the user message if there are any
        if (previousActions.length > 0) {
            userMessageText += "\n\nThe following actions have been performed earlier:\n" + previousActions.join("\n");
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
            previousActions.push(actionSummary);
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