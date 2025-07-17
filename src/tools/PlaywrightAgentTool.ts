import { streamText, StepResult, tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { google } from '@ai-sdk/google';
import { HITLTool } from './HITLTool';

export interface PlaywrightAgentToolOptions {
    statusCallback: (message: string, status: StatusEnum) => void;
    abortController: AbortController;
}

@Injectable()
export class PlaywrightAgentTool extends BaseTool {
    private mcpTools: any;
    private hitlTool: HITLTool;
    private mcpClient = null;

    constructor(options: PlaywrightAgentToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });

        // Create HITL tool directly
        this.hitlTool = new HITLTool({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });

        createMCPClient({
            transport: new StreamableHTTPClientTransport(new URL("http://localhost:8080/mcp")),
        }).then(client => {
            client.tools().then(tools => {
                this.mcpTools = tools;
            })

            this.emitStatus('Browser agent ready!', StatusEnum.RUNNING);
        })
    }

    private async executeBrowserInstruction(instruction: string) {
        try {
            const systemPrompt = "You are a browser automation agent. Your role is to execute browser actions based on user instructions or contact human if you are stuck. Always return a summary of your findings. Your default search engine is duckduckgo, please use that.";

            const result = streamText({
                model: google("gemini-2.5-flash"),
                tools: this.mcpTools,
                messages: [
                    {
                        "role": "system",
                        "content": systemPrompt
                    },
                    {
                        "role": "user",
                        "content": instruction
                    }
                ],
                toolChoice: 'auto',
                maxSteps: 12,
                abortSignal: this.abortController.signal
            })

            let fullText = '';
            for await (const textPart of result.textStream) {
                fullText += textPart;
                this.emitStatus(fullText, StatusEnum.RUNNING);
            }

            this.emitStatus('\n', StatusEnum.RUNNING);
            return fullText;
        } catch (error: any) {
            console.error('[BrowserAgent] Error executing browser instruction:', error);

            const errorMessage = `Error processing BrowserAgent browser instruction: ${error.message}`;
            this.emitStatus('💥 BrowserAgent encountered an unexpected plot twist', StatusEnum.ERROR);
            return { summary: errorMessage };
        }
    }

    getToolDefinition() {
        return tool({
            description: 'Can perform all browser related tasks.',
            parameters: z.object({
                instruction: z.string().describe(
                    'The detailed task for the BrowserAgent browser agent to perform. Example: "Go to github.com, search for `vercel/ai`, and click on the main repository link."'
                ),
            }),
            execute: async ({ instruction }) => {
                console.log("Received instruction for BrowserAgent automation...");
                return await this.executeBrowserInstruction(instruction);
            },
        });
    }
}