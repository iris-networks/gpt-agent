import { Controller, Get, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { getActiveRequests, resumeExecution } from '../../../tools/humanLayerTool';

@ApiTags('Human Layer')
@Controller('human-layer')
export class HumanLayerController {
  @Get('requests')
  @ApiOperation({ summary: 'Get all pending human layer requests' })
  @ApiResponse({ status: 200, description: 'List of pending requests' })
  getRequests() {
    return getActiveRequests();
  }

  @Post(':requestId/approve')
  @ApiOperation({ summary: 'Approve a pending human layer request' })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  @ApiResponse({ status: 404, description: 'Request not found or already handled' })
  approveRequest(@Param('requestId') requestId: string) {
    const success = resumeExecution(requestId);
    
    if (!success) {
      throw new HttpException(
        'Request not found or already handled',
        HttpStatus.NOT_FOUND,
      );
    }
    
    return { success: true, message: 'Request approved successfully' };
  }
}