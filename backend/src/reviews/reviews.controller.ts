import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Public endpoint to get visible reviews for a dentist
  @Get('dentist/:id/public')
  async getDentistPublicReviews(@Param('id') id: string) {
    return this.reviewsService.findByDentist(id);
  }

  // Public endpoint to get a dentist's average rating
  @Get('dentist/:id/rating')
  async getDentistRating(@Param('id') id: string) {
    return this.reviewsService.getDentistRating(id);
  }

  // Public endpoint for submitting reviews (for demo purposes)
  @Post('dentist/:id/public')
  async createPublicDentistReview(
    @Param('id') dentistId: string,
    @Body() reviewData: any
  ) {
    // Create a properly formatted review object
    const createReviewDto = {
      dentist: dentistId,
      patient: '999999999999999999999999', // Demo patient ID
      rating: reviewData.rating,
      comment: reviewData.comment,
      procedure: reviewData.procedure,
      isVisible: true
    };
    
    const newReview = await this.reviewsService.create(createReviewDto);
    
    // Format the review to match the frontend expectations
    return {
      id: (newReview as any)._id,
      dentistId: dentistId,
      patientId: '999999999999999999999999',
      patientName: reviewData.patientName || 'Demo User',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      procedure: newReview.procedure
    };
  }

  // Endpoint to submit a review for a specific dentist
  @UseGuards(JwtAuthGuard)
  @Post('dentist/:id')
  async createDentistReview(
    @Param('id') dentistId: string,
    @Body() reviewData: any,
    @Request() req
  ) {
    const patientId = req.user.userId;

    // Validate that the patient has had appointments with this dentist
    const canReview = await this.reviewsService.validatePatientCanReview(patientId, dentistId);
    if (!canReview) {
      throw new BadRequestException(
        'You can only review dentists you have had completed appointments with. Please book and complete an appointment first.'
      );
    }

    // Check if patient has already reviewed this dentist
    const hasExistingReview = await this.reviewsService.checkExistingReview(patientId, dentistId);
    if (hasExistingReview) {
      throw new BadRequestException(
        'You have already reviewed this dentist. You can only submit one review per dentist.'
      );
    }

    // Create a properly formatted review object
    const createReviewDto = {
      dentist: dentistId,
      patient: patientId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      procedure: reviewData.procedure,
      isVisible: true
    };
    
    const newReview = await this.reviewsService.create(createReviewDto);
    
    // Format the review to match the frontend expectations
    const user = req.user;
    return {
      id: (newReview as any)._id,
      dentistId: dentistId,
      patientId: patientId,
      patientName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      procedure: newReview.procedure
    };
  }

  // Endpoint to check if a patient can review a dentist
  @UseGuards(JwtAuthGuard)
  @Get('dentist/:id/can-review')
  async canReviewDentist(
    @Param('id') dentistId: string,
    @Request() req
  ) {
    const patientId = req.user.userId;

    // Check if patient has appointments with this dentist
    const canReview = await this.reviewsService.validatePatientCanReview(patientId, dentistId);
    
    // Check if patient has already reviewed this dentist
    const hasExistingReview = await this.reviewsService.checkExistingReview(patientId, dentistId);

    return {
      canReview,
      hasExistingReview,
      message: !canReview 
        ? 'You must have a completed appointment with this dentist to leave a review.'
        : hasExistingReview 
          ? 'You have already reviewed this dentist.'
          : 'You can leave a review for this dentist.'
    };
  }

  // Protected routes below
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Body() createReviewDto: any, @Request() req) {
    // Make sure the patient ID in the review matches the authenticated user
    if (req.user.userId !== createReviewDto.patient) {
      throw new BadRequestException('You can only submit reviews as yourself');
    }
    
    return this.reviewsService.create(createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  async getMyReviews(@Request() req) {
    return this.reviewsService.findByPatient(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('dentist')
  @Get('about-me')
  async getReviewsAboutMe(@Request() req) {
    return this.reviewsService.findByDentist(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: any, @Request() req) {
    const review = await this.reviewsService.findOne(id);
    
    // Ensure only the author can update their review
    // Safely access _id by casting to any first
    const patientId = (review.patient as any)?._id?.toString() || review.patient.toString();
    if (patientId !== req.user.userId) {
      throw new BadRequestException('You can only edit your own reviews');
    }
    
    return this.reviewsService.update(id, updateReviewDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('dentist')
  @Post(':id/respond')
  async respondToReview(
    @Param('id') id: string, 
    @Body('response') response: string,
    @Request() req
  ) {
    if (!response || response.trim() === '') {
      throw new BadRequestException('Response cannot be empty');
    }
    
    return this.reviewsService.respondToReview(id, req.user.userId, response);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/toggle-visibility')
  async toggleVisibility(@Param('id') id: string) {
    return this.reviewsService.toggleVisibility(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  async getAllReviewsAdmin() {
    return this.reviewsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const review = await this.reviewsService.findOne(id);
    
    // Allow admins or the review author to delete
    // Safely access _id by casting to any first
    const patientId = (review.patient as any)?._id?.toString() || review.patient.toString();
    if (req.user.role !== 'admin' && patientId !== req.user.userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }
    
    return this.reviewsService.remove(id);
  }
}