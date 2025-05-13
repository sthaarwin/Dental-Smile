import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Logger,
  Request,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => {
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password, ...result } = userObj;
      return result;
    });
  }
  
  @Get('me')
  async getCurrentUser(@Request() req) {
    this.logger.log(`Getting current user profile for userId: ${req.user.userId}`);
    try {
      const user = await this.usersService.findCurrentUser(req.user.userId);
      // Remove password from response
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password, ...result } = userObj;
      return result;
    } catch (error) {
      this.logger.error(`Error getting current user: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating profile for user: ${req.user.userId}`);
    try {
      const updatedUser = await this.usersService.update(req.user.userId, updateUserDto);
      // Remove password from response
      const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
      const { password, ...result } = userObj;
      return result;
    } catch (error) {
      this.logger.error(`Error updating user profile: ${error.message}`, error.stack);
      throw error;
    }
  }
 
  @Public()
  @Put('update-to-dentist')
  async updateToDentist(@Body() updateData: any, @Query('userId') userId: string) {
    this.logger.log(`Received update-to-dentist request with userId: ${userId}`);
    
    if (!userId) {
      this.logger.error('No userId provided in the update-to-dentist request');
      throw new Error('UserId is required');
    }
    
    try {
       
      const updatedUser = await this.usersService.updateToDentist(userId, updateData);
       
      const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
      const { password, ...result } = userObj;
      
      this.logger.log(`Successfully updated user to dentist role: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating user to dentist: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id);
    // Remove password from response
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    
    // For non-admin users, ensure that public information is available
    // but restrict access to sensitive information except for the user's own data
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      // If viewing a dentist profile, provide essential contact info
      if (result.role === 'dentist') {
        // Keep public dentist information accessible to everyone
        return result;
      } else {
        // For non-dentist users, limit what data is returned
        const { email, phone_number, address, ...publicData } = result;
        return publicData;
      }
    }
    
    return result;
  }

  @Get('patients/:id')
  @UseGuards(RolesGuard)
  @Roles('dentist', 'admin')
  async getPatientForDentist(@Param('id') id: string, @Request() req): Promise<any> {
    // Add detailed logging to help troubleshoot 
    this.logger.log(`Getting patient data: patientId=${id}, requestingUser=${req.user.userId}, role=${req.user.role || 'undefined'}`);
    
    try {
      // Get user details from database including role, in case the token doesn't have it
      if (!req.user.role) {
        const userDetails = await this.usersService.findCurrentUser(req.user.userId);
        req.user.role = userDetails.role;
        this.logger.log(`Retrieved role from database: ${req.user.role}`);
      }
      
      let user;
      
      if (req.user.role === 'admin') {
        this.logger.log('Admin accessing patient data');
        user = await this.usersService.findOne(id);
      } else if (req.user.role === 'dentist') {
        this.logger.log('Dentist accessing patient data, verifying relationship');
        user = await this.usersService.findPatientForDentist(id, req.user.userId);
      } else {
        throw new ForbiddenException('You do not have permission to access this patient');
        }
      
      // If we get here, we successfully retrieved user data
      this.logger.log(`Successfully processed patient data request for ${id}`);
      
      // Remove password from response and ensure we return proper data
      const userObj = user.toObject ? user.toObject() : user;
      const { password, ...result } = userObj;
      
      return result;
    } catch (error) {
      this.logger.error(`Error getting patient data: ${error.message}`, error.stack);
      throw error; // Let NestJS exception filters handle it
    }
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return result;
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    // Remove password from response
    const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
    const { password, ...result } = userObj;
    return result;
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    // Remove password from response
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return result;
  }
}