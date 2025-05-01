import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch,
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FormattedAppointment } from './interfaces/formatted-appointment.interface';
import { Appointment } from './schemas/appointment.schema';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async findAll(@Query() query: any): Promise<FormattedAppointment[]> {
    // Handle filtering by date if provided
    if (query.date) {
      try {
        const date = new Date(query.date);
        return this.appointmentsService.findByDate(date);
      } catch (error) {
        throw new BadRequestException('Invalid date format');
      }
    }

    // Filter by dentist if provided
    if (query.dentist) {
      return this.appointmentsService.findByDentist(query.dentist);
    }

    // Filter by patient if provided
    if (query.patient) {
      return this.appointmentsService.findByPatient(query.patient);
    }

    // Return all appointments
    return this.appointmentsService.findAll();
  }

  @Get('my-appointments')
  async getMyAppointments(@Request() req): Promise<FormattedAppointment[]> {
    const userId = req.user.userId;
    return this.appointmentsService.findByPatient(userId);
  }

  @Get('dentist/:dentistId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async getAppointmentsByDentist(@Param('dentistId') dentistId: string, @Request() req): Promise<FormattedAppointment[]> {
    // Optional: Check permission if it's not the dentist's own appointments
    if (req.user.role !== 'admin' && req.user.userId !== dentistId) {
      throw new BadRequestException('You can only view your own appointments');
    }
    
    return this.appointmentsService.findByDentist(dentistId);
  }

  @Get('dentist-schedule')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async getDentistSchedule(@Request() req): Promise<FormattedAppointment[]> {
    const userId = req.user.userId;
    return this.appointmentsService.findByDentist(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FormattedAppointment> {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req
  ): Promise<Appointment> {
    // Additional validation could be added here
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'dentist')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ): Promise<Appointment> {
    if (!['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      throw new BadRequestException('Invalid status value');
    }
    
    return this.appointmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.remove(id);
  }
}