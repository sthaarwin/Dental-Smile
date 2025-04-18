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
import { CloudinaryService } from '../common/services/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

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
    try {
      // Get the user's current profile picture URL (if any)
      const user = await this.authService.getProfile(req.user.userId);
      const oldImageUrl = user.profile_picture;
      
      // Upload the new image to Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(file);
      
      // Update the user profile with the new Cloudinary URL
      const updatedUser = await this.authService.updateProfile(
        req.user.userId,
        { profile_picture: imageUrl }
      );
      
      // Clean up the old image if it exists and is from Cloudinary
      if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
        const publicId = this.cloudinaryService.getPublicIdFromUrl(oldImageUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId).catch(err => {
            console.error('Failed to delete old image:', err);
            // Continue anyway, as we don't want to fail the upload just because cleanup failed
          });
        }
      }
      
      return { imageUrl };
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw new BadRequestException('Failed to upload profile picture');
    }
  }
}