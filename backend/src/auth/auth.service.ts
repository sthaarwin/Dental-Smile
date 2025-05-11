import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      const result = { ...(user as any).toObject() };
      delete result.password;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    // Create JWT payload with userId in the "sub" field
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      role: user.role
    };
    
    // Create response object with user details
    const userResponse = {
      _id: user._id.toString(),
      id: user._id.toString(), // Adding "id" field for frontend consistency
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      profile_picture: user.profile_picture,
      role: user.role
    };

    // If user is a dentist, include dentist-specific fields if available
    if (user.role === 'dentist' && user.dentist_details) {
      userResponse['dentistId'] = user._id.toString(); // Explicitly include dentistId
      userResponse['specialties'] = user.dentist_details.specialties;
      userResponse['office_phone'] = user.dentist_details.office_phone;
    }
    
    return {
      token: this.jwtService.sign(payload),
      user: userResponse
    };
  }

  async register(userData: any) {
    try {
      const user = await this.usersService.create(userData);
      
      const payload = { 
        email: user.email, 
        sub: `${(user as any)._id}`,
        role: user.role || 'patient'
      };
      
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password, ...userWithoutPassword } = userObj;
      
      return {
        token: this.jwtService.sign(payload),
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    // Handle as Document type that has toObject method
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return result;
  }

  async updateProfile(userId: string, updateData: any) {
    // Don't allow password updates through this method
    const { password, ...safeUpdateData } = updateData;
    
    return this.usersService.update(userId, safeUpdateData);
  }
}