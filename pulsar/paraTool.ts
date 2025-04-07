import { DynamicTool, StringToolOutput } from "beeai-framework";

import { z } from "zod";
import {keyboard} from "@computer-use/nut-js";


keyboard.config.autoDelayMs = 10;
export const paraTool = new DynamicTool({
    name: "paraTool",
    description: "Should be used to instruct user to type on the computer screen, this types exactly where the cursor is presently located. Should be called once the cursor has been moved to the desired location.",
    inputSchema: z.object({
        "text": z.string().describe("The text to type"),
    }).required(),
    async handler(input) {
        await keyboard.type(input.text);
        return new StringToolOutput(`Typed: ${input.text}`)
    }
});