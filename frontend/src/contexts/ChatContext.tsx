import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: string;
  senderRole: string;
  senderName?: string; // Add senderName field
  isRead: boolean;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    profile_picture?: string;
  }>;
  lastMessage?: Message;
  lastMessageTime: string;
}

interface ChatContextType {
  socket: Socket | null;
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  unreadCount: number;
  isConnected: boolean;
  sendMessage: (conversationId: string, receiverId: string, message: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  markAsRead: (conversationId: string, messageId: string) => void;
  createConversation: (participantId: string) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  permanentlyDeleteConversation: (conversationId: string) => Promise<void>;
  clearConversationMessages: (conversationId: string) => Promise<void>;
  fetchConversations: () => void;
  fetchMessages: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return;
    }

    const userData = JSON.parse(user);
    
    const newSocket = io('http://localhost:8000/chat', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      
      // Fetch initial data on connection
      fetchConversations();
      fetchUnreadCount();
    });

    newSocket.on('connection_success', (data) => {
      // Connection successful
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      console.error('Socket connection error:', error);
    });

    newSocket.on('auth_error', (error) => {
      setIsConnected(false);
      console.error('Socket authentication error:', error);
      
      // If token is expired, try to refresh or redirect to login
      if (error.message && error.message.includes('jwt expired')) {
        // Clear expired token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      // Refresh data on reconnection
      fetchConversations();
      fetchUnreadCount();
    });

    newSocket.on('reconnect_error', (error) => {
      // Reconnection error
      console.error('Socket reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Received new message from:', message.senderName, 'Role:', message.senderRole);
      console.log('Full message details:', message);
      
      // Ensure message has a valid ID
      if (!message.id) {
        console.warn('Received message without ID, generating one:', message);
        message.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      setMessages(prev => {
        const conversationMessages = prev[message.conversationId] || [];
        
        // Check if this exact message already exists (by ID)
        const messageExists = conversationMessages.some(m => 
          m.id === message.id
        );
        
        if (messageExists) {
          console.log('Message already exists, skipping duplicate:', message.id);
          return prev; // Don't add duplicate
        }
        
        // Remove any temporary messages that match this message content
        const filteredMessages = conversationMessages.filter(m => {
          if (!m.id || !m.id.startsWith('temp-')) {
            return true; // Keep all non-temporary messages
          }
          
          // Remove temp messages that match exactly
          const isSameSender = String(m.senderId) === String(message.senderId);
          const isSameMessage = m.message === message.message;
          const isRecent = Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 30000; // 30 seconds
          
          if (isSameSender && isSameMessage && isRecent) {
            console.log('Removing temporary message that matches server message:', m.id);
            return false;
          }
          return true;
        });
        
        // Always add the new message from the server
        const updatedMessages = [...filteredMessages, message];
        
        console.log('Updated messages for conversation:', message.conversationId, updatedMessages.length);
        
        return {
          ...prev,
          [message.conversationId]: updatedMessages
        };
      });
      
      // Update conversation's last message AND fetch conversations if needed
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(conv => conv._id === message.conversationId);
        
        if (existingConvIndex >= 0) {
          // Update existing conversation
          return prev.map(conv => 
            conv._id === message.conversationId 
              ? { ...conv, lastMessage: message, lastMessageTime: message.timestamp }
              : conv
          );
        } else {
          // If conversation doesn't exist, fetch conversations to get the latest list
          console.log('Conversation not found in list, refetching conversations...');
          setTimeout(() => {
            fetchConversations();
          }, 100); // Small delay to avoid race conditions
          return prev;
        }
      });
      
      // Update unread count if message is not from current user
      const currentUserId = String(userData._id || userData.id);
      const messageSenderId = String(message.senderId);
      
      console.log('Checking unread count:', {
        currentUserId,
        messageSenderId,
        isFromCurrentUser: messageSenderId === currentUserId
      });
      
      if (messageSenderId !== currentUserId) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('messageRead', ({ messageId, readBy }) => {
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(conversationId => {
          updated[conversationId] = updated[conversationId].map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          );
        });
        return updated;
      });
    });

    newSocket.on('messageError', (error) => {
      // Handle message error
      console.error('Message error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (conversationId: string, receiverId: string, message: string) => {
    if (!socket || !isConnected) {
      console.error('Socket not available or not connected');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('Sending message:', {
      conversationId,
      receiverId,
      message,
      fromUser: userData.name,
      fromRole: userData.role
    });

    // Send message to server
    socket.emit('sendMessage', {
      conversationId,
      receiverId,
      message: message.trim(),
      messageType: 'text',
    });

    // Add optimistic message to UI
    const tempMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      conversationId,
      senderId: userData._id || userData.id,
      receiverId,
      message: message.trim(),
      messageType: 'text' as const,
      timestamp: new Date().toISOString(),
      senderRole: userData.role,
      senderName: userData.name,
      isRead: false,
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), tempMessage]
    }));
  };

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('joinConversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leaveConversation', { conversationId });
    }
  };

  const markAsRead = (conversationId: string, messageId: string) => {
    if (socket && isConnected) {
      socket.emit('markAsRead', { conversationId, messageId });
    }
  };

  const createConversation = async (participantId: string): Promise<Conversation> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:8000/api/chat/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ participantId }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    const conversationData = await response.json();
    
    // Check if conversation already exists in local state
    const existingIndex = conversations.findIndex(conv => conv._id === conversationData._id);
    
    if (existingIndex >= 0) {
      // Update existing conversation
      setConversations(prev => 
        prev.map((conv, index) => 
          index === existingIndex ? conversationData : conv
        )
      );
    } else {
      // Add new conversation to the beginning of the list
      setConversations(prev => [conversationData, ...prev]);
    }
    
    return conversationData;
  };

  const deleteConversation = async (conversationId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }

    setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
  };

  const permanentlyDeleteConversation = async (conversationId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/chat/conversations/${conversationId}/permanent`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to permanently delete conversation');
    }

    setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
  };

  const clearConversationMessages = async (conversationId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/chat/conversations/${conversationId}/messages`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to clear conversation messages');
    }

    setMessages(prev => ({
      ...prev,
      [conversationId]: [],
    }));

    // Update the conversation to show no messages
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, lastMessage: undefined }
          : conv
      )
    );
  };

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:8000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations:', response.status, response.statusText);
      }
    } catch (error) {

      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure all messages have valid IDs
        const messagesWithIds = data.map((message: any, index: number) => {
          if (!message.id) {
            console.warn('Message without ID found, generating one:', message);
            message.id = `msg-fetch-${Date.now()}-${index}`;
          }
          return message;
        });
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: messagesWithIds.reverse()
        }));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/chat/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const value = {
    socket,
    conversations,
    messages,
    unreadCount,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    createConversation,
    deleteConversation,
    permanentlyDeleteConversation,
    clearConversationMessages,
    fetchConversations,
    fetchMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};