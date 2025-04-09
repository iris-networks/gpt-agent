import {
    Message,
    SystemMessage,
    ToolMessage,
    UserMessage,
} from "beeai-framework/backend/core";
import { ToolOutput } from "beeai-framework/tools/base";
import { GroqChatModel } from "beeai-framework/adapters/groq/backend/chat";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import * as readline from 'readline';

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import serveStatic from 'serve-static';
import path from 'path';
import fs from "fs";
import { promisify } from "util";
import { FileType, screen } from "@computer-use/nut-js";
import { Jimp } from 'jimp';
import { fileURLToPath } from 'url';
import { saveMessagesToLog } from "./utils/logger.js";
import { executorTool } from "./tools/tarsTool.js";
import { paraTool } from "./tools/paraTool.js";
import { codeTool } from "./tools/codeTool.js";
import { terminalTool } from "./tools/terminalTool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define available models
const models = {
    groq: () => new GroqChatModel("meta-llama/llama-4-scout-17b-16e-instruct"),
    anthropic: () => new AnthropicChatModel("claude-3-7-sonnet-20250219")
};

// Select which model to use - change this to switch models
const modelType = "groq"; // Change to "groq" to use Groq model
const model = models[modelType]();

const tools = [executorTool, paraTool, codeTool, terminalTool];

const systemPrompt = `
You are a GUI automation agent that plans ahead and adapts as needed. You control a computer screen using tools to complete user tasks. For each task:

## 1. INITIAL PLANNING
- Analyze the screenshot and task requirements
- Form a high-level plan to reach the goal
- Be ready to modify this plan as you progress

## 2. EXECUTION CYCLE

### OBSERVE
For each step, analyze the current screenshot to identify:
- Text elements, their position, and visual grouping
- Interactive elements (buttons, fields, menus, etc.)
- Content ownership and attribution
- Navigation indicators (scroll bars, pagination, etc.)
- Any elements that appear cut off or partially visible

### EXECUTE
Take one clear, precise action:
- Use specific descriptors for elements (e.g., "click the blue 'Submit' button in the bottom-right corner to submit the form")
- Be concise but descriptive :- example: Click on 'File' which lies on the right of doc icon and the left of 'Edit' text to save the process of saivng this file.
- Click on 'untitled document' text to rename the file


### VERIFY
After each action:
- Briefly describe what changed on the screen
- Confirm if the action produced the expected result
- If successful, proceed to the next planned step
- If unsuccessful, acknowledge the issue and replan

## 3. REPLANNING
If verification shows unexpected results or errors:
- Acknowledge the deviation from the expected outcome
- Describe the current visible state
- Adjust your plan based on the new information
- Try alternative approaches to reach the same goal
- Continue with the execution cycle using the updated plan

## COMMUNICATION GUIDELINES
- Be concise and output only what's needed
- Don't repeat context that's already established
- Take only one action per step
- Track completed actions to avoid repetition
- When encountering similar elements, use precise contextual descriptors rather than ordinal terms like "first" or "second"
- If navigation leads to an incorrect page, acknowledge this and return to the previous state

## PROBLEM-SOLVING APPROACH
- Use your general understanding of applications and websites
- If an action fails, try alternative methods to achieve the same goal
- For repetitive tasks, recognize patterns and adapt accordingly
- Be attentive to timeouts, loading indicators, and system responses


Once the goal is reached, do not make any more tool calls.
`;

// Function to get input from the user interactively
const getUserInput = (): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('What would you like me to do? ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// WebSocket data validation
interface WebSocketData {
    prompt: string;
    sessionId?: string;
}

// Function to run the agent with Socket.IO support
async function runAgent(prompt: string, sessionId: string, socket: any) {
    console.log(`Task received: ${prompt}`);

    let messages: Message[] = [
        new SystemMessage(systemPrompt),
        new UserMessage({
            type: 'text',
            text: prompt
        })
    ];

    const MAX_ITERATIONS = 50; // Maximum number of iterations before stopping
    let iterationCount = 0;

    // Send initial update
    socket.emit('message', {
        type: 'update',
        message: 'Starting Pulsar processing...',
        sessionId
    });

    while (true) {
        // Only remove user messages with image content, keep all other messages
        messages = messages.filter(message => {
            return message.role !== "user" ||
                (message.role === "user" && message.content.every(content => content.type !== 'image'));
        });

        // Check if we've reached the maximum number of iterations
        if (iterationCount >= MAX_ITERATIONS) {
            console.log(`Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`);
            socket.emit('message', {
                type: 'complete',
                message: `Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`,
                sessionId
            });
            break;
        }

        iterationCount++;

        const image = await screen.capture('screenshot', FileType.PNG, '/tmp');
        const jimpImage = await Jimp.read(image);
        const compressedImage = jimpImage.scale(0.5);

        await compressedImage.write('/tmp/compressed_image.jpeg'); // Save as jpeg
        const readFileAsync = promisify(fs.readFile);
        const buffer = await readFileAsync('/tmp/compressed_image.jpeg');

        messages.push(
            new UserMessage([
                {
                    "type": "text",
                    "text": "Here is what is available on the screen, plan the next action based on this."
                },
                {
                    "type": "image",
                    "image": buffer,
                    "mimeType": "image/jpeg", // Changed to jpeg since we're converting it
                }
            ])
        );

        socket.emit('message', {
            type: 'update',
            message: `Iteration ${iterationCount}: Analyzing screenshot...`,
            sessionId
        });

        try {
            const response = await model.create({
                messages,
                tools,
            });

            // Add all messages including tool calls
            messages.push(...response.messages);

            // take tool call out and execute it one by one
            const toolCalls = response.getToolCalls();

            for await (const { args, toolName, toolCallId } of toolCalls) {
                const toolMessage = `Running '${toolName}' tool with ${JSON.stringify(args)}`;
                console.log(`-> ${toolMessage}`);

                socket.emit('message', {
                    type: 'tool',
                    message: toolMessage,
                    tool: toolName,
                    args: args,
                    sessionId
                });

                const tool = tools.find((tool) => tool.name === toolName)!;
                const response: ToolOutput = await tool.run(args as any);

                const toolResult = response.getTextContent();
                messages.push(new ToolMessage({
                    type: "tool-result",
                    result: toolResult,
                    isError: false,
                    toolName,
                    toolCallId,
                }));

                socket.emit('message', {
                    type: 'tool_result',
                    message: `Tool result: ${toolResult.substring(0, 100)}${toolResult.length > 100 ? '...' : ''}`,
                    result: toolResult,
                    sessionId
                });
            }

            // Save messages to log file
            saveMessagesToLog(messages, __dirname, iterationCount);

            // Check if there are no more tool calls to make
            if (toolCalls.length === 0) {
                console.log("No more tool calls to make. Task completed.");
                socket.emit('message', {
                    type: 'complete',
                    message: "Task completed successfully.",
                    sessionId
                });
                break;
            }
        } catch (error) {
            console.error("Error during model execution:", error);
            socket.emit('message', {
                type: 'error',
                message: `Error during execution: ${error instanceof Error ? error.message : 'Unknown error'}`,
                sessionId
            });
            break;
        }
    }
}

// Create Express server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Setup Socket.IO connection
io.on('connection', (socket) => {
    console.log('New Socket.IO connection opened');

    socket.on('message', async (message) => {
        try {
            const data = message as WebSocketData;
            const { prompt, sessionId = Date.now().toString() } = data;

            if (!prompt) {
                socket.emit('message', {
                    type: 'error',
                    message: 'No prompt provided',
                    sessionId
                });
                return;
            }

            // Run the agent with the Socket.IO connection
            await runAgent(prompt, sessionId, socket);
        } catch (error) {
            console.error('Error processing Socket.IO message:', error);
            socket.emit('message', {
                type: 'error',
                message: 'Error processing request',
                error: error instanceof Error ? error.message : 'Unknown error',
                sessionId: Date.now().toString()
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket.IO connection closed');
    });
});

// Start server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});