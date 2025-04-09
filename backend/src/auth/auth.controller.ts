import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Request, 
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateUserDto) {
    const updatedUser = await this.authService.updateProfile(
      req.user.userId,
      updateProfileDto
    );
    
    // Handle as Document type that has toObject method
    const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
    const { password, ...result } = userObj;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-profile-picture')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only JPG and PNG files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async uploadProfilePicture(@Request() req, @UploadedFile() file: Express.Multer.File) {
    // In a real app, you would upload this to cloud storage
    // For this example, we'll return a mock URL
    const mockImageUrl = `https://dental-app.example.com/uploads/${Date.now()}-${file.originalname}`;
    
    const updatedUser = await this.authService.updateProfile(
      req.user.userId,
      { profile_picture: mockImageUrl }
    );
    
    return { imageUrl: mockImageUrl };
  }
}