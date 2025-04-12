import {
    Message,
    SystemMessage,
    ToolMessage,
    UserMessage,
} from "beeai-framework/backend/core";
import { ToolOutput } from "beeai-framework/tools/base";
import { GroqChatModel } from "beeai-framework/adapters/groq/backend/chat";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from "fs";
import { promisify } from "util";
import { NutJSOperator } from "@ui-tars/operator-nut-js";
import { fileURLToPath } from 'url';
import { saveMessagesToLog } from "./utils/logger.js";
import { systemPrompt } from "./utils/systemPrompt.js";
import { executorTool } from "./tools/tarsTool.js";
import { paraTool } from "./tools/paraTool.js";
import { codeTool } from "./tools/codeTool.js";
import { terminalTool } from "./tools/terminalTool.js";
import { initializeEnvironment } from "./env-fetcher.js";
import {FileType, screen} from '@computer-use/nut-js';
import { Jimp, ResizeStrategy } from "jimp";

const operator = new NutJSOperator();
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

// Track active agent sessions with abort controllers
const activeSessions = new Map<string, { abortController: AbortController; }>();

// WebSocket data validation
interface WebSocketData {
    prompt?: string;
    sessionId?: string;
    action?: 'stop';
}

// WebSocket message interface
interface WebSocketMessage {
    type: 'update' | 'tool' | 'tool_result' | 'error' | 'complete' | 'stopped';
    message: string;
    sessionId: string;
    tool?: string;
    args?: any;
    result?: string;
    error?: string;
}

// Helper function to send WebSocket messages
function sendMessage(ws: WebSocket, data: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// Function to run the agent with WebSocket support
async function runAgent(prompt: string, sessionId: string, ws: WebSocket) {
    console.log(`Task received: ${prompt}`);
    
    // Create a new AbortController for this session
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // Register this session
    activeSessions.set(sessionId, { abortController });

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
    sendMessage(ws, {
        type: 'update',
        message: 'Starting Pulsar processing...',
        sessionId
    });
    
    // Set up abort handling
    signal.addEventListener('abort', () => {
        console.log(`Session ${sessionId} was aborted by user`);
    });

    while (true) {
        // Check if the operation has been aborted
        if (signal.aborted) {
            console.log(`Session ${sessionId} operation aborted`);
            sendMessage(ws, {
                type: 'stopped',
                message: 'Operation stopped by user',
                sessionId
            });
            break;
        }
        
        // Only remove user messages with image content, keep all other messages
        messages = messages.filter(message => {
            return message.role !== "user" ||
                (message.role === "user" && message.content.every(content => content.type !== 'image'));
        });

        // Check if we've reached the maximum number of iterations
        if (iterationCount >= MAX_ITERATIONS) {
            console.log(`Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`);
            sendMessage(ws, {
                type: 'complete',
                message: `Reached maximum number of iterations (${MAX_ITERATIONS}). Stopping.`,
                sessionId
            });
            break;
        }

        iterationCount++;

        const image = await screen.capture('screenshot', FileType.PNG, '/tmp');
        const jimpImage = await Jimp.read(image);
        const compressedImage = jimpImage.scale({
            f: 0.7,
            mode: ResizeStrategy.HERMITE
        });

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
                    "image": buffer, // Updated to use data URI format
                    "mimeType": "image/jpeg",
                }
            ])
        );

        sendMessage(ws, {
            type: 'update',
            message: `Iteration ${iterationCount}: Analyzing screenshot...`,
            sessionId
        });

        try {
            // Check if aborted
            if (signal.aborted) {
                throw new Error("Operation cancelled by user");
            }
            
            const response = await model.create({
                messages,
                tools,
                abortSignal: signal,
            });

            // Add all messages including tool calls
            messages.push(...response.messages);

            // take tool call out and execute it one by one
            const toolCalls = response.getToolCalls();

            for await (const { args, toolName, toolCallId } of toolCalls) {
                // Check if aborted before running each tool
                if (signal.aborted) {
                    throw new Error("Operation cancelled by user during tool execution");
                }
                
                const toolMessage = `Running '${toolName}' tool with ${JSON.stringify(args)}`;
                console.log(`-> ${toolMessage}`);

                sendMessage(ws, {
                    type: 'tool',
                    message: toolMessage,
                    tool: toolName,
                    args: args,
                    sessionId
                });

                const tool = tools.find((tool) => tool.name === toolName)!;
                
                let toolResult = '';
                try {
                        
                    const response: ToolOutput = await tool.run(args);
                    
                    // Check if aborted after tool execution
                    if (signal.aborted) {
                        throw new Error("Operation cancelled by user after tool execution");
                    }

                    toolResult = response.getTextContent();
                    messages.push(new ToolMessage({
                        type: "tool-result",
                        result: toolResult,
                        isError: false,
                        toolName,
                        toolCallId,
                    }));
                    
                    sendMessage(ws, {
                        type: 'tool_result',
                        message: `Tool result: ${toolResult.substring(0, 100)}${toolResult.length > 100 ? '...' : ''}`,
                        result: toolResult,
                        sessionId
                    });
                } catch (error) {
                    if (signal.aborted) {
                        throw new Error("Operation cancelled by user during tool execution");
                    }
                    // Re-throw other errors
                    throw error;
                }
            }

            // Save messages to log file
            saveMessagesToLog(messages, __dirname, iterationCount);

            // Check if there are no more tool calls to make
            if (toolCalls.length === 0) {
                console.log("No more tool calls to make. Task completed.");
                sendMessage(ws, {
                    type: 'complete',
                    message: "Task completed successfully.",
                    sessionId
                });
                break;
            }
        } catch (error) {
            console.error("Error during model execution:", error);
            
            // If the error is due to user cancellation, send a stopped message
            if (signal.aborted || (error instanceof Error && error.message.includes("cancelled by user"))) {
                sendMessage(ws, {
                    type: 'stopped',
                    message: 'Operation stopped by user',
                    sessionId
                });
            } else {
                sendMessage(ws, {
                    type: 'error',
                    message: `Error during execution: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    sessionId
                });
            }
            break;
        }
    }
    
    // Clean up the session
    activeSessions.delete(sessionId);
}

// Create Express server
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Determine the appropriate public folder path based on environment
const publicPath = process.env.NODE_ENV === 'production' || __dirname.includes('dist') 
    ? path.join(__dirname, 'public') 
    : path.join(__dirname, '..', 'pulsar', 'public');

// Serve static files
app.use(express.static(publicPath));

// Serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Setup WebSocket connection
wss.on('connection', (ws) => {
    console.log('New WebSocket connection opened');

    ws.on('message', async (messageData) => {
        try {
            const message = JSON.parse(messageData.toString());
            const data = message as WebSocketData;
            const { prompt, sessionId = Date.now().toString(), action } = data;

            // Handle stop action
            if (action === 'stop' && sessionId) {
                const session = activeSessions.get(sessionId);
                if (session) {
                    console.log(`Stopping session ${sessionId} as requested by user`);
                    session.abortController.abort();
                    sendMessage(ws, {
                        type: 'update',
                        message: 'Stopping agent...',
                        sessionId
                    });
                } else {
                    console.log(`Session ${sessionId} not found or already stopped`);
                    sendMessage(ws, {
                        type: 'update',
                        message: 'No active session to stop',
                        sessionId
                    });
                }
                return;
            }

            if (!prompt) {
                sendMessage(ws, {
                    type: 'error',
                    message: 'No prompt provided',
                    sessionId
                });
                return;
            }

            // Run the agent with the WebSocket connection
            await runAgent(prompt, sessionId, ws);
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
            sendMessage(ws, {
                type: 'error',
                message: 'Error processing request',
                error: error instanceof Error ? error.message : 'Unknown error',
                sessionId: Date.now().toString()
            });
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Start server
const PORT = process.env.PORT || 8080;

// Initialize environment variables before starting the server
async function startServer() {
    try {
        console.log(process.env)
        // Fetch environment variables from external service
        // Note: These values should be loaded from a secure source in production
        // such as environment variables or a secure config file
        const envInitialized = await initializeEnvironment({
            secretKey: "X0mCbpeuYywzF038luE_Gw",
            agentId: process.env.AGENT_ID || 'dev-agent',
            baseUrl: process.env.ENV_API_URL || 'https://agent.tryiris.dev',
        });

        if (!envInitialized) {
            console.error('Auth Failed, do you have internet connection ? Exiting...');
            process.exit(1);
        }

        // Start the HTTP server
        httpServer.listen(PORT, async () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();