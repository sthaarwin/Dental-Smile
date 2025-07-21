import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  async createConversation(patientId: string, dentistId: string): Promise<Conversation> {
    // Check if conversation already exists
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [patientId, dentistId] }
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel({
      participants: [patientId, dentistId],
      lastMessage: null,
      lastMessageTime: new Date(),
    });

    return conversation.save();
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'name email role profile_picture')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .exec();
  }

  async getConversationMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const skip = (page - 1) * limit;
    
    return this.messageModel
      .find({ conversationId })
      .populate('senderId', 'name email role profile_picture')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async saveMessage(messageData: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType: string;
  }): Promise<MessageDocument> {
    const message = new this.messageModel({
      ...messageData,
      timestamp: new Date(),
      isRead: false,
    });

    const savedMessage = await message.save();

    // Update conversation's last message
    await this.conversationModel.findByIdAndUpdate(
      messageData.conversationId,
      {
        lastMessage: savedMessage._id,
        lastMessageTime: savedMessage.timestamp,
      }
    );

    return savedMessage;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const conversations = await this.conversationModel.find({
      participants: userId
    });

    const conversationIds = conversations.map(conv => conv._id);
    
    return this.messageModel.countDocuments({
      conversationId: { $in: conversationIds },
      receiverId: userId,
      isRead: false,
    });
  }
}