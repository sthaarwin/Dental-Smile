import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { DentalService, DentalServiceSchema } from './schemas/dental-service.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DentalService.name, schema: DentalServiceSchema }]),
    UsersModule
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}