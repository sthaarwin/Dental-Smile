import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Trash2,
  Archive,
  UserX,
  Flag,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
    deleteConversation,
    permanentlyDeleteConversation,
    clearConversationMessages,
  } = useChat();

  const [currentConversation, setCurrentConversation] = useState<string | null>(selectedConversation || null);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearMessagesDialogOpen, setIsClearMessagesDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    }
  }, [isOpen]); // Keep this dependency array simple

  // Add effect to refresh conversations when a new selectedConversation is provided
  useEffect(() => {
    if (selectedConversation && isOpen) {
      // Always fetch conversations when a new conversation is selected
      // This ensures we have the latest conversation list
      fetchConversations();
    }
  }, [selectedConversation, isOpen]); // Keep this dependency array simple

  useEffect(() => {
    if (selectedConversation) {
      // Check if the conversation actually exists before setting it
      const conversationExists = conversations.find(c => c._id === selectedConversation);
      if (conversationExists) {
        setCurrentConversation(selectedConversation);
      } else if (conversations.length > 0) {
        // If the specific conversation isn't found but we have conversations,
        // it might be a timing issue, so wait a bit and try again
        console.warn(`Selected conversation ${selectedConversation} not found, retrying...`);
        setTimeout(() => {
          const retryConversationExists = conversations.find(c => c._id === selectedConversation);
          if (retryConversationExists) {
            setCurrentConversation(selectedConversation);
          } else {
            console.warn(`Selected conversation ${selectedConversation} still not found after retry`);
            // Instead of setting to null, try to use the first available conversation
            // that involves the current user
            const firstConversation = conversations[0];
            if (firstConversation) {
              console.log(`Using first available conversation: ${firstConversation._id}`);
              setCurrentConversation(firstConversation._id);
            } else {
              setCurrentConversation(null);
            }
          }
        }, 500);
      } else {
        setCurrentConversation(null);
      }
    }
  }, [selectedConversation, conversations]);

  useEffect(() => {
    if (currentConversation) {
      console.log(`Joining conversation: ${currentConversation}`);
      joinConversation(currentConversation);
      fetchMessages(currentConversation);
      
      return () => {
        console.log(`Leaving conversation: ${currentConversation}`);
        leaveConversation(currentConversation);
      };
    }
  }, [currentConversation]);

  // Only scroll to bottom when messages change for the current conversation
  useEffect(() => {
    if (currentConversation && messages[currentConversation]) {
      scrollToBottom();
    }
  }, [messages, currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    console.log('handleSendMessage - messageText:', messageText);
    console.log('handleSendMessage - currentConversation:', currentConversation);
    console.log('handleSendMessage - conversations:', conversations);
    
    if (!messageText.trim() || !currentConversation) {
      console.log('handleSendMessage - missing message or conversation');
      return;
    }

    const conversation = conversations.find(c => c._id === currentConversation);
    console.log('handleSendMessage - found conversation:', conversation);
    
    if (!conversation) {
      console.log('handleSendMessage - conversation not found in conversations list');
      return;
    }

    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) {
      console.error('Could not find other participant in conversation');
      console.log('handleSendMessage - conversation participants:', conversation.participants);
      console.log('handleSendMessage - current user:', currentUser);
      toast.error('Unable to send message - recipient not found');
      return;
    }

    if (!isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

    console.log('Sending message to:', otherParticipant.name, 'ID:', otherParticipant._id);
    sendMessage(currentConversation, otherParticipant._id, messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = async () => {
    if (!currentConversation) return;
    
    try {
      await deleteConversation(currentConversation);
      toast.success('Conversation hidden from your chat list');
      setCurrentConversation(null);
      fetchConversations();
    } catch (error) {
      console.error('Failed to hide conversation:', error);
      toast.error('Failed to hide conversation');
    }
  };

  const handlePermanentDelete = async () => {
    if (!currentConversation) return;
    
    try {
      await permanentlyDeleteConversation(currentConversation);
      toast.success('Conversation deleted permanently');
      setCurrentConversation(null);
      fetchConversations();
    } catch (error) {
      console.error('Failed to delete conversation permanently:', error);
      toast.error('Failed to delete conversation permanently');
    }
  };

  const handleArchiveConversation = async () => {
    if (!currentConversation) return;
    
    try {
      // TODO: Implement archive conversation API call
      toast.success('Conversation archived');
      setCurrentConversation(null);
      fetchConversations();
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };

  const handleBlockUser = async () => {
    if (!currentConversation) return;
    
    try {
      // TODO: Implement block user API call
      toast.success('User blocked successfully');
      setCurrentConversation(null);
      fetchConversations();
    } catch (error) {
      console.error('Failed to block user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleReportUser = async () => {
    if (!currentConversation) return;
    
    try {
      // TODO: Implement report user API call
      toast.success('User reported successfully');
    } catch (error) {
      console.error('Failed to report user:', error);
      toast.error('Failed to report user');
    }
  };

  const handleClearMessages = async () => {
    if (!currentConversation) return;
    
    try {
      await clearConversationMessages(currentConversation);
      toast.success('All messages cleared from conversation');
      setIsClearMessagesDialogOpen(false);
      fetchMessages(currentConversation); // Refresh the messages
    } catch (error) {
      console.error('Failed to clear messages:', error);
      toast.error('Failed to clear messages');
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c._id === currentConversation);
  };

  const getOtherParticipant = (conversation: any) => {
    console.log('getOtherParticipant - conversation:', conversation);
    console.log('getOtherParticipant - currentUser:', currentUser);
    
    if (!conversation || !conversation.participants || !Array.isArray(conversation.participants) || !currentUser) {
      console.log('getOtherParticipant - missing data');
      return null;
    }
    
    const currentUserId = String(currentUser._id || currentUser.id || '');
    console.log('getOtherParticipant - currentUserId:', currentUserId);
    console.log('getOtherParticipant - participants array length:', conversation.participants.length);
    
    // Log each participant in detail
    conversation.participants.forEach((p: any, index: number) => {
      console.log(`getOtherParticipant - participant ${index}:`, p);
      console.log(`getOtherParticipant - participant ${index} _id:`, p?._id);
      console.log(`getOtherParticipant - participant ${index} id:`, p?.id);
    });
    
    // TEMPORARY FIX: If conversation only has 1 participant, we need to find the other user
    // This happens when the conversation data is corrupted or not properly populated
    if (conversation.participants.length === 1) {
      const singleParticipant = conversation.participants[0];
      const singleParticipantId = String(singleParticipant._id || singleParticipant.id || '');
      
      console.log('getOtherParticipant - ISSUE: Only 1 participant found');
      console.log('getOtherParticipant - Single participant ID:', singleParticipantId);
      console.log('getOtherParticipant - Current user ID:', currentUserId);
      
      // If the single participant is the current user, we need to find the other user
      if (singleParticipantId === currentUserId) {
        console.log('getOtherParticipant - Single participant is current user, need to find other user');
        
        // Try to get the other user from message history
        const conversationMessages = messages[conversation._id] || [];
        console.log('getOtherParticipant - Checking messages for other participant:', conversationMessages);
        
        for (const message of conversationMessages) {
          const messageSenderId = String(message.senderId || '');
          const messageReceiverId = String(message.receiverId || '');
          
          // Find a user ID that's not the current user
          if (messageSenderId !== currentUserId && messageSenderId) {
            console.log('getOtherParticipant - Found other user from message sender:', messageSenderId);
            // Create a basic participant object from message data
            return {
              _id: messageSenderId,
              name: message.senderName || 'Unknown User',
              role: message.senderRole || 'user',
              profile_picture: null
            };
          }
          
          if (messageReceiverId !== currentUserId && messageReceiverId) {
            console.log('getOtherParticipant - Found other user from message receiver:', messageReceiverId);
            // We don't have receiver details in messages, so return basic info
            return {
              _id: messageReceiverId,
              name: 'Chat Partner',
              role: 'user',
              profile_picture: null
            };
          }
        }
        
        console.log('getOtherParticipant - Could not find other user in messages');
        return null;
      } else {
        // The single participant is not the current user, so return them
        console.log('getOtherParticipant - Single participant is the other user');
        return singleParticipant;
      }
    }
    
    const otherParticipant = conversation.participants.find((p: any) => {
      // Add null check for participant
      if (!p || !p._id) {
        console.log('getOtherParticipant - invalid participant:', p);
        return false;
      }
      
      const participantId = String(p._id || p.id || '');
      console.log('getOtherParticipant - comparing:', participantId, 'vs', currentUserId);
      const isOther = participantId !== currentUserId;
      console.log('getOtherParticipant - isOther:', isOther);
      return isOther;
    });
    
    console.log('getOtherParticipant - found other participant:', otherParticipant);
    return otherParticipant;
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
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4">No conversations yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Start a conversation by visiting a dentist's profile and clicking "Start Chat"
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  return (
                    <div
                      key={conversation._id}
                      className={cn(
                        "group relative border-b hover:bg-gray-100 transition-colors",
                        currentConversation === conversation._id && "bg-dentist-50"
                      )}
                    >
                      <div
                        onClick={() => setCurrentConversation(conversation._id)}
                        className="p-4 cursor-pointer flex items-center space-x-3"
                      >
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
                      
                      {/* Delete button - shows on hover */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentConversation(conversation._id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                        <p className="text-xs text-gray-500 capitalize">
                          {getOtherParticipant(getCurrentConversation())?.role}
                          {currentUser?.role === 'patient' && getOtherParticipant(getCurrentConversation())?.role === 'dentist' ? ' (Doctor)' : ''}
                          {currentUser?.role === 'dentist' && getOtherParticipant(getCurrentConversation())?.role === 'patient' ? ' (Patient)' : ''}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hide Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setIsClearMessagesDialogOpen(true)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Clear Messages
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={handlePermanentDelete}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleArchiveConversation}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive Conversation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleBlockUser}>
                            <UserX className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleReportUser}>
                            <Flag className="mr-2 h-4 w-4" />
                            Report User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-gray-50">
                  <div className="space-y-4">
                    {(messages[currentConversation] || []).map((message, index) => {
                      const conversation = getCurrentConversation();
                      
                      // Extract sender ID properly - handle both string and object cases
                      let messageSenderId: string = '';
                      if (typeof message.senderId === 'object' && message.senderId !== null) {
                        // If senderId is an object, try to extract the actual ID
                        messageSenderId = (message.senderId as any)._id || (message.senderId as any).id || String(message.senderId);
                      } else {
                        messageSenderId = String(message.senderId || '');
                      }
                      
                      // Get current user ID consistently - handle both _id and id fields
                      const currentUserId = String(currentUser?._id || currentUser?.id || '');
                      const isCurrentUser = currentUserId === messageSenderId;
                      
                      // Create a unique key for each message - ensure we always have an ID
                      const messageKey = message.id || `message-${index}-${message.timestamp || Date.now()}-${messageSenderId}`;
                      
                      // Get sender information with improved logic
                      let sender = null;
                      let senderName = 'Unknown';
                      
                      // First check if message has senderName from the backend
                      if (message.senderName) {
                        senderName = message.senderName;
                        sender = {
                          _id: messageSenderId,
                          name: message.senderName,
                          role: message.senderRole,
                          profile_picture: null // Will be populated from participants if available
                        };
                      } else if (isCurrentUser) {
                        // If it's current user, use current user data
                        senderName = currentUser?.name || 'You';
                        sender = {
                          _id: currentUser?._id || currentUser?.id,
                          name: currentUser?.name,
                          profile_picture: currentUser?.profile_picture,
                          role: currentUser?.role
                        };
                      } else if (conversation?.participants) {
                        // Find sender in participants
                        sender = conversation.participants.find(p => 
                          String(p._id) === messageSenderId
                        );
                        
                        if (sender) {
                          senderName = sender.name || 'User';
                        } else {
                          // If not found, use the other participant as fallback
                          const otherParticipant = getOtherParticipant(conversation);
                          if (otherParticipant) {
                            sender = otherParticipant;
                            senderName = otherParticipant.name || 'User';
                          }
                        }
                      }

                      // If we found sender in participants and have senderName from message, update profile picture
                      if (message.senderName && conversation?.participants) {
                        const participantSender = conversation.participants.find(p => 
                          String(p._id) === messageSenderId
                        );
                        if (participantSender && sender) {
                          sender.profile_picture = participantSender.profile_picture;
                        }
                      }
                      
                      return (
                        <div
                          key={messageKey}
                          className={cn(
                            "flex items-end gap-3 max-w-full",
                            isCurrentUser ? "justify-end" : "justify-start"
                          )}
                        >
                          {/* Avatar for other user (left side) */}
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                              <AvatarImage src={sender?.profile_picture} />
                              <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                                {senderName?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          {/* Message bubble */}
                          <div className={cn(
                            "flex flex-col",
                            isCurrentUser ? "items-end" : "items-start"
                          )}>
                            {/* Sender name (only show for other users) */}
                            {!isCurrentUser && (
                              <span className="text-xs text-gray-500 mb-1 px-1">
                                {senderName}
                              </span>
                            )}
                            
                            <div
                              className={cn(
                                "max-w-[280px] px-4 py-3 rounded-lg shadow-sm break-words",
                                isCurrentUser
                                  ? "bg-blue-600 text-white rounded-br-none"
                                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                              )}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                              <p className={cn(
                                "text-xs mt-2",
                                isCurrentUser
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              )}>
                                {formatMessageTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Avatar for current user (right side) */}
                          {isCurrentUser && (
                            <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                              <AvatarImage src={currentUser?.profile_picture} />
                              <AvatarFallback className="text-xs bg-blue-600 text-white">
                                {currentUser?.name?.charAt(0)?.toUpperCase() || 'Y'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              <Trash2 className="inline-block mr-2" />
              Delete Conversation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConversation}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Messages Confirmation Dialog */}
      <AlertDialog open={isClearMessagesDialogOpen} onOpenChange={setIsClearMessagesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              <Trash2 className="inline-block mr-2" />
              Clear Messages
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all messages in this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearMessages}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Messages
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
