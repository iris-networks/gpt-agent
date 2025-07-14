import { streamText, tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HITLTool } from './HITLTool';
import { google } from '@ai-sdk/google';
import {
    experimental_createMCPClient as createMCPClient,
} from 'ai';

interface ExcelAgentOptions {
  statusCallback: AgentStatusCallback;
  abortController: AbortController;
}

@Injectable()
export class ExcelAgent extends BaseTool {
  private mcpTools: any;
  private mcpClient = null;
  private hitlTool: HITLTool;

  constructor(options: ExcelAgentOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
    
    this.hitlTool = new HITLTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController,
    });
    
    this.emitStatus(`Excel Agent initialized`, StatusEnum.INIT);
  }

  private async initializeMCP() {
    try {
      this.emitStatus('Starting excel agent...', StatusEnum.RUNNING);
      
      const mcpClient = await createMCPClient({
        transport: new StdioClientTransport({
          command: "uvx",
          args: ["excel-mcp-server", "stdio"],
        }),
      });

      this.mcpClient = mcpClient;
      this.mcpTools = await mcpClient.tools();
      
      // Add HITL tool for human assistance when needed
      this.mcpTools.hitlTool = this.hitlTool.getToolDefinition();
      
      console.log('[ExcelAgent] MCP client initialized with Excel tools and HITL support');
    } catch (error) {
      this.emitStatus(`${error.message}`, StatusEnum.ERROR);
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert Excel agent with access to comprehensive Excel manipulation tools through the Model Context Protocol (MCP).

CORE CAPABILITIES:
- Excel file reading and writing (XLSX format)
- Worksheet management (create, read, update, delete)
- Cell operations (individual cells and ranges)
- Row and column operations
- Data validation and formatting
- Formula execution and calculation
- Chart and pivot table creation
- Data analysis and manipulation

OPERATIONAL PHILOSOPHY:
1. **File-first approach**: Always start by loading or creating an Excel workbook
2. **Surgical precision**: Use specific tools for specific operations
3. **Data integrity**: Validate data before operations
4. **Error handling**: Gracefully handle file I/O and data errors
5. **Efficiency**: Batch operations when possible
6. **Transparency**: Provide clear feedback on all operations

WORKFLOW PATTERNS:

File Operations:
- Load existing: Use read_excel tool with file path
- Create new: Use create_workbook tool
- Save changes: Use write_excel tool
- Get info: Use get_workbook_info for metadata

Data Manipulation:
- Read data: Use read_range for specific areas
- Write data: Use write_range for bulk operations
- Single cells: Use read_cell and write_cell
- Row operations: Use insert_row, delete_row, update_row
- Column operations: Use insert_column, delete_column

Advanced Operations:
- Formulas: Use set_formula and calculate tools
- Formatting: Use format_cells for styling
- Charts: Use create_chart for visualizations
- Data validation: Use set_validation rules
- Pivot tables: Use create_pivot_table

ERROR HANDLING:
- File not found: Suggest creating new workbook
- Invalid ranges: Validate cell references
- Permission errors: Check file accessibility
- Data type errors: Suggest data conversion

BEST PRACTICES:
1. Always validate file paths and ranges before operations
2. Use meaningful worksheet and range names
3. Provide progress updates for long operations
4. Save backup copies for destructive operations
5. Use appropriate data types for values
6. Handle edge cases (empty cells, merged cells, etc.)

HUMAN INTERACTION:
- Use hitlTool when you need clarification on user requirements
- Ask for confirmation before destructive operations
- Provide clear summaries of what was accomplished
- Suggest next steps or related operations

Remember: You are working with real Excel files - be precise, careful, and always validate your operations. Don't use commentary, just respond with answers each time`;
  }

  /**
   * Execute natural language instruction by calling the AI model with Excel tools.
   */
  private async executeInstruction(instruction: string, maxSteps: number): Promise<string> {
    try {
      this.emitStatus('Starting Excel operation...', StatusEnum.RUNNING);
      
      console.log("Excel MCP initializing");
      await this.initializeMCP();

      const result = streamText({
        model: google('gemini-2.5-flash'),
        tools: this.mcpTools,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: instruction
          }
        ],
        maxSteps: maxSteps,
        abortSignal: this.abortController.signal
      });

      let fullText = '';
      for await (const textPart of result.textStream) {
        fullText += textPart;
      }

      // Clean up MCP connection
      if (this.mcpClient) {
        await this.mcpClient.close();
      }
      
      this.emitStatus('Excel operation completed', StatusEnum.END)
      return fullText;
    } catch (error) {
      this.emitStatus(`Excel operation failed: ${error.message}`, StatusEnum.ERROR);
      
      // Clean up on error
      if (this.mcpClient) {
        try {
          await this.mcpClient.close();
        } catch (closeError) {
          console.error('Error closing MCP client:', closeError);
        }
      }
      
      return `Error: ${error.message}`;
    }
  }

  getToolDefinition() {
    return tool({
      description: 'Expert Excel agent with comprehensive spreadsheet manipulation capabilities',
      parameters: z.object({
        instruction: z.string().describe(
          'A high-level command for Excel operations (e.g., "create a sales report", "analyze Q4 data", "format the budget spreadsheet")'
        ),
        maxSteps: z.number().describe('The maximum number of steps needed to complete the Excel operation').min(2).max(10),
      }),
      execute: async ({ instruction, maxSteps }) => this.executeInstruction(instruction, maxSteps),
    });
  }
}