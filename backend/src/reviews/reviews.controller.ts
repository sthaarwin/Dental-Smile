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