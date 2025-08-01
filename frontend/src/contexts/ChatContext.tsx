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
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      // Refresh data on reconnection
      fetchConversations();
      fetchUnreadCount();
    });

    newSocket.on('reconnect_error', (error) => {
      // Reconnection error
    });

    newSocket.on('reconnect_failed', () => {
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      // Remove any temporary message with the same content
      setMessages(prev => {
        const conversationMessages = prev[message.conversationId] || [];
        const filteredMessages = conversationMessages.filter(m => 
          !(m && m.id && m.id.startsWith('temp-') && m.message === message.message && m.senderId === message.senderId)
        );
        
        return {
          ...prev,
          [message.conversationId]: [...filteredMessages, message]
        };
      });
      
      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId 
            ? { ...conv, lastMessage: message, lastMessageTime: message.timestamp }
            : conv
        )
      );
      
      // Update unread count if message is not from current user
      if (message.senderId !== userData.id) {
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
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (conversationId: string, receiverId: string, message: string) => {
    if (!socket) {
      return;
    }

    if (!isConnected) {
      return;
    }

    const messageData = {
      conversationId,
      receiverId,
      message,
      messageType: 'text',
    };

    socket.emit('sendMessage', messageData);

    // Add the message optimistically to the UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: JSON.parse(localStorage.getItem('user') || '{}')._id, // Use _id instead of id
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
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.reverse()
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