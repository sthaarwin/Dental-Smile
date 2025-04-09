import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  patient: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  dentist: User;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  service: string;

  @Prop({ default: 'scheduled' }) // scheduled, completed, cancelled, no-show
  status: string;

  @Prop()
  notes: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);