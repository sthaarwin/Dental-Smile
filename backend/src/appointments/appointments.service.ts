import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';

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

  async findAll(query = {}): Promise<Appointment[]> {
    return this.appointmentModel
      .find(query)
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .sort({ date: 1, startTime: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.findAll({ patient: patientId });
  }

  async findByDentist(dentistId: string): Promise<Appointment[]> {
    return this.findAll({ dentist: dentistId });
  }

  async findByDate(date: Date): Promise<Appointment[]> {
    // Get appointments for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.findAll({
      date: {
        $gte: startDate,
        $lte: endDate
      }
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
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Build query to check for overlapping appointments
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

    // Exclude current appointment if we're updating
    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const conflictingAppointments = await this.appointmentModel.find(query).exec();
    return conflictingAppointments.length > 0;
  }
}