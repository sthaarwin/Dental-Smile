import { Controller, Get, Post, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversation')
  async createConversation(
    @GetUser() user: any,
    @Body() body: { participantId: string }
  ) {
    return this.chatService.createConversation(user.id, body.participantId);
  }

  @Get('conversations')
  async getConversations(@GetUser() user: any) {
    return this.chatService.getConversations(user.id);
  }

  @Get('conversations/:id/messages')
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    return this.chatService.getConversationMessages(
      conversationId,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get('unread-count')
  async getUnreadMessageCount(@GetUser() user: any) {
    const count = await this.chatService.getUnreadMessageCount(user.id);
    return { count };
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') conversationId: string,
    @GetUser() user: any
  ) {
    return this.chatService.deleteConversation(conversationId, user.id);
  }
}