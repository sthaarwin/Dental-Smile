import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.schedulesService.findAll();
  }

  @Get('dentist/:id')
  async findByDentist(@Param('id') id: string) {
    return this.schedulesService.findByDentist(id);
  }

  @Get('my-schedule')
  @UseGuards(RolesGuard)
  @Roles('dentist')
  async getMySchedule(@Request() req) {
    return this.schedulesService.findByDentist(req.user.userId);
  }

  @Put('dentist/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async updateSchedule(
    @Param('id') id: string,
    @Body() scheduleData: any,
    @Request() req
  ) {
    // Allow dentists to update only their own schedule
    if (req.user.role === 'dentist' && req.user.userId !== id) {
      throw new BadRequestException('You can only update your own schedule');
    }
    
    return this.schedulesService.createOrUpdate(id, scheduleData);
  }

  @Post('dentist/:id/day-off')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async addDayOff(
    @Param('id') id: string,
    @Body('date') dateStr: string,
    @Request() req
  ) {
    // Allow dentists to update only their own schedule
    if (req.user.role === 'dentist' && req.user.userId !== id) {
      throw new BadRequestException('You can only update your own schedule');
    }
    
    try {
      const date = new Date(dateStr);
      return this.schedulesService.addDayOff(id, date);
    } catch (error) {
      throw new BadRequestException('Invalid date format');
    }
  }

  @Post('dentist/:id/remove-day-off')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async removeDayOff(
    @Param('id') id: string,
    @Body('date') dateStr: string,
    @Request() req
  ) {
    // Allow dentists to update only their own schedule
    if (req.user.role === 'dentist' && req.user.userId !== id) {
      throw new BadRequestException('You can only update your own schedule');
    }
    
    try {
      const date = new Date(dateStr);
      return this.schedulesService.removeDayOff(id, date);
    } catch (error) {
      throw new BadRequestException('Invalid date format');
    }
  }

  @Get('availability')
  async checkAvailability(
    @Query('dentistId') dentistId: string,
    @Query('date') dateStr: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    try {
      const date = new Date(dateStr);
      const isAvailable = await this.schedulesService.isDentistAvailable(
        dentistId,
        date,
        startTime,
        endTime
      );
      
      return { available: isAvailable };
    } catch (error) {
      throw new BadRequestException('Invalid parameters or format');
    }
  }
  
  @Post('dentist/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async addTimeSlot(
    @Param('id') id: string,
    @Body() timeSlotData: any,
    @Request() req
  ) {
    // Allow dentists to add slots only to their own schedule
    if (req.user.role === 'dentist' && req.user.userId !== id) {
      throw new BadRequestException('You can only modify your own schedule');
    }
    
    return this.schedulesService.addTimeSlot(id, timeSlotData);
  }

  @Delete('dentist/:id/:slotId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async deleteTimeSlot(
    @Param('id') id: string,
    @Param('slotId') slotId: string,
    @Request() req,
    @Body() data?: { day?: string }
  ) {
    // Allow dentists to delete slots only from their own schedule
    if (req.user.role === 'dentist' && req.user.userId !== id) {
      throw new BadRequestException('You can only modify your own schedule');
    }
    
    return this.schedulesService.deleteTimeSlot(id, slotId, data?.day);
  }

  @Put('dentist/:id/time-slot')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async updateTimeSlot(
    @Param('id') id: string,
    @Body() timeSlotData: any,
    @Request() req
  ) {
    if (req.user.role === 'dentist' && req.user.userId !== id) {
      throw new BadRequestException('You can only modify your own schedule');
    }
    
    return this.schedulesService.updateTimeSlot(id, timeSlotData);
  }
}