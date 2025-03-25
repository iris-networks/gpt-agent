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
        
        // Find system messages and first message indices
        const systemMessageIndices = this._messages
            .map((msg, index) => msg.role === 'system' ? index : -1)
            .filter(index => index !== -1);
        
        const preservedIndices = [...systemMessageIndices];
        if (this._messages.length > 0) {
            preservedIndices.push(0); // Preserve the first message
        }
        
        // If no preserved messages or still over size after keeping preserved messages
        if (preservedIndices.length === 0) {
            while (this._messages.length > this.size) {
                this._messages.splice(1, 1); // Remove second message onwards
            }
            return;
        }
        
        // Keep preserved messages and remove others until under size
        const lastPreservedIndex = Math.max(...preservedIndices);
        
        // Remove messages after preserved messages until under size
        let currentIndex = lastPreservedIndex + 1;
        while (this._messages.length > this.size && currentIndex < this._messages.length) {
            this._messages.splice(currentIndex, 1);
        }
        
        // If still over size, remove non-preserved messages between preserved ones
        if (this._messages.length > this.size) {
            const toRemove = this._messages.length - this.size;
            const nonPreservedIndices = this._messages
                .slice(1, lastPreservedIndex) // Start from index 1 to preserve first message
                .map((msg, idx) => !preservedIndices.includes(idx + 1) ? idx + 1 : -1)
                .filter(idx => idx !== -1);
            
            for (let i = 0; i < Math.min(toRemove, nonPreservedIndices.length); i++) {
                this._messages.splice(nonPreservedIndices[i] - i, 1);
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