import { Injectable, ConflictException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  
  async findAllByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).exec();
  }

  async findOne(id: string): Promise<User> {
    // Don't try to use ObjectId for special values like 'me'
    if (id === 'me') {
      throw new Error('Cannot directly query for "me", use findCurrentUser method instead');
    }
    
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  
  async findCurrentUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  async create(userData: any): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: userData.email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    
    return newUser.save();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  async updateProfilePicture(id: string, imageUrl: string): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { profile_picture: imageUrl }, { new: true })
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  async delete(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return deletedUser;
  }
  
  async updateToDentist(id: string, data: any): Promise<User> {
    try {
      // Find the user
      const user = await this.findOne(id);
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      // Update user using findOneAndUpdate instead of save()
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name: data.name || user.name,
            phone_number: data.phone_number || user.phone_number,
            role: 'pending_dentist', // Change from 'dentist' to 'pending_dentist'
            dentist_details: data.dentist_details
          }
        },
        { new: true }
      ).exec();
      
      if (!updatedUser) {
        throw new NotFoundException(`Failed to update user with ID ${id}`);
      }
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async findPatientForDentist(patientId: string, dentistId: string): Promise<User> {
    try {
      // Find the patient first to verify they exist
      const patient = await this.userModel
        .findById(patientId)
        .select('-password')
        .exec();
        
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${patientId} not found`);
      }

      // Get the appointment model from the connection
      const appointmentModel = this.connection.model('Appointment');
      
      // Use lean() to get plain JavaScript objects and optimize query performance
      const appointments = await appointmentModel.find({
        $or: [
          // Try different formats for patient and dentist IDs to ensure matching works
          { patient: patientId, dentist: dentistId },
          { 'patient._id': patientId, 'dentist._id': dentistId },
          { patientId: patientId, dentistId: dentistId }
        ]
      }).lean().exec();

      console.log(`Found ${appointments.length} appointments for patient ${patientId} and dentist ${dentistId}`);
      
      if (!appointments || appointments.length === 0) {
        // If admin, allow access to any patient
        const dentist = await this.userModel.findById(dentistId).select('role').lean().exec();
        if (dentist && dentist.role === 'admin') {
          console.log('Admin access granted for patient data');
          return patient;
        }
        
        throw new ForbiddenException('You do not have permission to view this patient');
      }
      
      // Log success when everything works
      console.log(`Successfully retrieved patient data for patient ${patientId}`);
      return patient;
    } catch (error) {
      console.error(`Error in findPatientForDentist: ${error.message}`, error.stack);
      
      // Re-throw specific exceptions as-is
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      
      // For other unexpected errors, log them but don't expose details to client
      console.error('Unexpected error in findPatientForDentist:', error);
      throw new Error(`An error occurred while retrieving patient data: ${error.message}`);
    }
  }
}