import { tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import * as TelegramBot from 'node-telegram-bot-api';

export interface HITLToolOptions {
    statusCallback: (message: string, status: StatusEnum) => void;
    abortController: AbortController;
}


@Injectable()
export class HITLTool extends BaseTool {
    private telegramBotToken: string;
    private telegramChatId: string;
    private pollTimeout: number;
    private pollInterval: number;
    private bot: TelegramBot;
    private sentMessageIds: Set<number> = new Set();

    constructor(options: HITLToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });

        // Read configuration from environment variables and constants
        this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
        this.pollTimeout = DEFAULT_CONFIG.HITL_POLL_TIMEOUT;
        this.pollInterval = DEFAULT_CONFIG.HITL_POLL_INTERVAL;

        if (!this.telegramBotToken || !this.telegramChatId) {
            console.warn('[HITLTool] Telegram bot token or chat ID not configured. Tool will not function properly.');
        }

        // Initialize Telegram Bot
        this.bot = new TelegramBot(this.telegramBotToken, { polling: false });

        console.log('[HITLTool] Human-in-the-Loop tool initialized with Telegram integration');
    }

    /**
     * Send notification to Telegram
     */
    private async sendTelegramNotification(message: string): Promise<boolean> {
        if (!this.telegramBotToken || !this.telegramChatId) {
            console.error('[HITLTool] Telegram credentials not configured');
            return false;
        }

        try {
            const sentMessage = await this.bot.sendMessage(this.telegramChatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: 'Type your response here...'
                }
            });

            // Store the message ID to track replies
            this.sentMessageIds.add(sentMessage.message_id);

            console.log('[HITLTool] Telegram notification sent successfully');
            console.log('[HITLTool] Sent message ID:', sentMessage.message_id);
            console.log('[HITLTool] Tracking message IDs:', Array.from(this.sentMessageIds));
            return true;
        } catch (error: any) {
            console.error('[HITLTool] Failed to send Telegram notification:', error.message);
            return false;
        }
    }

    /**
     * Poll for new messages from Telegram
     */
    private async pollTelegramMessages(): Promise<string | null> {
        if (!this.telegramBotToken) {
            console.error('[HITLTool] Telegram bot token not configured');
            return null;
        }

        try {
            const updates = await this.bot.getUpdates({
                timeout: 30,
                limit: 10,
            });

            console.log('[HITLTool] Polling for updates, found:', updates.length);

            if (updates.length > 0) {
                let replyMessage: string | null = null;
                let maxUpdateId = 0;

                // Process all updates to find the reply to our original message
                for (const update of updates) {
                    maxUpdateId = Math.max(maxUpdateId, update.update_id);
                    
                    // Handle text messages (replies to bot messages)
                    if (update.message && 
                        update.message.chat.id.toString() === this.telegramChatId && 
                        update.message.text &&
                        update.message.reply_to_message &&
                        this.sentMessageIds.has(update.message.reply_to_message.message_id)) {
                        
                        console.log('[HITLTool] Received response from user:', update.message.text);
                        replyMessage = update.message.text;
                        break;
                    }
                }

                // Flush all processed messages
                if (maxUpdateId > 0) {
                    await this.bot.getUpdates({ offset: maxUpdateId + 1 });
                    console.log('[HITLTool] Flushed messages up to update ID:', maxUpdateId);
                }

                return replyMessage;
            }

            return null;
        } catch (error: any) {
            console.error('[HITLTool] Failed to poll Telegram messages:', error.message);
            return null;
        }
    }

    /**
     * Wait for human response with timeout and polling
     */
    private async waitForHumanResponse(context: string, question: string): Promise<string> {
        const notificationMessage = `🤖 **Human Assistance Required**\n\n**Context:** ${context}\n\n**Question:** ${question}\n\n⏰ Please respond within ${this.pollTimeout / 1000 / 60} minutes.\n\n💬 **Please reply to this message with your response.**`;
        
        // Send notification
        const notificationSent = await this.sendTelegramNotification(notificationMessage);
        if (!notificationSent) {
            throw new Error('Failed to send Telegram notification');
        }

        this.emitStatus('📱 Notification sent to human via Telegram', StatusEnum.RUNNING);

        const startTime = Date.now();
        const endTime = startTime + this.pollTimeout;

        while (Date.now() < endTime) {
            // Check if operation was aborted
            if (this.abortController.signal.aborted) {
                throw new Error('Operation aborted by user');
            }

            // Poll for response
            const response = await this.pollTelegramMessages();
            if (response) {
                this.emitStatus('✅ Human response received', StatusEnum.RUNNING);
                return response;
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        }

        // Timeout reached - abort the entire operation
        const timeoutMessage = `⏰ **Timeout Alert**\n\nNo response received within ${this.pollTimeout / 1000 / 60} minutes for:\n\n**Context:** ${context}\n\n**Question:** ${question}\n\n❌ **Operation Aborted** - Human assistance required but no response received.`;
        await this.sendTelegramNotification(timeoutMessage);
        
        // Abort the entire operation
        this.abortController.abort();
        throw new Error(`Human response timeout after ${this.pollTimeout / 1000 / 60} minutes - Operation aborted`);
    }

    /**
     * Request human assistance
     */
    private async requestHumanAssistance(context: string, question: string, options?: { 
        defaultAction?: string,
        urgency?: 'low' | 'medium' | 'high'
    }): Promise<string> {
        console.log(`[HITLTool] Requesting human assistance for: ${question}`);
        
        const urgencyEmoji = options?.urgency === 'high' ? '🚨' : options?.urgency === 'medium' ? '⚠️' : '💡';
        this.emitStatus(`${urgencyEmoji} Requesting human assistance...`, StatusEnum.RUNNING);

        try {
            const response = await this.waitForHumanResponse(context, question);
            
            // Send confirmation
            const confirmationMessage = `✅ **Response Received**\n\n**Your instruction:** ${response}\n\n🤖 Proceeding with your guidance...`;
            await this.sendTelegramNotification(confirmationMessage);
            
            return response;
        } catch (error: any) {
            console.error('[HITLTool] Error getting human response:', error.message);
            
            // No default action - always abort on timeout or error
            this.emitStatus('❌ Human assistance failed - Operation aborted', StatusEnum.ERROR);
            throw error;
        }
    }

    getToolDefinition() {
        return tool({
            description: 'Request human assistance when the agent encounters a situation that requires human judgment, decision-making, or clarification. This tool sends a notification via Telegram and waits for a human response. If no response is received within the timeout period, the entire operation will be aborted.',
            parameters: z.object({
                context: z.string().describe(
                    'The context or situation that requires human assistance. Be specific about what the agent was trying to do and what challenge it encountered.'
                ),
                question: z.string().describe(
                    'The specific question or request for the human. Be clear and actionable.'
                ),
                defaultAction: z.string().optional().describe(
                    'DEPRECATED - No longer used. If no human response is received, the operation will be aborted.'
                ),
                urgency: z.enum(['low', 'medium', 'high']).optional().describe(
                    'The urgency level of the request. Defaults to medium.'
                )
            }),
            execute: async ({ context, question, defaultAction, urgency = 'medium' }) => {
                console.log('[HITLTool] Executing human assistance request...');
                
                try {
                    const response = await this.requestHumanAssistance(context, question, {
                        defaultAction,
                        urgency
                    });
                    
                    return {
                        success: true,
                        response: response,
                        source: 'human'
                    };
                } catch (error: any) {
                    console.error('[HITLTool] Human assistance request failed:', error.message);
                    
                    // Always fail - no default action fallback
                    return {
                        success: false,
                        error: error.message,
                        source: 'error'
                    };
                }
            },
        });
    }
}