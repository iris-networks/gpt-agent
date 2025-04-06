import {
    Message,
    SystemMessage,
    ToolMessage,
    UserMessage,
} from "beeai-framework/backend/core";
import { ToolOutput, type AnyTool } from "beeai-framework/tools/base";
import screenshot from "screenshot-desktop";
import sharp from "sharp"; // For image resizing
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { executorTool } from "./tarsTool";

// const model = await ChatModel.fromName("azure-");
const tools = [executorTool]

const model = new AnthropicChatModel("claude-3-7-sonnet-20250219")
let messages: Message[] = [
    new SystemMessage(`You are an ai agent that can instruct user to click / type on the computer screen to meet a desired goal. Use tools to execute these actions. You will start by generating a plan for how to achieve the goal and execute the steps of the plan one by one.    
    If the last plan execution was correct goto next step, otherwise replan on how to achieve the goal. Use the ExecutorTool to instruct user to perform the action. This is a turn based interaction. So plan all the steps and instruct the user one by one based on what you see on the screen. The user will perform the actions and then ask you again for your next instruction.
    `),

    new UserMessage([
        {
            "type": "text",
            "text": "Goto linkedin and write a cool post about how to become a better developer"
        }
    ])
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
        
        // Reset messages to initial state but keep track of previous actions
        messages = [
            new SystemMessage(`You are an ai agent that can instruct user to click / type on the computer screen to meet a desired goal. Use tools to execute these actions. You will start by generating a plan for how to achieve the goal and execute the steps of the plan one by one.    
            If the last plan execution was correct goto next step, otherwise replan on how to achieve the goal. Use the ExecutorTool to instruct user to perform the action. This is a turn based interaction. So plan all the steps and instruct the user one by one based on what you see on the screen. The user will perform the actions and then ask you again for your next instruction.
            `),
            new UserMessage([
                {
                    "type": "text",
                    "text": "Goto linkedin and write a cool post about how to become a better developer"
                }
            ])
        ];
        
        // Only add previous actions message if there are actions to report
        if (previousActions.length > 0) {
            messages.push(
                new UserMessage([
                    {
                        "type": "text",
                        "text": "The following actions have already been performed:\n" + previousActions.join("\n")
                    }
                ])
            );
        }

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
        const toolResults = await Promise.all(
            toolCalls.map(async ({ args, toolName, toolCallId }) => {
                console.log(`-> running '${toolName}' tool with ${JSON.stringify(args)}`);
                const tool = tools.find((tool) => tool.name === toolName)!;
                const response: ToolOutput = await tool.run(args as any);
                const result = response.getTextContent();
                console.log(
                    `<- got response from '${toolName}'`,
                    result.replaceAll(/\s+/g, " ").substring(0, 90).concat(" (truncated)"),
                );
                
                // Add this action to our history
                const actionSummary = `Tool: ${toolName}, Action: ${JSON.stringify(args)}, Result: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`;
                previousActions.push(actionSummary);
                
                return new ToolMessage({
                    type: "tool-result",
                    result,
                    isError: false,
                    toolName,
                    toolCallId,
                });
            }),
        );

        messages.push(...toolResults);
        const answer = response.getTextContent();
        if (answer) {
            console.info(`Agent: ${answer}`);
            // Add the agent's response to our history
            previousActions.push(`Agent response: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}`);
        }
        
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