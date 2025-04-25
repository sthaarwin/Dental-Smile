import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Document } from 'mongoose';

interface MongooseDocument {
  _id: any;
  updatedAt?: Date;
  createdAt?: Date;
  [key: string]: any;
}

@Injectable()
export class DentistsService {
  private readonly logger = new Logger(DentistsService.name);
  
  constructor(
    private readonly usersService: UsersService,
  ) {}
  
  async findAllApplications() {
    // Find all users with role 'pending_dentist' or with dentist_details that have application_status
    try {
      const pendingDentists = await this.usersService.findAllByRole('pending_dentist');
      
      // Map the data to a format similar to what the frontend expects
      return pendingDentists.map(user => {
        // Convert user to plain object to access Mongoose document properties
        const userObj = this.convertToPlainObject(user);
        
        return {
          id: userObj._id?.toString() || '',
          userId: userObj._id?.toString() || '',
          firstName: userObj.name?.split(' ')[0] || '',
          lastName: userObj.name?.split(' ').slice(1).join(' ') || '',
          email: userObj.email || '',
          phone: userObj.phone_number || '',
          licenseNumber: userObj.dentist_details?.license_number || '',
          specialties: Array.isArray(userObj.dentist_details?.specialties) 
            ? userObj.dentist_details?.specialties.join(', ') 
            : userObj.dentist_details?.specialties || '',
          experience: userObj.dentist_details?.experience?.toString() || '',
          education: userObj.dentist_details?.education || '',
          certifications: userObj.dentist_details?.certifications || '',
          practiceName: userObj.dentist_details?.practice_name || '',
          applicationStatus: userObj.dentist_details?.application_status || 'pending',
          submittedAt: userObj.updatedAt || userObj.createdAt || new Date().toISOString()
        };
      });
    } catch (error) {
      this.logger.error('Error finding dentist applications:', error);
      return [];
    }
  }
  
  // Helper method to safely convert a Mongoose document to a plain object
  private convertToPlainObject(doc: User | UserDocument | Document): MongooseDocument {
    if (doc && typeof doc === 'object') {
      // Check if it's a Mongoose document with toObject method
      if ('toObject' in doc && typeof doc.toObject === 'function') {
        return doc.toObject();
      }
      // Already a plain object
      return doc as MongooseDocument;
    }
    // Fallback for unexpected cases
    return { _id: null };
  }
  
  async updateApplicationStatus(userId: string, status: 'approved' | 'rejected') {
    try {
      const user = await this.usersService.findOne(userId);
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Update the dentist_details to include application status
      const dentistDetails = {
        ...user.dentist_details,
        application_status: status
      };
      
      // If approved, update the role to 'dentist'
      const role = status === 'approved' ? 'dentist' : 'pending_dentist';
      
      // Update the user record
      const updatedUser = await this.usersService.update(userId, { 
        role,
        dentist_details: dentistDetails
      });
      
      return {
        success: true,
        message: `Application ${status} successfully`
      };
    } catch (error) {
      this.logger.error(`Error updating application status: ${error.message}`, error.stack);
      throw error;
    }
  }
}