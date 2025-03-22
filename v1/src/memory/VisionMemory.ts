import { BaseMemory } from "beeai-framework/memory/base";
import { Message } from "beeai-framework/backend/message";
import { shallowCopy } from "beeai-framework/serializer/utils";


export class VisionMemory extends BaseMemory {
    private size: number;
    private _messages: Message[] = [];
    
    constructor(size?: number) {
        super();
        this.size = size || 10;
    }
    
    get messages(): readonly Message[] {
        return [...this._messages];
    }

    async add(message: Message, index?: number): Promise<void> {
        // If index is provided, insert at that position
        if (index !== undefined) {
            this._messages.splice(index, 0, message);
        } else {
            this._messages.push(message);
        }
        
        // Manage memory by removing all but the last image message
        this.removeAllButLastImageMessage();
        
        // If still over size limit, remove messages after system message
        this.trimToSize();
    }

    private removeAllButLastImageMessage(): void {
        // Find all image messages
        const imageMessages = this._messages.filter(msg => 
            msg.content.some(content => content.type=="image")
        );
        
        // If we have more than one image message
        if (imageMessages.length > 1) {
            // Keep only the last image message
            const lastImageMessage = imageMessages[imageMessages.length - 1];
            
            // Remove all other image messages
            this._messages = this._messages.filter(msg => 
                msg === lastImageMessage || 
                !msg.content.some(content => content.type=="image")
            );
        }
    }

    private trimToSize(): void {
        if (this._messages.length <= this.size) {
            return;
        }
        
        // Find system messages
        const systemMessageIndices = this._messages
            .map((msg, index) => msg.role === 'system' ? index : -1)
            .filter(index => index !== -1);
        
        // If no system messages or still over size after keeping system messages
        if (systemMessageIndices.length === 0) {
            // Remove oldest messages until we're under size
            while (this._messages.length > this.size) {
                this._messages.shift();
            }
            return;
        }
        
        // Keep system messages and remove others until under size
        const lastSystemIndex = Math.max(...systemMessageIndices);
        
        // If we're still over size, remove messages after system messages
        let currentIndex = lastSystemIndex + 1;
        while (this._messages.length > this.size && currentIndex < this._messages.length) {
            this._messages.splice(currentIndex, 1);
            // Don't increment currentIndex since we removed an element
        }
        
        // If still over size, remove from beginning (excluding system messages)
        if (this._messages.length > this.size) {
            const toRemove = this._messages.length - this.size;
            // Find non-system messages before lastSystemIndex
            const nonSystemIndices = this._messages
                .slice(0, lastSystemIndex)
                .map((msg, idx) => msg.role !== 'system' ? idx : -1)
                .filter(idx => idx !== -1);
            
            // Remove oldest non-system messages
            for (let i = 0; i < Math.min(toRemove, nonSystemIndices.length); i++) {
                // @ts-ignore
                this._messages.splice(nonSystemIndices[i] - i, 1);
            }
        }
    }

    async delete(message: Message): Promise<boolean> {
        const index = this._messages.indexOf(message);
        if (index !== -1) {
            this._messages.splice(index, 1);
            return true;
        }
        return false;
    }

    reset(): void {
        this._messages = [];
    }

    createSnapshot(): unknown {
        return { 
            size: this.size, 
            messages: shallowCopy(this._messages) 
        };
    }

    loadSnapshot(state: ReturnType<typeof this.createSnapshot>): void {
        Object.assign(this, state);
    }
}