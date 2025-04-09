import { DynamicTool, StringToolOutput } from "beeai-framework";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execPromise = promisify(exec);

export const codeTool = new DynamicTool({
    name: "codeTool",
    description: "Can write code for an app / script given a requirement.",
    inputSchema: z.object({
        "text": z.string().describe("Description of what is to be written. Example, create a todo app"),
        "appName": z.string().describe("Name of the app")
    }).required(),
    async handler(input) {
        try {
            const { text, appName } = input;
            const command = `cd ~/Documents/zenobia_app && aider "${text}"`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                return new StringToolOutput(`Error executing aider command: ${stderr}`);
            }
            
            return new StringToolOutput(`Successfully executed aider command for app "${appName}".\nOutput: ${stdout}`);
        } catch (error: any) {
            return new StringToolOutput(`Failed to execute aider command: ${error.message}`);
        }
    }
});