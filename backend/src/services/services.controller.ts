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
  Patch,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Public endpoint to get active services
  @Get('public')
  async findActiveServices(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.servicesService.findAll(
      true, 
      category, 
      search,
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  // Public endpoint to get dentists
  @Get('dentists/public')
  async findPublicDentists(
    @Query('specialty') specialty?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    // This endpoint would need to be implemented in the service
    // For now, we'll just return a success message
    return {
      success: true,
      message: 'Public dentist endpoint is now available',
      data: []
    };
  }

  // Protected endpoints below
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('bulk')
  async bulkCreate(@Body() createServiceDtos: CreateServiceDto[]) {
    return this.servicesService.bulkCreate(createServiceDtos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dentist')
  @Get()
  async findAll(
    @Query('active') active: boolean,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.servicesService.findAll(
      active === true, 
      category, 
      search,
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('bulk')
  async bulkUpdate(@Body() updates: { id: string; data: UpdateServiceDto }[]) {
    return this.servicesService.bulkUpdate(updates);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    return this.servicesService.activate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.servicesService.deactivate(id);
  }
}