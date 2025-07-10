import { Module } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ToolsFactory } from './ToolsFactory';
import { TerminalAgentTool } from './TerminalAgentTool';
import { QutebrowserAgentTool } from './QutebrowserAgentTool';
import { ExcelAgent } from './ExcelAgent';


@Module({
  providers: [
    GuiAgentTool,
    ExcelAgent,
    ToolsFactory,
    TerminalAgentTool,
    QutebrowserAgentTool
  ],
  exports: [
    GuiAgentTool,
    ExcelAgent,
    ToolsFactory,
    TerminalAgentTool,
    QutebrowserAgentTool
  ],
})
export class ToolsModule {}