# Vercel AI SDK: Server Methods and GUI Agents

Vercel’s AI SDK (installed via `npm install ai`) provides a rich set of server-side utilities for interacting with LLMs and building agentic applications. The core methods include text and structured generation (`generateText`, `streamText`, `generateObject`, `streamObject`), a `tool()` helper for defining tools, and streaming utilities like `createStreamableValue` (RSC). These can be combined to build GUI-based agents (e.g. in Next.js/React) that use ChatGPT (e.g. `openai('gpt-4o')`) as the model, call tools, and even interact with the local system. The sections below break down each utility, show code examples, and discuss multi-step agents and UI integration.

## Core Server Methods

* **`generateText`** – Synchronous text completion. Generates a full text response (with reasoning, sources, etc.) for a given prompt. Example (using GPT-4o via the OpenAI adapter):

  ```js
  import { openai } from '@ai-sdk/openai';
  import { generateText } from 'ai';

  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    prompt: 'Summarize the latest AI SDK features in 3 sentences.'
  });
  console.log(text);
  ```

  This returns `{ text, reasoning?, sources?, finishReason, usage, toolCalls?, toolResults? }`. It supports specifying `system`, `prompt`, or full `messages` (conversation) and can handle tool calls (see below).

* **`streamText`** – Streaming text generation. Returns a live stream of text chunks as the model generates. Example:

  ```js
  import { openai } from '@ai-sdk/openai';
  import { streamText } from 'ai';

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    prompt: 'Describe the Vercel AI SDK in real-time...'
  });

  // Consume stream as async iterable:
  for await (const chunk of result.textStream) {
    console.log(chunk);
  }
  // When done, access the final text:
  console.log(await result.text);
  ```

  The `result` object has a `textStream` (async iterable/ReadableStream) and promises like `result.text`, `result.finishReason`, `result.usage` that resolve once generation completes. It also provides helpers for Next.js streaming endpoints (e.g. `result.toDataStreamResponse()` to pipe to a streaming HTTP response). An `onError` or `onChunk` callback can be passed to handle errors or each chunk.

* **`generateObject`** – Structured object generation. Forces the model to output JSON (or other structured formats) matching a given schema. Example using Zod:

  ```js
  import { openai } from '@ai-sdk/openai';
  import { generateObject } from 'ai';
  import { z } from 'zod';

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      title: z.string(),
      tags: z.array(z.string())
    }),
    prompt: 'Generate blog metadata for the topic "Vercel AI SDK agents".'
  });
  console.log(object.title, object.tags);
  ```

  This returns a typed `object` (validated against the schema) and optionally `objectErrors` if invalid. You can also set `output: 'array'` (with item schema) or `'enum'` (with `enum: [...]` values) or `'no-schema'` to generate JSON without a schema.

* **`streamObject`** – Streaming structured generation. Like `generateObject`, but streams partial JSON as it is produced. Example:

  ```js
  import { openai } from '@ai-sdk/openai';
  import { streamObject } from 'ai';
  import { z } from 'zod';

  const { elementStream } = streamObject({
    model: openai('gpt-4o'),
    output: 'array',
    schema: z.object({ name: z.string(), price: z.number() }),
    prompt: 'List 3 fruits and their prices.'
  });

  for await (const item of elementStream) {
    console.log(item); // each item matches {name, price}
  }
  ```

  The result yields either `partialObjectStream` (chunks of the object) or `elementStream` (for arrays). You can also use `output: 'no-schema'` to stream arbitrary JSON (as partial objects).

* **`tool()`** – Helper for defining tools. Wraps an object specifying a tool’s `description`, `parameters` (Zod/JSON schema), and `execute` function. Example: a simple math tool:

  ```js
  import { tool } from 'ai';
  import * as mathjs from 'mathjs';
  import { z } from 'zod';

  export const calculateTool = tool({
    description: 'Evaluate a mathematical expression, e.g. "2+2" or "sin(pi/4)".',
    parameters: z.object({ expression: z.string() }),
    execute: async ({ expression }) => ({ result: mathjs.evaluate(expression) })
  });
  ```

  This defines a `calculateTool` whose `execute` is inferred to take `{expression:string}` and return a result. The `tool()` wrapper is purely for type inference; at runtime it has no behavior except packaging the tool definition. If you omit `execute`, the tool will not run automatically (see next section).

* **`createStreamableValue`** – RSC streaming utility (experimental). Creates a value you can update on the server and read on the client (React Server Components). Example (in a Server Action):

  ```js
  'use server';
  import { createStreamableValue } from 'ai/rsc';

  export async function runLongTask() {
    const status = createStreamableValue('starting');
    // Simulate progress:
    setTimeout(() => { status.update('halfway'); status.update('almost done'); status.done('complete'); }, 1000);
    return { status: status.value };
  }
  ```

  In a client component, use `readStreamableValue` to consume it:

  ```js
  import { readStreamableValue } from 'ai/rsc';
  import { runLongTask } from '@/actions';

  export default function Page() {
    return <button onClick={async () => {
      const { status } = await runLongTask();
      for await (const val of readStreamableValue(status)) {
        console.log(val); // logs 'starting', 'halfway', 'almost done', 'complete'
      }
    }}>Start Task</button>;
  }
  ```

  Here `status` is a special streamable value you update with `.update()` and `.done()`. The client iterates over its values as they come in. This can stream agent progress or model output to the UI.

## Tools and Tool Calling

The AI SDK supports tool-calling: letting the LLM invoke predefined tools. Tools are passed to `generateText`/`streamText` via the `tools` option (an object mapping names to `tool()` definitions). When the model requests a tool, the SDK handles it. Key points:

* **Define tools with `tool({description, parameters, execute})`** as above. In `generateText`, include them:

  ```js
  const result = await generateText({
    model: openai('gpt-4o'),
    system: 'You are a math solver.',
    prompt: 'What is 50 * 20?',
    tools: { calculate: calculateTool }
  });
  ```

  If the LLM calls `calculate`, `execute` runs. Results and calls are in `result.toolResults` and `result.toolCalls`.

* **Automatic vs. manual execution:** By default (`toolChoice: 'auto'`), tools with `execute` are run automatically and their outputs fed back to the model. Setting `toolChoice: 'none'` disables all tool use; `'required'` forces a tool call for final output; or specify a tool explicitly. If you omit `execute`, the SDK will *not* run the tool. Instead the model’s request appears in `result.toolCalls` (so you can run it yourself). For example, you might do:

  ```js
  const { text, toolCalls } = await generateText({ model, prompt, tools: { myTool }, toolChoice: 'auto' });
  if (toolCalls.length) {
    // manually handle toolCalls[0]...
  }
  ```

  This is useful if you want to fetch data or do custom processing outside the LLM.

* **Example (multi-step with tools):** In a math-agent example, we pass a `calculate` tool and use `maxSteps` to allow multiple tool invocations. E.g.:

  ```js
  import { generateText, tool } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import * as mathjs from 'mathjs';

  const { text: answer } = await generateText({
    model: openai('gpt-4o'),
    system: 'Solve math problems step by step.',
    prompt: 'Calculate (7+3)*4.',
    tools: {
      calculate: tool({
        description: 'Evaluate a math expression.',
        parameters: z.object({ expression: z.string() }),
        execute: async ({ expression }) => ({ result: mathjs.evaluate(expression) })
      })
    },
    maxSteps: 5
  });
  console.log(answer);
  ```

  Here the model can call `calculate`, get results, and continue reasoning.

* **Non-execution (to see calls):** If you omit `execute`, the model’s tool request will appear but not run. For example:

  ```js
  const { text, toolCalls } = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Calculate 3+4 using math tool.',
    tools: { math: tool({ description: 'Add numbers', parameters: z.object({a: z.number(), b: z.number() }) }) }
  });
  // Here toolCalls[0] contains the model's call to math: { a:3, b:4 }
  ```

  You could then run the tool yourself and append a result via `toolResult`.

## Multi-Step Agents

The AI SDK makes it easy to run iterative “agent” loops with tools and stopping criteria:

* **`maxSteps`** – Tell `generateText` or `streamText` to repeat up to *n* steps. After each tool result, the SDK sends the updated conversation back to the model. For example, setting `maxSteps: 10` lets the LLM call tools up to 10 times. When the model stops calling tools or reaches the step limit, the answer is complete.

* **Accessing intermediate steps:** The `steps` property on the result holds each step’s data (text deltas, tool calls, tool results). For example:

  ```js
  const { steps } = await generateText({ model: openai('gpt-4o'), prompt, maxSteps: 3 });
  const allCalls = steps.flatMap(step => step.toolCalls);
  ```

  You can also use `onStepFinish` callback to get notified after each step.

* **Structured final answers:** You can create an “answer” tool (no `execute`) with a Zod schema to enforce the final answer format. Setting `toolChoice: 'required'` forces the agent to end with that tool’s output. Alternatively, use `experimental_output: 'true'` to have the LLM directly emit JSON.

* **Patterns:** Vercel’s SDK supports common agent architectures (chain/sequential, parallel, orchestration, routing, feedback loops). See the AI SDK docs for patterns like Sequential Processing or Parallel Processing. For example, you can run multiple calls in parallel by sending the same `streamText` or by managing multiple tool call streams concurrently.

## GUI Interfaces (Next.js/React/Svelte)

The AI SDK includes a UI layer (React hooks/components) to build chat and agent UIs easily:

* **useChat / useCompletion / useObject:** In React or Next.js, you can use hooks from `@ai-sdk/react` to manage state and streaming. For instance, to make a chat interface:

  ```jsx
  import { useChat } from '@ai-sdk/react';

  export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
      api: '/api/chat'
    });
    return (
      <>
        {messages.map(m => <div key={m.id}>{m.role === 'user' ? 'You: ' : 'AI: '}{m.content}</div>)}
        <form onSubmit={handleSubmit}>
          <input name="prompt" value={input} onChange={handleInputChange} />
          <button type="submit">Send</button>
        </form>
      </>
    );
  }
  ```

  In this example, `useChat` automatically sends new user messages to `/api/chat` and streams back the AI response, updating `messages`. The page above corresponds to a Next.js route **app/api/chat** that runs `streamText`. For example, in **app/api/chat/route.ts**:

  ```ts
  import { openai } from '@ai-sdk/openai';
  import { streamText } from 'ai';

  export async function POST(req: Request) {
    const { messages } = await req.json();
    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are a helpful assistant.',
      messages
    });
    return result.toDataStreamResponse();  // streams incremental text to client
  }
  ```

  This setup (shown in the AI SDK docs) provides real-time streaming chat. Under the hood, `useChat` supports tool calls via an `onToolCall` callback for client-side execution.

* **Creating UI widgets:** The hook approach is flexible: besides chat, there are hooks like `useCompletion` for one-shot outputs or `useObject` for structured output. You can customize the UI and show loading spinners by reading the `status` (`submitted`, `streaming`, `ready`, `error`) returned by the hook.

* **Streaming endpoints and responses:** On the server, you can call `.toDataStreamResponse()` or `.pipeDataStreamToResponse(res)` on the result of `streamText` or `streamObject` to implement Server-Sent Events (SSE) or JSON stream responses in Next.js App Router or Node.js. This integrates smoothly with the React hooks on the client.

* **Embedding File Upload/Browse:** To let agents process local files or web content, you can create tools that read files (via Node `fs`) or fetch URLs, then call them from the chat. For example, a custom “FileReader” tool might open an uploaded PDF and return its text. While detailed implementations vary, the SDK’s structured tool system supports this. (Anthropic’s “Computer Use” example shows how to integrate OS-level tools – you can similarly define file system or shell-command tools in Node for GPT-4o.)