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
  Query
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
 
  // The update-to-dentist route is now defined BEFORE the parameterized routes
  // This ensures NestJS correctly matches this route
  @Public()
  @Put('update-to-dentist')
  async updateToDentist(@Body() updateData: any, @Query('userId') userId: string) {
    // Log the incoming request data with the userId from query parameters
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
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    // Remove password from response
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return result;
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