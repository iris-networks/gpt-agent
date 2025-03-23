import { ReActAgent } from "beeai-framework/agents/react/agent";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { ScreenTool } from "./tools/screen/screen";
import { InputTool } from "./tools/input/input";
import { VisionMemory } from "./memory/VisionMemory";
import { ScreenContentTool } from "./tools/screen-content/screenContentTool";
import { ScreenStateTool } from "./tools/screen-state";

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
5. Always use |ScreenTool| to find the coordiantes, never guess.

Make one function call at a time. The usual sequence of function calls will be like this:
<flow>
while goal not achieved:
  use |ScreenTool| to predict where to click / type / select
  then use |InputTool| to execute a series of cliclick commands to achieve the goal
  use |ScreenStateTool| if you are on the right track
</flow>
`
      }),
    },
    llm: new AnthropicChatModel("claude-3-5-sonnet-20241022"),
    memory: new VisionMemory(10),
    tools: [new ScreenTool(), new InputTool(), ScreenContentTool, ScreenStateTool],
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
runAgent("open firefox then goto web.whatsapp.com, you are already logged in. Look for ara coral, send her a good night joke and mention that you are an ai develped by iris systems.")
  .then(response => {
    // Do something with the response if needed
  })
  .catch(error => {
    console.error("Error running agent:", error);
  });