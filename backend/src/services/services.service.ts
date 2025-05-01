import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DentalService, DentalServiceDocument } from './schemas/dental-service.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(DentalService.name) private dentalServiceModel: Model<DentalServiceDocument>,
    private readonly usersService: UsersService
  ) {}

  async create(createServiceDto: any): Promise<DentalService> {
    const newService = new this.dentalServiceModel(createServiceDto);
    return newService.save();
  }

  async findAll(
    activeOnly = false, 
    category?: string, 
    search?: string,
    page = 1,
    limit = 10
  ): Promise<{ data: DentalService[]; total: number; page: number; totalPages: number }> {
    const filter: any = {};
    
    if (activeOnly) {
      filter.isActive = true;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.dentalServiceModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.dentalServiceModel.countDocuments(filter)
    ]);
    
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<DentalService> {
    const service = await this.dentalServiceModel.findById(id).exec();
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    return service;
  }

  async update(id: string, updateServiceDto: any): Promise<DentalService> {
    const updatedService = await this.dentalServiceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .exec();
    
    if (!updatedService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    return updatedService;
  }

  async remove(id: string): Promise<DentalService> {
    const deletedService = await this.dentalServiceModel
      .findByIdAndDelete(id)
      .exec();
    
    if (!deletedService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    return deletedService;
  }

  async deactivate(id: string): Promise<DentalService> {
    return this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<DentalService> {
    return this.update(id, { isActive: true });
  }

  async bulkCreate(createServiceDtos: any[]): Promise<{ success: number; failed: number }> {
    try {
      const result = await this.dentalServiceModel.insertMany(createServiceDtos, { ordered: false });
      return { 
        success: result.length, 
        failed: createServiceDtos.length - result.length 
      };
    } catch (error) {
      if (error.writeErrors) {
        return { 
          success: error.insertedDocs.length, 
          failed: createServiceDtos.length - error.insertedDocs.length 
        };
      }
      throw error;
    }
  }

  async bulkUpdate(updates: { id: string; data: any }[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const operations = updates.map(async (update) => {
      try {
        await this.dentalServiceModel.findByIdAndUpdate(update.id, update.data);
        success++;
      } catch (error) {
        failed++;
      }
    });

    await Promise.all(operations);
    return { success, failed };
  }
  
  async findPublicDentists(
    specialty?: string,
    city?: string,
    state?: string,
    search?: string,
    acceptingNewPatients?: boolean,
    sortBy: string = 'rating',
    page = 1,
    limit = 20
  ) {
    try {
      // Get all users with role 'dentist'
      const dentists = await this.usersService.findAllByRole('dentist');
      
      // Filter dentists based on query parameters
      let filteredDentists = dentists.filter(dentist => {
        // Skip dentists without dentist_details
        if (!dentist.dentist_details) return false;
        
        // Filter by specialty if provided
        if (specialty && dentist.dentist_details.specialties) {
          const specialties = Array.isArray(dentist.dentist_details.specialties) 
            ? dentist.dentist_details.specialties 
            : [dentist.dentist_details.specialties];
            
          if (!specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))) {
            return false;
          }
        }
        
        // Filter by city if provided
        if (city && dentist.dentist_details.city) {
          if (!dentist.dentist_details.city.toLowerCase().includes(city.toLowerCase())) {
            return false;
          }
        }
        
        // Filter by state if provided
        if (state && dentist.dentist_details.state) {
          if (!dentist.dentist_details.state.toLowerCase().includes(state.toLowerCase())) {
            return false;
          }
        }
        
        // Filter by search term if provided
        if (search) {
          const searchLower = search.toLowerCase();
          const nameMatches = dentist.name?.toLowerCase().includes(searchLower);
          const specialtyMatches = dentist.dentist_details.specialties?.some(
            s => s.toLowerCase().includes(searchLower)
          );
          const cityMatches = dentist.dentist_details.city?.toLowerCase().includes(searchLower);
          const stateMatches = dentist.dentist_details.state?.toLowerCase().includes(searchLower);
          
          if (!(nameMatches || specialtyMatches || cityMatches || stateMatches)) {
            return false;
          }
        }
        
        // Filter by accepting new patients if provided
        if (acceptingNewPatients === true) {
          if (dentist.dentist_details.accepting_new_patients === false) {
            return false;
          }
        }
        
        return true;
      });
      
      // Sort results
      if (sortBy === 'rating') {
        filteredDentists.sort((a, b) => {
          const ratingA = a.dentist_details.rating || 0;
          const ratingB = b.dentist_details.rating || 0;
          return ratingB - ratingA; // Descending order
        });
      } else if (sortBy === 'experience') {
        filteredDentists.sort((a, b) => {
          const expA = a.dentist_details.experience || 0;
          const expB = b.dentist_details.experience || 0;
          return expB - expA; // Descending order
        });
      }
      
      // Apply pagination
      const skip = (page - 1) * limit;
      const total = filteredDentists.length;
      filteredDentists = filteredDentists.slice(skip, skip + limit);
      
      // Format the response to match the frontend Dentist interface
      const formattedDentists = filteredDentists.map(dentist => this.formatDentistResponse(dentist));
      
      return {
        data: formattedDentists,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching public dentists:', error);
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }
  
  private formatDentistResponse(dentist: any) {
    // Format dentist data to match the frontend interface
    const details = dentist.dentist_details || {};
    
    return {
      id: dentist._id.toString(),
      firstName: dentist.name?.split(' ')[0] || '',
      lastName: dentist.name?.split(' ').slice(1).join(' ') || '',
      email: dentist.email || '',
      specialty: Array.isArray(details.specialties) ? details.specialties[0] : details.specialties || 'General Dentistry',
      image: dentist.profile_picture || '',
      phoneNumber: details.office_phone || dentist.phone_number || '',
      address: details.address || '',
      city: details.city || '',
      state: details.state || '',
      zipCode: details.zip_code || '',
      bio: details.bio || '',
      education: Array.isArray(details.education) ? details.education : [details.education].filter(Boolean),
      certifications: Array.isArray(details.certifications) ? details.certifications : [details.certifications].filter(Boolean),
      services: Array.isArray(details.services) ? details.services : [details.services].filter(Boolean),
      languages: Array.isArray(details.languages) ? details.languages : [details.languages].filter(Boolean),
      experience: details.experience || 0,
      rating: details.rating || 0,
      reviewCount: details.review_count || 0,
      availability: details.business_hours || '',
      acceptingNewPatients: details.accepting_new_patients !== false,
      insuranceAccepted: Array.isArray(details.accepted_insurance) ? details.accepted_insurance : [details.accepted_insurance].filter(Boolean)
    };
  }
}