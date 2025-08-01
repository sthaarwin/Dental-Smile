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
      console.log('No token or user found, skipping chat connection');
      return;
    }

    const userData = JSON.parse(user);
    console.log(`Initializing chat connection for ${userData.role}: ${userData.name}`);
    
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
      console.log(`Chat server connected for ${userData.role}: ${userData.name}`);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Chat server disconnected for ${userData.role}: ${userData.name}, reason:`, reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error(`Chat connection error for ${userData.role}: ${userData.name}:`, error);
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Received new message:', message);
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message]
      }));
      
      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId 
            ? { ...conv, lastMessage: message, lastMessageTime: message.timestamp }
            : conv
        )
      );
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

    setSocket(newSocket);

    return () => {
      console.log(`Cleaning up chat connection for ${userData.role}: ${userData.name}`);
      newSocket.close();
    };
  }, []);

  const sendMessage = (conversationId: string, receiverId: string, message: string) => {
    console.log('ChatContext sendMessage called:', {
      conversationId,
      receiverId,
      message,
      socketExists: !!socket,
      isConnected
    });

    if (!socket) {
      console.error('Socket not available');
      return;
    }

    if (!isConnected) {
      console.error('Socket not connected');
      return;
    }

    const messageData = {
      conversationId,
      receiverId,
      message,
      messageType: 'text',
    };

    console.log('Emitting sendMessage event:', messageData);
    socket.emit('sendMessage', messageData);

    // Add the message optimistically to the UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: JSON.parse(localStorage.getItem('user') || '{}').id,
      receiverId,
      message,
      messageType: 'text' as const,
      timestamp: new Date().toISOString(),
      senderRole: JSON.parse(localStorage.getItem('user') || '{}').role,
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
    console.log('Creating conversation with participant ID:', participantId);
    console.log('Token exists:', !!token);
    
    const response = await fetch('http://localhost:8000/api/chat/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ participantId }),
    });

    console.log('Create conversation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create conversation:', response.status, errorText);
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    const conversationData = await response.json();
    console.log('Created conversation:', conversationData);
    
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
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.reverse()
        }));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
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