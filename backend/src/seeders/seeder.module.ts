import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeeder } from './database.seeder';
import { SeederController } from './seeder.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { DentalService, DentalServiceSchema } from '../services/schemas/dental-service.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { WorkingHours, WorkingHoursSchema } from '../schedules/schemas/working-hours.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DentalService.name, schema: DentalServiceSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: WorkingHours.name, schema: WorkingHoursSchema },
    ]),
  ],
  controllers: [SeederController],
  providers: [DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeederModule {}