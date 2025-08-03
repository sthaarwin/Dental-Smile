import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, { socketId: string; userId: string; role: string; name: string }>();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      this.logger.log(`Connection attempt from client ${client.id}`);
      this.logger.log(`Token provided: ${!!token}`);
      
      if (!token) {
        this.logger.warn('Client connection rejected: No token provided');
        client.emit('connect_error', { message: 'No authentication token provided' });
        client.disconnect();
        return;
      }

      // Use the JWT service with proper options
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      const userId = payload.sub;
      const userRole = payload.role;

      this.logger.log(`Token verified successfully for user ${userId} (${userRole})`);

      // Get user information from database to include name
      let userName = 'Unknown User';
      try {
        const user = await this.usersService.findOne(userId);
        userName = user?.name || 'Unknown User';
      } catch (error) {
        this.logger.warn(`Could not fetch user name for ${userId}: ${error.message}`);
      }

      this.connectedUsers.set(client.id, { socketId: client.id, userId, role: userRole, name: userName });
      
      // Join user to their own room
      client.join(`user_${userId}`);
      
      this.logger.log(`User ${userId} (${userName} - ${userRole}) connected with socket ${client.id}`);
      
      // Notify user is online
      this.server.emit('userOnline', { userId, role: userRole, name: userName });
      
      // Send connection success to client
      client.emit('connection_success', { userId, role: userRole, name: userName });
      
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.emit('connect_error', { message: 'Authentication failed: ' + error.message });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      this.logger.log(`User ${userInfo.userId} (${userInfo.name}) disconnected`);
      this.server.emit('userOffline', { userId: userInfo.userId });
      this.connectedUsers.delete(client.id);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    client.join(`conversation_${data.conversationId}`);
    this.logger.log(`User ${userInfo.userId} (${userInfo.name}) joined conversation ${data.conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    client.leave(`conversation_${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      conversationId: string;
      receiverId: string;
      message: string;
      messageType?: 'text' | 'image' | 'file';
    }
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) {
      this.logger.warn('Message send attempt from unauthenticated client');
      client.emit('messageError', { error: 'Authentication required' });
      return;
    }

    if (!data.message || !data.message.trim()) {
      client.emit('messageError', { error: 'Message cannot be empty' });
      return;
    }

    try {
      this.logger.log(`Sending message from ${userInfo.name} (${userInfo.role}) to ${data.receiverId}`);

      // Save message to database
      const savedMessage = await this.chatService.saveMessage({
        conversationId: data.conversationId,
        senderId: userInfo.userId,
        receiverId: data.receiverId,
        message: data.message.trim(),
        messageType: data.messageType || 'text',
      });

      // Create the message object to emit - ensure it has all required fields
      const messageToEmit = {
        id: String(savedMessage._id),
        conversationId: data.conversationId,
        senderId: userInfo.userId,
        receiverId: data.receiverId,
        message: data.message.trim(),
        messageType: data.messageType || 'text',
        timestamp: savedMessage.timestamp,
        senderRole: userInfo.role,
        senderName: userInfo.name,
        isRead: false,
      };

      this.logger.log(`Broadcasting message ${messageToEmit.id} to all relevant clients`);

      // Emit to conversation room (both participants if they're in the conversation)
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', messageToEmit);

      // Also emit directly to both sender and receiver regardless of room membership
      this.server.to(`user_${userInfo.userId}`).emit('newMessage', messageToEmit);
      this.server.to(`user_${data.receiverId}`).emit('newMessage', messageToEmit);

      // Send confirmation to sender
      client.emit('messageSent', { 
        messageId: String(savedMessage._id),
        timestamp: savedMessage.timestamp,
        success: true
      });

      this.logger.log(`Message ${messageToEmit.id} sent successfully`);

    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('messageError', { error: 'Failed to send message: ' + error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; receiverId: string; isTyping: boolean }
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    this.server.to(`conversation_${data.conversationId}`).emit('userTyping', {
      userId: userInfo.userId,
      userName: userInfo.name,
      isTyping: data.isTyping,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string }
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    try {
      await this.chatService.markMessageAsRead(data.messageId, userInfo.userId);
      
      this.server.to(`conversation_${data.conversationId}`).emit('messageRead', {
        messageId: data.messageId,
        readBy: userInfo.userId,
        readByName: userInfo.name,
      });
    } catch (error) {
      this.logger.error('Error marking message as read:', error);
    }
  }
}