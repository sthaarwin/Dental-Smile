import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkingHours, WorkingHoursDocument } from './schemas/working-hours.schema';
import * as MongooseSchema from 'mongoose';

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
      // Create a default schedule with proper DailyHours objects
      const defaultSchedule = new this.workingHoursModel({
        _id: new MongooseSchema.Types.ObjectId(), 
        dentist: dentistId,
        sunday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        monday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        tuesday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        wednesday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        thursday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        friday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        saturday: { isWorking: false, startTime: '', endTime: '' },
        daysOff: []
      });
      
      try {
        const savedSchedule = await defaultSchedule.save();
        console.log(`Created default schedule for dentist ${dentistId}`);
        return this.formatScheduleForFrontend(savedSchedule);
      } catch (error) {
        console.error(`Error creating default schedule for dentist ${dentistId}:`, error);
        throw new NotFoundException(`Schedule for dentist ${dentistId} not found and could not be created`);
      }
    }
    
    return this.formatScheduleForFrontend(schedule);
  }
  
  private formatScheduleForFrontend(schedule: any): WorkingHours {
    const formattedSchedule = schedule.toObject ? schedule.toObject() : { ...schedule };
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Create default empty arrays for each day
    days.forEach(day => {
      if (!formattedSchedule[day]) {
        formattedSchedule[day] = [];
      }
    });
    
    // Format and transfer time slots from daySlots to day arrays
    days.forEach(day => {
      const slotsField = `${day}Slots`;
      
      if (formattedSchedule[slotsField] && formattedSchedule[slotsField].length > 0) {
        formattedSchedule[day] = formattedSchedule[slotsField].map(slot => {
          // Format times to AM/PM format
          const startTime = this.convertToAmPmFormat(slot.startTime);
          const endTime = this.convertToAmPmFormat(slot.endTime);
          
          return {
            id: slot.id || new Date().getTime(),
            startTime: startTime,
            endTime: endTime,
            isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true,
            day: day.charAt(0).toUpperCase() + day.slice(1)
          };
        });
      } else {
        formattedSchedule[day] = [];
      }
    });
    
    return formattedSchedule;
  }
  
  // Helper method to convert 24-hour times to AM/PM format
  private convertToAmPmFormat(timeString: string): string {
    if (!timeString || timeString === '') return '';
    
    // If already in AM/PM format, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    try {
      // Parse hour and minute from 24-hour format
      const [hourStr, minuteStr] = timeString.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      
      // Determine AM/PM
      const period = hour >= 12 ? 'PM' : 'AM';
      
      // Convert hour to 12-hour format
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      
      // Format the time as AM/PM
      return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
      console.error('Error converting time format:', e);
      return timeString; // Return original if parsing fails
    }
  }
  
  async createOrUpdate(dentistId: string, scheduleData: any): Promise<WorkingHours> {
    const existingSchedule = await this.workingHoursModel
      .findOne({ dentist: dentistId })
      .exec();
      
    if (existingSchedule) {
      // Handle special case for toggling time slot availability
      if (scheduleData.day && scheduleData.slotId !== undefined) {
        const day = scheduleData.day.toLowerCase();
        const slotsField = `${day}Slots`;
        
        if (existingSchedule[slotsField] && existingSchedule[slotsField].length > 0) {
          // Find and update the specific slot
          const slotIndex = existingSchedule[slotsField].findIndex(
            slot => slot.id.toString() === scheduleData.slotId.toString()
          );
          
          if (slotIndex !== -1) {
            // Update just the availability of this slot
            existingSchedule[slotsField][slotIndex].isAvailable = scheduleData.isAvailable;
            
            const updatedSchedule = await this.workingHoursModel
              .findByIdAndUpdate(
                existingSchedule._id,
                { [slotsField]: existingSchedule[slotsField] },
                { new: true }
              )
              .exec();
              
            if (!updatedSchedule) {
              throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
            }
            
            return this.formatScheduleForFrontend(updatedSchedule);
          }
        }
      }
      
      // General update case
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
      
      return this.formatScheduleForFrontend(updatedSchedule);
    } else {
      const newSchedule = new this.workingHoursModel({
        dentist: dentistId,
        ...scheduleData,
      });
      
      const savedSchedule = await newSchedule.save();
      return this.formatScheduleForFrontend(savedSchedule);
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
    
    const dayOff = new Date(date);
    dayOff.setHours(0, 0, 0, 0);
    
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
      
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      
      const dailySchedule = workingHours[dayOfWeek];
      
      if (!dailySchedule || !dailySchedule.isWorking) {
        return false;
      }
      
      if (startTime < dailySchedule.startTime || endTime > dailySchedule.endTime) {
        return false;
      }
            
    return true;
    } catch (error) {
      return false;
    }
  }
  
  async addTimeSlot(dentistId: string, timeSlotData: any): Promise<WorkingHours> {
    let workingHours = await this.findByDentist(dentistId);
    
    const day = timeSlotData.day.toLowerCase();
    
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day)) {
      throw new Error(`Invalid day name: ${day}`);
    }
    
    // Ensure startTime and endTime are in AM/PM format
    const startTime = this.convertToAmPmFormat(timeSlotData.startTime);
    const endTime = this.convertToAmPmFormat(timeSlotData.endTime);
    
    const timeSlot = {
      id: new Date().getTime(),
      startTime: startTime,
      endTime: endTime,
      isAvailable: timeSlotData.isAvailable !== undefined ? timeSlotData.isAvailable : true
    };
    
    console.log(`Adding time slot for ${day}:`, timeSlot);
    
    const slotsField = `${day}Slots`;
    
    if (!workingHours[slotsField]) {
      workingHours[slotsField] = [];
    }
    
    workingHours[slotsField].push(timeSlot);
    
    const updatedSchedule = await this.workingHoursModel.findOneAndUpdate(
      { dentist: dentistId },
      { [slotsField]: workingHours[slotsField] },
      { new: true }
    ).exec();
    
    if (!updatedSchedule) {
      throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
    }
    
    // Return formatted schedule for frontend display
    return this.formatScheduleForFrontend(updatedSchedule);
  }
  
  async deleteTimeSlot(dentistId: string, slotId: string, dayOverride?: string): Promise<WorkingHours> {
    const workingHours = await this.findByDentist(dentistId);
    
    const slotIdNumber = parseInt(slotId, 10);
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let found = false;
    
    if (dayOverride && days.includes(dayOverride.toLowerCase())) {
      const day = dayOverride.toLowerCase();
      const slotsField = `${day}Slots`;
      
      if (workingHours[slotsField] && workingHours[slotsField].length > 0) {
        console.log(`Checking for time slot ${slotIdNumber} in ${day}Slots:`, workingHours[slotsField]);
        
        const initialLength = workingHours[slotsField].length;
        
        workingHours[slotsField] = workingHours[slotsField].filter(slot => {
          const slotIdToCompare = typeof slot.id === 'number' ? slot.id : parseInt(slot.id.toString(), 10);
          const doesMatch = slotIdToCompare !== slotIdNumber;
          if (!doesMatch) found = true;
          return doesMatch;
        });
        
        console.log(`After filtering, ${day}Slots has ${workingHours[slotsField].length} items, found=${found}`);
        
        if (initialLength > workingHours[slotsField].length) {
          const updatedSchedule = await this.workingHoursModel.findOneAndUpdate(
            { dentist: dentistId },
            { [slotsField]: workingHours[slotsField] },
            { new: true }
          ).exec();
          
          if (!updatedSchedule) {
            throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
          }
          
          return updatedSchedule;
        }
      }
    } else {
      for (const day of days) {
        const slotsField = `${day}Slots`;
        
        if (workingHours[slotsField] && workingHours[slotsField].length > 0) {
          const initialLength = workingHours[slotsField].length;
          
          workingHours[slotsField] = workingHours[slotsField].filter(slot => {
            const slotIdToCompare = typeof slot.id === 'number' ? slot.id : parseInt(slot.id.toString(), 10);
            return slotIdToCompare !== slotIdNumber;
          });
          
          if (workingHours[slotsField].length < initialLength) {
            const updatedSchedule = await this.workingHoursModel.findOneAndUpdate(
              { dentist: dentistId },
              { [slotsField]: workingHours[slotsField] },
              { new: true }
            ).exec();
            
            if (!updatedSchedule) {
              throw new NotFoundException(`Failed to update schedule for dentist ${dentistId}`);
            }
            
            return updatedSchedule;
          }
        }
      }
    }
    
    if (!found) {
      throw new NotFoundException(`Time slot with ID ${slotId} not found`);
    }
    
    return workingHours;
  }
}