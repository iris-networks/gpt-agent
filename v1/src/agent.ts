import { ReActAgent } from "beeai-framework/agents/react/agent";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { CommandExecutorTool } from "./tools/command-executor/commandExecutorTool";
import { VisionMemory } from "./memory/VisionMemory";
import { NextActionTool } from "./tools/next-action/nextActionTool";
import { TerminalTool } from "./tools/terminal/terminalTool";

async function runAgent(prompt: string) {
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

runAgent("Goto whatsapp web, and search for mahmoud al azzo, then send him a message asking him when to have the call.... also greet him in arabic.")
  .then(response => {
    // Do something with the response if needed
  })
  .catch(error => {
    console.error("Error running agent:", error);
  });