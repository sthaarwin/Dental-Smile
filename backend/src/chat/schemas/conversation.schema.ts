import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;

  @Prop({ default: Date.now })
  lastMessageTime: Date;

  @Prop({ default: true })
  isActive: boolean;

  // Track which users have "deleted" (hidden) this conversation
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  hiddenFrom: Types.ObjectId[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);