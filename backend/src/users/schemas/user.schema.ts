import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone_number: string;

  @Prop({ default: 'patient' })
  role: string;

  @Prop()
  profile_picture: string;

  // Define as optional method that will be implemented by Mongoose
  toObject?(): Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);