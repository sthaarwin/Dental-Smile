import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DentalService, DentalServiceDocument } from './schemas/dental-service.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(DentalService.name) private dentalServiceModel: Model<DentalServiceDocument>
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
}