import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Logger, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DentistsService } from './dentists.service';

@Controller('dentists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DentistsController {
  private readonly logger = new Logger(DentistsController.name);
  
  constructor(private readonly dentistsService: DentistsService) {}

  @Get('applications')
  @Roles('admin')
  async getDentistApplications() {
    return this.dentistsService.findAllApplications();
  }

  @Patch('applications/:id/status')
  @Roles('admin')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() data: { status: 'approved' | 'rejected' }
  ) {
    this.logger.log(`Updating application ${id} status to ${data.status}`);
    return this.dentistsService.updateApplicationStatus(id, data.status);
  }
}