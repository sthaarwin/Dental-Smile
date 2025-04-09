import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    const users = await this.usersService.findAll();
    // Remove password from response
    return users.map(user => {
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password, ...result } = userObj;
      return result;
    });
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