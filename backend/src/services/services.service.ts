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

  async findAll(activeOnly = false): Promise<DentalService[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.dentalServiceModel.find(filter).sort({ name: 1 }).exec();
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
}