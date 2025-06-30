import { Module } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { FileSystemTool } from './FileSystemTool';
import { ExcelTool } from './ExcelTool';
import { HumanLayerTool } from './HumanLayerTool';
import { ApplicationLauncherTool } from './ApplicationLauncherTool';
import { ToolsFactory } from './ToolsFactory';

@Module({
  providers: [
    GuiAgentTool,
    FileSystemTool,
    ExcelTool,
    HumanLayerTool,
    ApplicationLauncherTool,
    ToolsFactory
  ],
  exports: [
    GuiAgentTool,
    FileSystemTool,
    ExcelTool,
    HumanLayerTool,
    ApplicationLauncherTool,
    ToolsFactory
  ],
})
export class ToolsModule {}