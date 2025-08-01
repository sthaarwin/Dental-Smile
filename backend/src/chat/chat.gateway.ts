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
  private connectedUsers = new Map<string, { socketId: string; userId: string; role: string }>();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
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

      this.connectedUsers.set(client.id, { socketId: client.id, userId, role: userRole });
      
      // Join user to their own room
      client.join(`user_${userId}`);
      
      this.logger.log(`User ${userId} (${userRole}) connected with socket ${client.id}`);
      
      // Notify user is online
      this.server.emit('userOnline', { userId, role: userRole });
      
      // Send connection success to client
      client.emit('connection_success', { userId, role: userRole });
      
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.emit('connect_error', { message: 'Authentication failed: ' + error.message });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      this.logger.log(`User ${userInfo.userId} disconnected`);
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
    this.logger.log(`User ${userInfo.userId} joined conversation ${data.conversationId}`);
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
    if (!userInfo) return;

    try {
      // Save message to database
      const savedMessage = await this.chatService.saveMessage({
        conversationId: data.conversationId,
        senderId: userInfo.userId,
        receiverId: data.receiverId,
        message: data.message,
        messageType: data.messageType || 'text',
      });

      // Emit message to conversation room
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', {
        id: String(savedMessage._id),
        conversationId: data.conversationId,
        senderId: userInfo.userId,
        receiverId: data.receiverId,
        message: data.message,
        messageType: data.messageType || 'text',
        timestamp: savedMessage.timestamp,
        senderRole: userInfo.role,
      });

      // Also emit to specific user rooms
      this.server.to(`user_${data.receiverId}`).emit('newMessage', {
        id: String(savedMessage._id),
        conversationId: data.conversationId,
        senderId: userInfo.userId,
        receiverId: data.receiverId,
        message: data.message,
        messageType: data.messageType || 'text',
        timestamp: savedMessage.timestamp,
        senderRole: userInfo.role,
      });

    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('messageError', { error: 'Failed to send message' });
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
      });
    } catch (error) {
      this.logger.error('Error marking message as read:', error);
    }
  }
}