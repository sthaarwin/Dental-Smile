import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Phone,
  Video,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConversation?: string;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose, selectedConversation }) => {
  const {
    conversations,
    messages,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    fetchConversations,
    fetchMessages,
  } = useChat();

  const [currentConversation, setCurrentConversation] = useState<string | null>(selectedConversation || null);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      setCurrentConversation(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (currentConversation) {
      joinConversation(currentConversation);
      fetchMessages(currentConversation);
      
      return () => {
        leaveConversation(currentConversation);
      };
    }
  }, [currentConversation, joinConversation, leaveConversation, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentConversation) return;

    const conversation = conversations.find(c => c._id === currentConversation);
    if (!conversation) return;

    const otherParticipant = conversation.participants.find(p => p._id !== currentUser?.id);
    if (!otherParticipant) return;

    sendMessage(currentConversation, otherParticipant._id, messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c._id === currentConversation);
  };

  const getOtherParticipant = (conversation: any) => {
    if (!conversation || !conversation.participants || !currentUser) {
      return null;
    }
    return conversation.participants.find((p: any) => p._id !== currentUser?.id);
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <MessageCircle className="h-5 w-5 text-dentist-600" />
              <CardTitle>Chat</CardTitle>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex p-0">
          {/* Conversations List */}
          <div className={cn(
            "w-full lg:w-1/3 border-r bg-gray-50",
            currentConversation && "hidden lg:block"
          )}>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Conversations</h3>
            </div>
            <ScrollArea className="h-full">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => setCurrentConversation(conversation._id)}
                      className={cn(
                        "p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors",
                        currentConversation === conversation._id && "bg-dentist-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant?.profile_picture} />
                          <AvatarFallback>
                            {otherParticipant?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherParticipant?.name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage && 
                                formatMessageTime(conversation.lastMessage.timestamp)
                              }
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.message || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Chat Messages */}
          <div className={cn(
            "flex-1 flex flex-col",
            !currentConversation && "hidden lg:flex"
          )}>
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentConversation(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getOtherParticipant(getCurrentConversation())?.profile_picture} />
                        <AvatarFallback>
                          {getOtherParticipant(getCurrentConversation())?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {getOtherParticipant(getCurrentConversation())?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getOtherParticipant(getCurrentConversation())?.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {(messages[currentConversation] || []).map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.senderId === currentUser?.id ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg",
                            message.senderId === currentUser?.id
                              ? "bg-dentist-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          )}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            message.senderId === currentUser?.id
                              ? "text-dentist-100"
                              : "text-gray-500"
                          )}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;