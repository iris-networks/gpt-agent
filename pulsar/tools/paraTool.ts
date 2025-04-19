import { DynamicTool, StringToolOutput } from "beeai-framework";

import { z } from "zod";
import {keyboard} from "@computer-use/nut-js";


export const paraTool = new DynamicTool({
    name: "paraTool",
    description: "Used for typing text in a text field.",
    inputSchema: z.object({
        "text": z.string().describe("The exact text to type"),
    }).required(),
    async handler(input) {
        keyboard.config.autoDelayMs = 10;
        try {
            await keyboard.type(input.text);
            return new StringToolOutput(`Typed: ${input.text}`)
        }catch(e) {
            console.trace("Something went wrong!!")
            return new StringToolOutput(`Error: ${e}`)
        }
        
    }
});