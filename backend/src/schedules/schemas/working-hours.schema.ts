import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type WorkingHoursDocument = WorkingHours & Document;

@Schema()
export class DailyHours {
  @Prop({ required: true })
  isWorking: boolean;

  @Prop()
  startTime: string;

  @Prop()
  endTime: string;

  @Prop({ type: [String] })
  breaks: string[];
}

@Schema({ timestamps: true })
export class WorkingHours {
  @Prop()
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  dentist: User;

  @Prop({ type: DailyHours })
  monday: DailyHours;

  @Prop({ type: DailyHours })
  tuesday: DailyHours;

  @Prop({ type: DailyHours })
  wednesday: DailyHours;

  @Prop({ type: DailyHours })
  thursday: DailyHours;

  @Prop({ type: DailyHours })
  friday: DailyHours;

  @Prop({ type: DailyHours })
  saturday: DailyHours;

  @Prop({ type: DailyHours })
  sunday: DailyHours;

  @Prop({ type: [Date] })
  daysOff: Date[];

  // Define as optional method that will be implemented by Mongoose
  toObject?(): Record<string, any>;
}

export const WorkingHoursSchema = SchemaFactory.createForClass(WorkingHours);