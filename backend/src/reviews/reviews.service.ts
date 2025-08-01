import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Appointment, AppointmentDocument } from '../appointments/schemas/appointment.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>
  ) {}

  async create(reviewData: any): Promise<Review> {
    // Create a new review
    const newReview = new this.reviewModel(reviewData);
    return newReview.save();
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel
      .find()
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .exec();
  }

  async findAllAdmin(): Promise<Review[]> {
    return this.reviewModel
      .find()
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .exec();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel
      .findById(id)
      .populate('patient', '-password')
      .populate('dentist', '-password')
      .exec();
    
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    return review;
  }

  async findByPatient(patientId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ patient: patientId })
      .populate('dentist', '-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDentist(dentistId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ dentist: dentistId, isVisible: true })
      .populate('patient', '-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDentistRating(dentistId: string): Promise<{ averageRating: number, reviewCount: number }> {
    const reviews = await this.reviewModel
      .find({ dentist: dentistId, isVisible: true })
      .exec();
    
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length
    };
  }

  async update(id: string, updateData: any): Promise<Review> {
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    return updatedReview;
  }

  async respondToReview(id: string, dentistId: string, response: string): Promise<Review> {
    const review = await this.findOne(id);
    
    // Ensure the dentist responding is the one who was reviewed
    const reviewDentistId = (review.dentist as any)?._id?.toString() || review.dentist.toString();
    if (reviewDentistId !== dentistId) {
      throw new BadRequestException('You can only respond to reviews about you');
    }
    
    return this.update(id, { 
      response, 
      responseDate: new Date() 
    });
  }

  async toggleVisibility(id: string): Promise<Review> {
    const review = await this.findOne(id);
    return this.update(id, { isVisible: !review.isVisible });
  }

  async remove(id: string): Promise<Review> {
    const deletedReview = await this.reviewModel
      .findByIdAndDelete(id)
      .exec();
    
    if (!deletedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    return deletedReview;
  }

  async validatePatientCanReview(patientId: string, dentistId: string): Promise<boolean> {
    // Check if the patient has had at least one appointment with this dentist
    // Allow reviews for both scheduled and completed appointments
    const validAppointments = await this.appointmentModel.find({
      patient: patientId,
      dentist: dentistId,
      status: { $in: ['completed', 'scheduled'] } // Allow reviews for completed or scheduled appointments
    }).exec();

    return validAppointments.length > 0;
  }

  async checkExistingReview(patientId: string, dentistId: string): Promise<boolean> {
    // Check if the patient has already reviewed this dentist
    const existingReview = await this.reviewModel.findOne({
      patient: patientId,
      dentist: dentistId
    }).exec();

    return existingReview !== null;
  }
}