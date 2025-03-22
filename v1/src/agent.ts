import { ReActAgent } from "beeai-framework/agents/react/agent";
import { AnthropicChatModel } from "beeai-framework/adapters/anthropic/backend/chat";
import { ScreenTool } from "./tools/screen/screen";
import { InputTool } from "./tools/input/input";
import { VisionMemory } from "./memory/VisionMemory";
import { ScreenContentTool } from "./tools/screen-content/screenContentTool";

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
3. Continuously monitor your progress and adjust your plan if necessary, to adjust use <replan> tags.
4. Provide clear and concise explanations of your actions and reasoning.

When you're ready to begin, outline your plan in <plan> tags. Then start by making a function call, once the function call has been made, you then have to replan based on the outcome of the tool call and execute the next tool call, use <replan> tags to generate a new plan.
`
      }),
    },
    llm: new AnthropicChatModel("claude-3-haiku-20240307"),
    memory: new VisionMemory(10),
    tools: [new ScreenTool(), new InputTool(), ScreenContentTool],
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
runAgent("open chrome then goto gmail.com, you are already logged in. Search for emails from antler. Then open the first one and read its content please. always open a new tab to start working")
  .then(response => {
    // Do something with the response if needed
  })
  .catch(error => {
    console.error("Error running agent:", error);
  });