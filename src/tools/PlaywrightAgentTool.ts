import { generateText, StepResult, tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { experimental_createMCPClient as createMCPClient } from 'ai';
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
        
        this.emitStatus('🎭 Browser Agent ready for action', StatusEnum.RUNNING);
    }

    private async initializeMCP() {
        const mcpClient = await createMCPClient({
            "name": "Browser MCP Agent",
            "transport": {
                "type": "sse",
                "url": "http://localhost:8931/sse"
            }
        });

        this.mcpTools = await mcpClient.tools();
        // Add HITL tool
        this.mcpTools.hitlTool = this.hitlTool.getToolDefinition();
        console.log('[BrowserAgent] MCP client initialized with HITL tool support');
    }

    private async executeBrowserInstruction(instruction: string) {
        this.emitStatus('🎯 Starting browser mission...', StatusEnum.RUNNING);

        try {
            await this.initializeMCP();

            const systemPrompt = "You are a browser automation agent. Your role is to execute browser actions based on user instructions or contact human if you are stuck";

            const { text } = await generateText({
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
            return text;
        } catch (error: any) {
            console.error('[BrowserAgent] Error executing browser instruction:', error);
            const errorMessage = `Error processing BrowserAgent browser instruction: ${error.message}`;
            this.emitStatus('💥 BrowserAgent encountered an unexpected plot twist', StatusEnum.ERROR);
            return { summary: errorMessage };
        }
    }

    getToolDefinition() {
        return tool({
            description: 'BrowserAgent browser automation agent using MCP (Model Context Protocol) for reliable web interactions through accessibility tree navigation.',
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