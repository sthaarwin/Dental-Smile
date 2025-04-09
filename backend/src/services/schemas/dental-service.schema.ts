import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DentalServiceDocument = DentalService & Document;

@Schema({ timestamps: true })
export class DentalService {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  duration: number; // in minutes

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const DentalServiceSchema = SchemaFactory.createForClass(DentalService);