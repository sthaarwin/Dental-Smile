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

  async createConversation(userId: string, participantId: string): Promise<Conversation> {
    // Check if conversation already exists between these two users (regardless of role order)
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [userId, participantId], $size: 2 }
    }).populate('participants', 'name email role profile_picture');

    if (existingConversation) {
      console.log(`Found existing conversation between ${userId} and ${participantId}: ${existingConversation._id}`);
      return existingConversation;
    }

    console.log(`Creating new conversation between ${userId} and ${participantId}`);
    const conversation = new this.conversationModel({
      participants: [userId, participantId],
      lastMessage: null,
      lastMessageTime: new Date(),
    });

    const savedConversation = await conversation.save();
    
    // Populate the participants before returning
    const populatedConversation = await this.conversationModel
      .findById(savedConversation._id)
      .populate('participants', 'name email role profile_picture')
      .exec();
    
    if (!populatedConversation) {
      throw new Error('Failed to create conversation');
    }
    
    return populatedConversation;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ 
        participants: userId,
        hiddenFrom: { $ne: userId } // Exclude conversations hidden by this user
      })
      .populate('participants', 'name email role profile_picture')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .exec();
  }

  async getConversationMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const skip = (page - 1) * limit;
    
    // Get the conversation to access participants
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('participants', 'name email role profile_picture')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Fetch messages with proper population
    const messages = await this.messageModel
      .find({ conversationId })
      .populate('senderId', 'name email role profile_picture')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Enhance messages with sender information
    const enhancedMessages = messages.map(message => {
      const messageObj = message.toObject();
      // Type assertion for populated senderId
      const sender = messageObj.senderId as any;

      return {
        ...messageObj,
        senderName: sender?.name || 'Unknown User',
        senderRole: sender?.role || 'user'
      };
    });

    return enhancedMessages;
  }

  async saveMessage(messageData: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType: string;
  }): Promise<MessageDocument> {
    console.log('saveMessage - received messageData:', messageData);
    
    // Ensure receiverId is a proper string (not an object)
    const receiverId = typeof messageData.receiverId === 'object' 
      ? String(messageData.receiverId) 
      : messageData.receiverId;
    
    console.log('saveMessage - processed receiverId:', receiverId);
    
    const message = new this.messageModel({
      ...messageData,
      receiverId, // Use the processed receiverId
      timestamp: new Date(),
      isRead: false,
    });

    const savedMessage = await message.save();

    try {
      // Update conversation's last message and remove receiver from hiddenFrom if they had hidden it
      // Only attempt to pull from hiddenFrom if receiverId is a valid ObjectId string
      if (receiverId && receiverId.length === 24 && /^[0-9a-fA-F]{24}$/.test(receiverId)) {
        await this.conversationModel.findByIdAndUpdate(
          messageData.conversationId,
          {
            lastMessage: savedMessage._id,
            lastMessageTime: savedMessage.timestamp,
            $pull: { hiddenFrom: receiverId } // Unhide conversation for receiver
          }
        );
      } else {
        console.warn('Invalid receiverId for hiddenFrom update:', receiverId);
        // Just update without the $pull operation
        await this.conversationModel.findByIdAndUpdate(
          messageData.conversationId,
          {
            lastMessage: savedMessage._id,
            lastMessageTime: savedMessage.timestamp,
          }
        );
      }
    } catch (error) {
      console.error('Error updating conversation after saving message:', error);
      // Don't throw here, message was saved successfully
    }

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

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // Check if the conversation exists and user is a participant
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or you are not a participant');
    }

    // Add user to hiddenFrom array instead of deleting the conversation
    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      { $addToSet: { hiddenFrom: userId } }
    );

    // If both participants have hidden the conversation, then actually delete it
    const updatedConversation = await this.conversationModel.findById(conversationId);
    if (updatedConversation && updatedConversation.hiddenFrom.length === updatedConversation.participants.length) {
      // All participants have hidden it, safe to delete completely
      await this.messageModel.deleteMany({ conversationId });
      await this.conversationModel.findByIdAndDelete(conversationId);
    }
  }

  async permanentlyDeleteConversation(conversationId: string, userId: string): Promise<void> {
    // Check if the conversation exists and user is a participant
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or you are not a participant');
    }

    // Permanently delete all messages in this conversation
    await this.messageModel.deleteMany({ conversationId });

    // Permanently delete the conversation
    await this.conversationModel.findByIdAndDelete(conversationId);
  }

  async clearConversationMessages(conversationId: string, userId: string): Promise<void> {
    // Check if the conversation exists and user is a participant
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or you are not a participant');
    }

    // Delete all messages in this conversation
    await this.messageModel.deleteMany({ conversationId });

    // Update conversation to remove last message reference
    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      { 
        lastMessage: null,
        lastMessageTime: new Date()
      }
    );
  }
}