import { Elysia } from 'elysia';
import { ws } from '@elysiajs/websocket';
import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { AnthropicChatModel } from 'beeai-framework/adapters/anthropic/backend/chat';
import { CommandExecutorTool } from './v1/src/tools/command-executor/commandExecutorTool';
import { VisionMemory } from './v1/src/memory/VisionMemory';
import { NextActionTool } from './v1/src/tools/next-action/nextActionTool';
import { TerminalTool } from './v1/src/tools/terminal/terminalTool';

const app = new Elysia()
  .use(ws())
  .ws('/agent', {
    open(ws) {
      console.log('WebSocket connection established');
    },
    message: async (ws, message) => {
      try {
        if (typeof message !== 'string') {
          ws.send(JSON.stringify({ error: 'Message must be a string' }));
          return;
        }

        const data = JSON.parse(message);
        const { prompt, sessionId } = data;

        if (!prompt) {
          ws.send(JSON.stringify({ error: 'Prompt is required' }));
          return;
        }

        const agent = new ReActAgent({
          templates: {
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
                  </instructions>`;
              }),
          },
          llm: new AnthropicChatModel('claude-3-7-sonnet-20250219'),
          memory: new VisionMemory(15),
          tools: [NextActionTool, new CommandExecutorTool(), TerminalTool],
          execution: {
            maxIterations: 30,
          },
        });

        agent
          .run({ prompt })
          .observe((emitter) => {
            emitter.on('update', async ({ data, update }) => {
              ws.send(
                JSON.stringify({
                  type: 'update',
                  key: update.key,
                  value: update.value,
                  data,
                })
              );
            });

            emitter.on('error', async ({ error }) => {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: error.message,
                })
              );
            });
          })
          .then((response) => {
            ws.send(
              JSON.stringify({
                type: 'complete',
                result: response.result,
              })
            );
          })
          .catch((error) => {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: error.message,
              })
            );
          });
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
        );
      }
    },
    close(ws) {
      console.log('WebSocket connection closed');
    },
  })
  .listen(3000);

console.log(`🦊 Zenobia server is running at ${app.server?.hostname}:${app.server?.port}`);