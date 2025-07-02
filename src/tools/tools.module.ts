import { Module } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ExcelTool } from './ExcelTool';
import { ToolsFactory } from './ToolsFactory';
import { TerminalAgentTool } from './TerminalAgentTool';


@Module({
  providers: [
    GuiAgentTool,
    ExcelTool,
    ToolsFactory,
    TerminalAgentTool
  ],
  exports: [
    GuiAgentTool,
    ExcelTool,
    ToolsFactory,
    TerminalAgentTool
  ],
})
export class ToolsModule {}