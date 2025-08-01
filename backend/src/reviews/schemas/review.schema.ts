import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Appointment } from '../../appointments/schemas/appointment.schema';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  patient: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  dentist: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment' })
  appointment: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: null })
  response: string;

  @Prop({ default: null })
  responseDate: Date;

  @Prop({ default: true })
  isVisible: boolean;

  @Prop()
  procedure: string;

  // Define as optional method that will be implemented by Mongoose
  toObject?(): Record<string, any>;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);