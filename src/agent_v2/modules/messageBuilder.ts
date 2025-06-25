import { CoreMessage } from 'ai';

export class MessageBuilder {
    private systemPrompt: string;

    constructor(systemPrompt: string) {
        this.systemPrompt = systemPrompt;
    }

    /**
     * Build initial messages for the first iteration
     */
    buildInitialMessages(userMessage: string, initialScreenshot: string): CoreMessage[] {
        return [
            {
                role: 'system',
                content: this.systemPrompt
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: userMessage },
                    { type: 'image', image: initialScreenshot }
                ]
            }
        ];
    }

    /**
     * Build messages for subsequent iterations
     */
    buildIterationMessages(
        userMessage: string,
        cumulativeSummary: string,
        currentScreenshot: string,
        previousScreenshot: string
    ): CoreMessage[] {
        return [
            {
                role: 'system',
                content: this.systemPrompt
            },
            {
                role: 'user',
                content: userMessage
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Previous screenshot' },
                    { type: 'image', image: previousScreenshot },
                    { type: 'text', text: 'Current screenshot' },
                    { type: 'image', image: currentScreenshot },
                    { type: 'text', text: `Here is the summary of all steps taken in the past: ${cumulativeSummary}, plan your next steps accordingly.` }
                ]
            },
        ];
    }
}