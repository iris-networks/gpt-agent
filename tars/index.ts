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
    anthropic: () => new AnthropicChatModel("claude-3-5-haiku-20241022")
};

// Select which model to use - change this to switch models
const modelType = "anthropic"; // Change to "groq" to use Groq model
const model = models[modelType]();

const tools = [executorTool, paraTool];

const systemPrompt = `You are a GUI automation agent that controls a computer screen using tools. You receive a task, know the end goal, and take **one step at a time**. Do **not** plan the full solution. Instead, at each step:

---

### 1. **OBSERVE**
Analyze the current screenshot to identify key UI elements:  
- Text, position, visual grouping  
- Authors/ownership of content  
- Scroll indicators or cut-off areas  

---

### 2. **PLAN**
Based on:
- **What has already happened**
- **The current screen**
- **The known end goal**  
Choose the **next best action** only.

---

### 3. **EXECUTE**
Take **one clear, descriptive action**:  
- Refer to elements with exact labels, position, and context  
  (e.g., "click the blue 'Reply' button below John's comment")  
- Disambiguate similar items with nearby content or layout  
- Verify ownership before interacting

---

### 4. **VERIFY**
After each action:
- Briefly describe what changed
- Decide the next step based on the new state

---

### Efficiency Rules:
- **Be concise. Output only what's needed.** No extra reasoning, no speculation.
- Don't repeat context already known.
- Only one step per output.
- Track what's been done to avoid repeats.

---

### If something goes wrong:
- Acknowledge it briefly  
- Describe the current visible state  
- Suggest a new action based on what's shown  

<instructions>
    - Don't use generic words like first or second to identify elements, use better hints 
    - If there is more than one element you can target to get the job done, and one of them is a text element, prefer using the text element.
    - Incase you have navigated to the wrong page, go back to the previous page and try again
    - Use your general understanding of an app / website to reach an action.
</instructions>
`;

const initialUserMessage = "Open facebook.com and start replying to posts one by one, do it for 5 posts"

let messages: Message[] = [
    new SystemMessage(systemPrompt),
    new UserMessage({
        type: 'text',
        text: initialUserMessage
    })
];

async function run() {
    const MAX_ITERATIONS = 15; // Maximum number of iterations before stopping
    let iterationCount = 0;
    
    while (true) {
        // Only remove user messages with image content, keep all other messages
        messages = messages.filter(message => {
            return message.role !== "user" || 
                   (message.role === "user" && message.content.every(content => content.type !== 'image'));
        });
        
        // Check if we've reached the maximum number of iterations
        if (iterationCount >= MAX_ITERATIONS) {
            console.log(`Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`);
            break;
        }
        
        iterationCount++;

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
                    "text": "Here is what is available on the screen, plan the next action based on this."
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

        // Add all messages including tool calls
        messages.push(...response.messages);

        // take tool call out and execute it one by one
        const toolCalls = response.getToolCalls();
        // messages.push(new AssistantMessage(toolCalls));
        for (const { args, toolName, toolCallId } of toolCalls) {
            console.log(`-> running '${toolName}' tool with ${JSON.stringify(args)}`);
            const tool = tools.find((tool) => tool.name === toolName)!;
            const response: ToolOutput = await tool.run(args as any);
            messages.push(new ToolMessage({
                type: "tool-result",
                result: response.getTextContent(),
                isError: false,
                toolName,
                toolCallId,
            }));
        }
        
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