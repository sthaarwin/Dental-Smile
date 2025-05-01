import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { FormattedAppointment } from './interfaces/formatted-appointment.interface';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>
  ) {}

  async create(appointmentData: any): Promise<Appointment> {
    // Check for appointment time conflicts
    const conflictingAppointment = await this.checkForConflicts(
      appointmentData.dentist,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (conflictingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    const newAppointment = new this.appointmentModel(appointmentData);
    return newAppointment.save();
  }

  async findAll(query = {}): Promise<FormattedAppointment[]> {
    const appointments = await this.appointmentModel
      .find(query)
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .sort({ date: 1, startTime: 1 })
      .exec();
      
    // Format appointments to ensure consistent data structure
    return appointments.map(appointment => {
      const formattedAppointment = appointment.toObject() as FormattedAppointment;
      
      // Add patientName field for easier access
      if (formattedAppointment.patient) {
        const patient = formattedAppointment.patient as any;
        formattedAppointment.patientName = patient.name || '';
      }
      
      // Format date to YYYY-MM-DD string if it's a Date object
      if (formattedAppointment.date instanceof Date) {
        formattedAppointment.date = formattedAppointment.date.toISOString().split('T')[0];
      }
      
      return formattedAppointment;
    });
  }

  async findOne(id: string): Promise<FormattedAppointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    // Format appointment to ensure consistent data structure
    const formattedAppointment = appointment.toObject() as FormattedAppointment;
    
    // Add patientName field for easier access
    if (formattedAppointment.patient) {
      const patient = formattedAppointment.patient as any;
      formattedAppointment.patientName = patient.name || '';
    }
    
    // Format date to YYYY-MM-DD string if it's a Date object
    if (formattedAppointment.date instanceof Date) {
      formattedAppointment.date = formattedAppointment.date.toISOString().split('T')[0];
    }
    
    return formattedAppointment;
  }

  async findByPatient(patientId: string): Promise<FormattedAppointment[]> {
    const appointments = await this.appointmentModel
      .find({ patient: patientId })
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .sort({ date: 1, startTime: 1 })
      .exec();
      
    // Format appointments to ensure consistent data structure
    return appointments.map(appointment => {
      const formattedAppointment = appointment.toObject() as FormattedAppointment;
      
      // Add patientName field for easier access
      if (formattedAppointment.patient) {
        const patient = formattedAppointment.patient as any;
        formattedAppointment.patientName = patient.name || '';
      }
      
      // Format date to YYYY-MM-DD string if it's a Date object
      if (formattedAppointment.date instanceof Date) {
        formattedAppointment.date = formattedAppointment.date.toISOString().split('T')[0];
      }
      
      return formattedAppointment;
    });
  }

  async findByDentist(dentistId: string): Promise<FormattedAppointment[]> {
    const appointments = await this.appointmentModel
      .find({ dentist: dentistId })
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .sort({ date: 1, startTime: 1 })
      .exec();
      
    // Format appointments to ensure consistent data structure
    return appointments.map(appointment => {
      const formattedAppointment = appointment.toObject() as FormattedAppointment;
      
      // Add patientName field for easier access
      if (formattedAppointment.patient) {
        const patient = formattedAppointment.patient as any;
        formattedAppointment.patientName = patient.name || '';
      }
      
      // Format date to YYYY-MM-DD string if it's a Date object
      if (formattedAppointment.date instanceof Date) {
        formattedAppointment.date = formattedAppointment.date.toISOString().split('T')[0];
      }
      
      return formattedAppointment;
    });
  }

  async findByDate(date: Date): Promise<FormattedAppointment[]> {
    // Get appointments for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const appointments = await this.appointmentModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .sort({ startTime: 1 })
      .exec();
    
    return appointments.map(appointment => {
      const formattedAppointment = appointment.toObject() as FormattedAppointment;
      
      if (formattedAppointment.patient) {
        const patient = formattedAppointment.patient as any;
        formattedAppointment.patientName = patient.name || '';
      }
      
      // Format date to YYYY-MM-DD string if it's a Date object
      if (formattedAppointment.date instanceof Date) {
        formattedAppointment.date = formattedAppointment.date.toISOString().split('T')[0];
      }
      
      return formattedAppointment;
    });
  }

  async update(id: string, updateAppointmentDto: any): Promise<Appointment> {
    // Check if appointment time is being updated
    if (updateAppointmentDto.date || updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      const appointment = await this.findOne(id);
      
      // Check for conflicts, excluding this appointment
      const conflictingAppointment = await this.checkForConflicts(
        updateAppointmentDto.dentist || appointment.dentist,
        updateAppointmentDto.date || appointment.date,
        updateAppointmentDto.startTime || appointment.startTime,
        updateAppointmentDto.endTime || appointment.endTime,
        id
      );

      if (conflictingAppointment) {
        throw new BadRequestException('This time slot is already booked');
      }
    }

    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .exec();

    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return updatedAppointment;
  }

  async updateStatus(id: string, status: string): Promise<Appointment> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<Appointment> {
    const deletedAppointment = await this.appointmentModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return deletedAppointment;
  }

  private async checkForConflicts(
    dentistId: string,
    date: Date | string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    // Ensure we have a proper Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    dateObj.setHours(0, 0, 0, 0);

    const query: any = {
      dentist: dentistId,
      date: dateObj,
      $or: [
        // New appointment starts during an existing appointment
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New appointment ends during an existing appointment
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New appointment encompasses an existing appointment
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const conflictingAppointments = await this.appointmentModel.find(query).exec();
    return conflictingAppointments.length > 0;
  }
}