import { CoreMessage } from 'ai';

// This is a helper type to get the array part of the CoreMessage['content'] union
type MessageContentPart = Exclude<CoreMessage['content'], string>[number];

export class QutebrowserMessagePruner {
    /**
     * Prunes the message history to keep only the most recent images.
     * This is crucial for models with limited context windows when dealing with
     * large base64-encoded images. It works with the manual message
     * structure where images are part of a 'user' role message.
     *
     * @param messages The array of CoreMessages to prune.
     * @param maxImages The maximum number of recent images to keep. Defaults to 3.
     * @returns A new array of CoreMessages with older images replaced by a placeholder.
     */
    static pruneImageMessages(messages: CoreMessage[], maxImages: number = 3): CoreMessage[] {
        let imageCount = 0;

        // Create a deep copy to avoid mutating the original array, then reverse it
        // to find the newest images first.
        return JSON.parse(JSON.stringify(messages)).reverse().map((msg: CoreMessage) => {
            // The new message structure for a screenshot is a 'user' role
            // with a content array that includes an object of type 'image'.
            const hasImage =
                msg.role === 'user' &&
                Array.isArray(msg.content) &&
                msg.content.some(part => part.type === 'image');

            if (!hasImage) {
                return msg; // Not an image message, so we keep it as is.
            }

            // If it's an image message, check if we're within our keep limit.
            if (imageCount < maxImages) {
                imageCount++;
                return msg; // This is a recent image, so we keep the full message.
            }

            // This is an older image message that needs to be pruned.
            // We know from the `hasImage` check that msg.content is an array.
            const contentParts = msg.content as MessageContentPart[];

            // Filter out the image parts and keep only text parts.
            const newContent = contentParts.filter(part => part.type !== 'image');

            // Add a placeholder to inform the model that an image was removed.
            newContent.push({
                type: 'text',
                text: '[An older screenshot was here but has been removed to save context space.]'
            });

            return {
                ...msg,
                content: newContent,
            };
        }).reverse(); // Restore the original chronological order of messages.
    }
}