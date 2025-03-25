import { ReActAgent } from "beeai-framework/agents/react/agent";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { CommandExecutorTool } from "./tools/command-executor/commandExecutorTool";
import { VisionMemory } from "./memory/VisionMemory";
import { ScreenContentTool } from "./tools/screen-content/screenContentTool";
import { ScreenStateTool } from "./tools/screen-state";
import { NextActionTool } from "./tools/next-action/nextActionTool";

async function runAgent(prompt: string) {
  const agent = new ReActAgent({
    "templates": {
      system: (template) =>
        template.fork((config) => {
          config.defaults.instructions =
            `You are an AI agent with the ability to interact with a computer system. Your goal is to complete tasks efficiently using the tools at your disposal. 

Follow these guidelines when approaching the task:

1. Always start by creating a plan. Break down the task into smaller steps and determine the most efficient way to achieve the goal.
2. If a command or action fails, do not give up. Instead, think of alternative approaches or commands that could achieve the same result. Be resourceful and adaptive.
3. Continuously monitor your progress and adjust your plan if necessary.
4. Provide clear and concise explanations of your actions and reasoning.
5. IMPORTANT: NEVER attempt to guess coordinates for clicking or interacting with UI elements on the screen.

Make one function call at a time. You MUST ALWAYS follow this sequence of function calls:
<flow>
while goal not achieved:
  1. ALWAYS start by using |ScreenStateTool| to check the current screen state
  2. For ANY mouse-related interaction:
     a. Use |NextActionTool| to analyze the screen and get EXACT coordinates
     b. Then use |CommandExecutorTool| with those coordinates to execute the action
  3. For keyboard-only commands (that don't require mouse):
     a. Use |CommandExecutorTool| directly with appropriate commands
  4. Use |ScreenStateTool| after each action to verify results
</flow>

CRITICAL: ALWAYS check screen state first. For ANY mouse-related interaction, you MUST get coordinates from NextActionTool before using CommandExecutorTool. For opening a new tab or app you can directly use CommandExecutorTool with the appropriate command. Before you exit, make sure you have completed all tasks, or you errored more than 3 times.
`
      }),
    },
    llm: new AnthropicChatModel("claude-3-7-sonnet-20250219"),
    memory: new VisionMemory(10),
    tools: [NextActionTool, new CommandExecutorTool(), ScreenContentTool, ScreenStateTool],
  });

  const response = await agent
    .run({ prompt })
    .observe((emitter) => {
      emitter.on("update", async ({ data, update, meta }) => {
        // to log only valid runs (no errors), check if meta.success === true
        console.log(`Agent Update (${update.key}) 🤖 : ${update.value}`);
        console.log("-> Iteration state", data);
      });

      emitter.on("error", async ({ error, meta }) => {
        console.error(`Agent Error 🤖 : ${error.message}`);
      });
    });
  console.log(`Agent: ${response.result.text}`);
  return response;
}

// Example usage
runAgent("open firefox then goto web.whatsapp.com, you are already logged in. Look for ali arab, send him a ramadan joke and mention that you are an ai develped by iris systems. if whatsapp is loading run a wait command and try again in 3 seconds.")
  .then(response => {
    // Do something with the response if needed
  })
  .catch(error => {
    console.error("Error running agent:", error);
  });