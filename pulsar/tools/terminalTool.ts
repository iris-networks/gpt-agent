import { DynamicTool, StringToolOutput } from "beeai-framework";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs";

const execPromise = promisify(exec);

export const terminalTool = new DynamicTool({
    name: "terminalTool",
    description: "Can run applications created by the codeTool in a terminal.",
    inputSchema: z.object({
        "appName": z.string().describe("Name of the app to run"),
        "directory": z.string().optional().describe("Directory where the app is located. Defaults to ~/Documents/zenobia_app if not provided"),
        "command": z.string().optional().describe("Command to run the app. Defaults to 'npm start' if not provided")
    }).required(),
    async handler(input) {
        try {
            const { appName, directory = "~/Documents/zenobia_app", command = "npm start" } = input;
            
            // Resolve the directory path
            const resolvedDirectory = directory.startsWith("~") 
                ? directory.replace("~", process.env.HOME || "")
                : directory;
            
            // Check if the app directory exists
            const appDirectory = path.join(resolvedDirectory, appName);
            if (!fs.existsSync(appDirectory)) {
                return new StringToolOutput(`Error: App directory '${appDirectory}' does not exist. Make sure the app has been created using the codeTool.`);
            }
            
            // Execute the command in the app directory
            const execCommand = `cd "${appDirectory}" && ${command}`;
            
            const { stdout, stderr } = await execPromise(execCommand);
            
            if (stderr && !stdout) {
                return new StringToolOutput(`Error running app '${appName}': ${stderr}`);
            }
            
            return new StringToolOutput(`Successfully ran app '${appName}' with command '${command}'\nOutput: ${stdout}\n${stderr ? `Warnings/Info: ${stderr}` : ''}`);
        } catch (error: any) {
            return new StringToolOutput(`Failed to run app: ${error.message}`);
        }
    }
});