import { ReActAgent } from "beeai-framework/agents/react/agent";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { CommandExecutorTool } from "./tools/command-executor/commandExecutorTool";
import { VisionMemory } from "./memory/VisionMemory";
import { NextActionTool } from "./tools/next-action/nextActionTool";
import { TerminalTool } from "./tools/terminal/terminalTool";
import { Elysia, t } from "elysia";

// Function to create and run the agent
async function runAgent(prompt: string, sessionId: string, ws: any) {
  const agent = new ReActAgent({
    "templates": {
      system: (template) =>
        template.fork((config) => {
          config.defaults.instructions =
            `You are an AI agent with the ability to interact with a computer system. Your goal is to complete tasks efficiently using the tools at your disposal. 

            You can control the mouse and keyboard using the command executor tool. Always start from the NextActionTool to get the next action to take: 

            1. Use the NextActionTool to get the next action to take
            2. Use the CommandExecutorTool to execute the command.
            3. Use the TerminalTool to execute terminal commands.

            You will repeat this process until the goal is reached.

            <instructions>
              You suck at spatial reasoning, always call the NextActionTool to understand the screen layout
              The first thing you will do is to call the NextActionTool
            </instructions>
`
      }),
    },
    llm: new AnthropicChatModel("claude-3-7-sonnet-20250219"),
    memory: new VisionMemory(15),
    tools: [NextActionTool, new CommandExecutorTool(), TerminalTool],
    "execution": {
      "maxIterations": 30,
    }
  });

  // Send initial update
  ws.send({
    type: 'update',
    message: 'Starting agent processing...',
    sessionId
  });

  try {
    const response = await agent
      .run({ prompt })
      .observe((emitter) => {
        emitter.on("update", async ({ data, update, meta }) => {
          // Send updates to client based on the type of data
          if (data.final_answer) {
            ws.send({
              type: 'final_answer',
              message: `${update.key}: ${update.value}`,
              data: data.final_answer,
              sessionId
            });
          } else if (data.thought) {
            ws.send({
              type: 'thought',
              message: `${update.key}: ${update.value}`,
              data: data.thought,
              sessionId
            });
          } else {
            ws.send({
              type: 'update',
              message: `${update.key}: ${update.value}`,
              data: data.tool_input || '',
              sessionId
            });
          }
          
          console.log(`Agent Update (${update.key}) 🤖 : ${update.value}`);
          console.log("-> Iteration state", data);
        });

        emitter.on("error", async ({ error, meta }) => {
          // Send errors to client
          ws.send({
            type: 'error',
            message: error.message,
            sessionId
          });
          
          console.error(`Agent Error 🤖 : ${error.message}`);
        });
      });
      
    console.log(`Agent: ${response.result.text}`);
    
    // Send completion message
    ws.send({
      type: 'complete',
      message: 'Agent processing complete',
      result: response.result.text,
      sessionId
    });
    
    return response;
  } catch (error) {
    // Send error if agent processing fails
    ws.send({
      type: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      sessionId
    });
    
    console.error("Error running agent:", error);
    throw error;
  }
}

// Create and export the WebSocket server
export const agentEndpoint = new Elysia()
  .ws('/agent', {
    // Validate incoming message
    body: t.Object({
      prompt: t.String(),
      sessionId: t.Optional(t.String())
    }),
    message: async (ws, { prompt, sessionId = Date.now().toString() }) => {
      try {
        // Run the agent with the WebSocket connection
        await runAgent(prompt, sessionId, ws);
      } catch (error) {
        // Handle errors
        ws.send({
          type: 'error',
          message: 'Error processing request',
          error: error instanceof Error ? error.message : 'Unknown error',
          sessionId
        });
      }
    },
    open(ws) {
      console.log('New WebSocket connection opened');
    },
    close(ws) {
      console.log('WebSocket connection closed');
    }
  });