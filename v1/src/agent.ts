import { ReActAgent } from "beeai-framework/agents/react/agent";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { CommandExecutorTool } from "./tools/command-executor/commandExecutorTool";
import { VisionMemory } from "./memory/VisionMemory";
import { ScreenContentTool } from "./tools/screen-content/screenContentTool";
import { NextActionTool } from "./tools/next-action/nextActionTool";

async function runAgent(prompt: string) {
  const agent = new ReActAgent({
    "templates": {
      system: (template) =>
        template.fork((config) => {
          config.defaults.instructions =
            `You are an AI agent with the ability to interact with a computer system. Your goal is to complete tasks efficiently using the tools at your disposal. 

            You can control the mouse and keyboard using the command executor tool. Before starting any task use the ScreenContentTool to get the content of the screen. After that: 
              - if you decide to open an app / open new tab: use the CommandExecutorTool
              - if you decide to click on an element on the screen, use NextActionTool to get the coordinates and then use the CommandExecutorTool to click or type or both ...

            You will repeat this process until the goal is reached.
`
      }),
    },
    llm: new AnthropicChatModel("claude-3-7-sonnet-20250219"),
    memory: new VisionMemory(10),
    tools: [NextActionTool, new CommandExecutorTool(), ScreenContentTool],
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
runAgent(`
  Send a warm message to my friend ali arab on whatsapp. it should be about ramadan 
`)
  .then(response => {
    // Do something with the response if needed
  })
  .catch(error => {
    console.error("Error running agent:", error);
  });