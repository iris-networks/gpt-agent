import { CoreMessage } from 'ai';

/**
 * Prunes images from messages to keep only the last two image messages
 * Completely removes old images for better memory efficiency
 */
export function pruneImages(messages: CoreMessage[]): CoreMessage[] {
    const imageMessages = messages.filter(m => 
        Array.isArray(m.content) && m.content.some((p: any) => p.type === 'image')
    );
    
    if (imageMessages.length > 2) {
        const latestTwo = imageMessages.slice(-2);
        return messages.filter(m => 
            !Array.isArray(m.content) || 
            m.content.every((p: any) => p.type !== 'image') ||
            latestTwo.includes(m)
        );
    }
    return messages;
}