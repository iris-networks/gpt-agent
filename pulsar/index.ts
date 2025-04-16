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
import { fileURLToPath } from 'url';
import { saveMessagesToLog } from "./utils/logger.js";
import { systemPrompt } from "./utils/systemPrompt.js";
import { executorTool } from "./tools/tarsTool.js";
import { paraTool } from "./tools/paraTool.js";
import { codeTool } from "./tools/codeTool.js";
import { terminalTool } from "./tools/terminalTool.js";
import {FileType, screen} from '@computer-use/nut-js';
import {Jimp, ResizeStrategy} from "jimp"
import { promisify } from "util";
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define available model creators
const createModel = {
    // meta-llama/llama-4-scout-17b-16e-instruct
    // meta-llama/llama-4-maverick-17b-128e-instruct
    groq: (apiKey?: string, apiUrl?: string) => new GroqChatModel("meta-llama/llama-4-scout-17b-16e-instruct", {}, {
        "apiKey": apiKey || process.env.IRIS_API_KEY,
        "baseURL": `${apiUrl || process.env.IRIS_API_URL}/api/proxy/groq`
    }),
    anthropic: (apiKey?: string, apiUrl?: string) => new AnthropicChatModel("claude-3-7-sonnet-20250219", {}, {
        "apiKey": apiKey || process.env.IRIS_API_KEY,
        "baseURL": `${apiUrl || process.env.IRIS_API_URL}/api/proxy/anthropic`
    })
};

const tools = [executorTool, paraTool, codeTool, terminalTool];

// Track active agent sessions with abort controllers
const activeSessions = new Map<string, { abortController: AbortController; }>();

// WebSocket data validation
interface WebSocketData {
    prompt?: string;
    sessionId?: string;
    action?: 'stop';
    apiKey?: string;
    apiUrl?: string;
    modelType?: string;
    workflow?: Workflow;
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

// Workflow interface
interface Workflow {
    id: string;
    name: string;
    urlPattern: string;
    instructions: string;
    createdAt: string;
    updatedAt: string;
}

// Helper function to send WebSocket messages
function sendMessage(ws: WebSocket, data: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// Function to run the agent with WebSocket support
async function runAgent(prompt: string, sessionId: string, ws: WebSocket, apiKey: string, apiUrl: string, modelType: string, workflow?: Workflow) {
    console.log(`Task received: ${prompt}`);
    
    // Create a new AbortController for this session
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // Register this session
    activeSessions.set(sessionId, { abortController });

    // Create the base system prompt
    let finalSystemPrompt = systemPrompt;
    
    // Append workflow instructions if provided
    if (workflow) {
        console.log(`Using workflow: ${workflow.name}`);
        finalSystemPrompt += `\n\n# Website-Specific Instructions for ${workflow.name}\n\n`;
        finalSystemPrompt += `The following are specific instructions for interacting with websites matching the pattern: ${workflow.urlPattern}\n\n`;
        finalSystemPrompt += `${workflow.instructions}\n\n`;
        finalSystemPrompt += `Use these instructions to avoid making mistakes when interacting with this website. These instructions take precedence over general guidelines when applicable.`;
    }

    let messages: Message[] = [
        new SystemMessage(finalSystemPrompt),
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
        message: 'Starting Operator processing...',
        sessionId
    });
    
    // Set up abort handling
    signal.addEventListener('abort', () => {
        console.log(`Session ${sessionId} was aborted by user`);
    });
    
    // Verify we have valid API credentials
    if (!apiKey) {
        console.error("No API key provided for session", sessionId);
        sendMessage(ws, {
            type: 'error',
            message: 'Missing API key. Please provide a valid Iris API key.',
            sessionId
        });
        return;
    }
    
    if (!apiUrl) {
        console.error("No API URL provided for session", sessionId);
        sendMessage(ws, {
            type: 'error',
            message: 'Missing API URL. Please ensure the API URL is properly configured.',
            sessionId
        });
        return;
    }
    
    // Log which model is being used
    console.log(`Using ${modelType} model with API URL: ${apiUrl}`);
    
    // Create model instance using API key and URL from frontend
    // Fallback to anthropic if an invalid model type is provided
    const validModelType = (modelType === 'groq' || modelType === 'anthropic') ? modelType : 'anthropic';
    const model = createModel[validModelType](apiKey, apiUrl);
    
    sendMessage(ws, {
        type: 'update',
        message: `Using ${validModelType} model`,
        sessionId
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
            f: 0.5,
            mode: ResizeStrategy.HERMITE
        });

        await compressedImage.write('/tmp/compressed_image.jpeg'); // Save as jpeg
        const readFileAsync = promisify(fs.readFile);
        const buffer = await readFileAsync('/tmp/compressed_image.jpeg');
        // const screenshot = await operator.screenshot()

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
            console.log("Tool call count: ", toolCalls.length);
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
                    // @ts-ignore
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
            const { prompt, sessionId = Date.now().toString(), action, apiKey, apiUrl, modelType = "anthropic", workflow } = data;

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
            if (!apiKey || !apiUrl) {
                sendMessage(ws, {
                    type: 'error',
                    message: 'API Key and API URL are required',
                    sessionId
                });
                return;
            }

            // Set environment variables for API key and URL so they can be used elsewhere in the codebase
            process.env.IRIS_API_KEY = apiKey;
            process.env.IRIS_API_URL = apiUrl;
            
            console.log(`Set environment variables IRIS_API_KEY and IRIS_API_URL for session ${sessionId}`);
            
            // Log if workflow is being used
            if (workflow) {
                console.log(`Using workflow "${workflow.name}" for session ${sessionId}`);
                
                sendMessage(ws, {
                    type: 'update',
                    message: `Using workflow: ${workflow.name}`,
                    sessionId
                });
            }

            // Pass apiKey, apiUrl, modelType, and workflow to runAgent
            await runAgent(prompt, sessionId, ws, apiKey, apiUrl, modelType, workflow);
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


httpServer.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
})