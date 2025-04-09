import * as fs from 'fs';
import * as path from 'path';

/**
 * Saves conversation messages to a log file
 * @param messages The messages to log
 * @param baseDir The base directory to store logs
 * @param iterationCount The current iteration count
 * @returns The path to the saved log file
 */
export const saveMessagesToLog = (messages: any[], baseDir: string, iterationCount: number): string => {
    const logsDir = path.join(baseDir, 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create a timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logsDir, `conversation-${timestamp}-iteration-${iterationCount}.json`);
    
    // Write to file
    fs.writeFileSync(logFile, JSON.stringify(messages, null, 2));
    console.log(`Messages written to ${logFile}`);
    
    return logFile;
};