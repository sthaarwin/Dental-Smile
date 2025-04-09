import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkingHours, WorkingHoursDocument } from './schemas/working-hours.schema';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(WorkingHours.name)
    private workingHoursModel: Model<WorkingHoursDocument>,
  ) {}

  async findAll(): Promise<WorkingHours[]> {
    return this.workingHoursModel.find().exec();
  }

  async findByDentist(dentistId: string): Promise<WorkingHours> {
    const schedule = await this.workingHoursModel
      .findOne({ dentist: dentistId })
      .populate('dentist')
      .exec();
      
    if (!schedule) {
      throw new NotFoundException(`Schedule for dentist ${dentistId} not found`);
    }
    
    return schedule;
  }
  
  async createOrUpdate(dentistId: string, scheduleData: any): Promise<WorkingHours> {
    const existingSchedule = await this.workingHoursModel
      .findOne({ dentist: dentistId })
      .exec();
      
    if (existingSchedule) {
      // Update existing schedule
      const updatedSchedule = await this.workingHoursModel
        .findByIdAndUpdate(
          existingSchedule._id,
          { ...scheduleData },
          { new: true }
        )
        .exec();
        
      if (!updatedSchedule) {
        throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
      }
      
      return updatedSchedule;
    } else {
      // Create new schedule
      const newSchedule = new this.workingHoursModel({
        dentist: dentistId,
        ...scheduleData,
      });
      
      return newSchedule.save();
    }
  }

  async findOne(id: string): Promise<WorkingHours> {
    const schedule = await this.workingHoursModel
      .findById(id)
      .populate('dentist')
      .exec();
      
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    
    return schedule;
  }
  
  async update(id: string, updateData: any): Promise<WorkingHours> {
    const updatedSchedule = await this.workingHoursModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
      
    if (!updatedSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    
    return updatedSchedule;
  }
  
  async remove(id: string): Promise<WorkingHours> {
    const deletedSchedule = await this.workingHoursModel
      .findByIdAndDelete(id)
      .exec();
      
    if (!deletedSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    
    return deletedSchedule;
  }

  async addDayOff(dentistId: string, date: Date): Promise<WorkingHours> {
    const workingHours = await this.findByDentist(dentistId);
    
    // Convert date to start of day to avoid time issues
    const dayOff = new Date(date);
    dayOff.setHours(0, 0, 0, 0);
    
    // Check if date already exists in days off
    const alreadyExists = workingHours.daysOff?.some(
      existingDate => existingDate.getTime() === dayOff.getTime()
    );
    
    if (!alreadyExists) {
      if (!workingHours.daysOff) {
        workingHours.daysOff = [];
      }
      workingHours.daysOff.push(dayOff);
      
      const updatedSchedule = await this.workingHoursModel
        .findOneAndUpdate(
          { dentist: dentistId },
          { daysOff: workingHours.daysOff },
          { new: true }
        )
        .exec();
        
      if (!updatedSchedule) {
        throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
      }
      
      return updatedSchedule;
    }
    
    return workingHours;
  }

  async removeDayOff(dentistId: string, date: Date): Promise<WorkingHours> {
    const workingHours = await this.findByDentist(dentistId);
    
    // Convert date to start of day to avoid time issues
    const dayOff = new Date(date);
    dayOff.setHours(0, 0, 0, 0);
    
    if (workingHours.daysOff && workingHours.daysOff.length > 0) {
      workingHours.daysOff = workingHours.daysOff.filter(
        existingDate => existingDate.getTime() !== dayOff.getTime()
      );
      
      const updatedSchedule = await this.workingHoursModel
        .findOneAndUpdate(
          { dentist: dentistId },
          { daysOff: workingHours.daysOff },
          { new: true }
        )
        .exec();
        
      if (!updatedSchedule) {
        throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
      }
      
      return updatedSchedule;
    }
    
    return workingHours;
  }

  async isDentistAvailable(dentistId: string, date: Date, startTime: string, endTime: string): Promise<boolean> {
    try {
      const workingHours = await this.findByDentist(dentistId);
      
      // Check if date is a day off
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      const isDayOff = workingHours.daysOff?.some(
        dayOff => {
          const offDate = new Date(dayOff);
          offDate.setHours(0, 0, 0, 0);
          return offDate.getTime() === checkDate.getTime();
        }
      );
      
      if (isDayOff) {
        return false;
      }
      
      // Get day of week
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      
      // Check if dentist works on this day
      const dailySchedule = workingHours[dayOfWeek];
      
      if (!dailySchedule || !dailySchedule.isWorking) {
        return false;
      }
      
      // Check if time is within working hours
      if (startTime < dailySchedule.startTime || endTime > dailySchedule.endTime) {
        return false;
      }
      
      // Could add additional logic here to check for breaks
      
      return true;
    } catch (error) {
      // If working hours not found, assume dentist is not available
      return false;
    }
  }
}