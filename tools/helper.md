```ts
function pruneImages(messages: Message[]) {
  const imageMessages = messages.filter(m =>
    m.parts?.some(p => p.type === 'image')
  );
  // If more than 2 images, drop older ones
  if (imageMessages.length > 2) {
    const latestTwo = imageMessages.slice(-2);
    // Reconstruct messages: keep non-image, and only the 2 latest image messages
    return messages.filter(m =>
      m.parts?.every(p => p.type !== 'image') ||
      latestTwo.includes(m)
    );
  }
  return messages;
}






import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

function pruneImages(messages) { /* as above */ }

const generateImage = tool({
  description: 'Generate an image',
  parameters: z.object({ prompt: z.string() }),
  execute: async ({ prompt }) => {
    const { image } = await experimental_generateImage({
      model: openai.image('dall-e-3'),
      prompt
    });
    return { image: image.base64, prompt };
  }
});

async function chatWithImages(messages) {
  pruneImages(messages);
  const result = await generateText({
    model: openai('gpt-4o'),
    messages,
    tools: { generateImage },
    maxSteps: 4,
    onStepFinish({ toolCalls, toolResults, text: msg }) {
      if (msg) messages.push({ role: 'assistant', content: msg });
      toolResults.forEach(res =>
        messages.push({
          role: 'assistant',
          parts: [{ type: 'image', image: res.image }]
        })
      );
      // Prune images here too
      const pruned = pruneImages(messages);
      messages.splice(0, messages.length, ...pruned);
    }
  });
  return result;
}

```