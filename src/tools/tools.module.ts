import { Module } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ExcelTool } from './ExcelTool';
import { ToolsFactory } from './ToolsFactory';
import { TerminalAgentTool } from './TerminalAgentTool';
import { QutebrowserAgentTool } from './QutebrowserAgentTool';


@Module({
  providers: [
    GuiAgentTool,
    ExcelTool,
    ToolsFactory,
    TerminalAgentTool,
    QutebrowserAgentTool
  ],
  exports: [
    GuiAgentTool,
    ExcelTool,
    ToolsFactory,
    TerminalAgentTool,
    QutebrowserAgentTool
  ],
})
export class ToolsModule {}