'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface SupportMessage {
  id: string;
  message: string;
  reply: string | null;
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userName: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface UserWithMessage {
  id: string;
  name: string;
  email: string;
  lastMessage: Date;
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user, token } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [isOpen, user, isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredUsers = data.filter((u: User) => u.role !== 'ADMIN');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/support/messages`
        : `${process.env.NEXT_PUBLIC_API_URL}/support/my-messages`;
      
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort messages by createdAt (oldest first)
      const sortedMessages = [...data].sort((a: SupportMessage, b: SupportMessage) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // User sends a message
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    const messageToSend = newMessage;
    setNewMessage('');
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/message`,
        { message: messageToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Message sent response:', response.data);
      toast.success('Message sent!');
      await fetchMessages(); // Refresh to get all messages
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  // Admin sends a support message to selected user
  const sendSupportMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    setSending(true);
    const messageToSend = newMessage;
    setNewMessage('');
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/send-to-user`,
        { 
          message: messageToSend,
          userId: selectedUser.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Support message sent response:', response.data);
      toast.success(`Message sent to ${selectedUser.name}`);
      await fetchMessages(); // Refresh to get all messages (including previous ones)
    } catch (error) {
      console.error('Send support message error:', error);
      toast.error('Failed to send message');
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 text-yellow-500 text-xs"><Clock className="w-3 h-3" /> Pending</span>;
      case 'REPLIED':
        return <span className="flex items-center gap-1 text-blue-500 text-xs"><CheckCircle className="w-3 h-3" /> Replied</span>;
      case 'RESOLVED':
        return <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle className="w-3 h-3" /> Resolved</span>;
      default:
        return null;
    }
  };

  // Get messages for selected user (admin view)
  const getSelectedUserMessages = () => {
    return messages.filter((m: SupportMessage) => m.userId === selectedUser?.id);
  };

  // Get all unique users with messages (for admin list)
  const getUsersWithMessages = (): UserWithMessage[] => {
    const userMap = new Map<string, UserWithMessage>();
    messages.forEach((msg: SupportMessage) => {
      if (!userMap.has(msg.userId)) {
        userMap.set(msg.userId, {
          id: msg.userId,
          name: msg.userName,
          email: msg.userEmail,
          lastMessage: new Date(msg.createdAt)
        });
      }
    });
    return Array.from(userMap.values()).sort((a, b) => 
      b.lastMessage.getTime() - a.lastMessage.getTime()
    );
  };

  const usersWithMessages = getUsersWithMessages();
  const selectedUserMessages = getSelectedUserMessages();

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 md:p-4 shadow-lg hover:scale-105 transition active:scale-95"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 right-2 left-2 md:bottom-24 md:right-4 md:left-auto z-50 
                       w-[calc(100%-16px)] md:w-[550px] h-[85vh] md:h-[650px] 
                       bg-black border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 md:p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold text-sm md:text-base">Support</h3>
                <p className="text-blue-100 text-xs">We reply immediately</p>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setSelectedUser(null);
                }} 
                className="text-white hover:opacity-80 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Welcome Message */}
            <div className="bg-[#1a1a1a] p-3 md:p-4 border-b border-gray-800">
              <p className="text-gray-300 text-xs md:text-sm">
                Welcome to our store! 😊 Whether you have a specific question or need assistance, 
                we're here for you. 😉 What would you like to know?
              </p>
            </div>

            {/* Admin View - User List or Conversation */}
            {isAdmin ? (
              <>
                {!selectedUser ? (
                  /* User List */
                  <div className="flex-1 overflow-y-auto">
                    {usersWithMessages.length === 0 && users.length === 0 ? (
                      <div className="text-center text-gray-500 p-8">
                        <p>No users yet</p>
                      </div>
                    ) : (
                      <>
                        {/* Users with existing messages */}
                        {usersWithMessages.map((u: UserWithMessage) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              const fullUser = users.find(usr => usr.id === u.id) || {
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                role: 'USER'
                              };
                              setSelectedUser(fullUser as User);
                              setNewMessage('');
                            }}
                            className="w-full text-left p-4 border-b border-gray-800 hover:bg-[#1a1a1a] transition"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-white font-semibold">{u.name}</p>
                                <p className="text-gray-500 text-xs">{u.email}</p>
                              </div>
                              <span className="text-gray-600 text-xs">
                                {u.lastMessage.toLocaleTimeString()}
                              </span>
                            </div>
                          </button>
                        ))}
                        
                        {/* Users with no messages yet */}
                        {users.filter((u: User) => !usersWithMessages.some((w: UserWithMessage) => w.id === u.id)).map((u: User) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setSelectedUser(u);
                              setNewMessage('');
                            }}
                            className="w-full text-left p-4 border-b border-gray-800 hover:bg-[#1a1a1a] transition"
                          >
                            <p className="text-white font-semibold">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                            <p className="text-gray-600 text-xs mt-1">No messages yet</p>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  /* Conversation View with Selected User */
                  <>
                    {/* Conversation Header with Back Button */}
                    <div className="bg-[#1a1a1a] p-3 border-b border-gray-800 flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-400 hover:text-white transition"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <p className="text-white font-semibold">{selectedUser.name}</p>
                        <p className="text-gray-500 text-xs">{selectedUser.email}</p>
                      </div>
                    </div>

                    {/* Messages Area - Show ALL messages */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                      {selectedUserMessages.length === 0 ? (
                        <div className="text-center text-gray-500">
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs mt-2">Type your message below</p>
                        </div>
                      ) : (
                        selectedUserMessages.map((msg: SupportMessage) => (
                          <div key={msg.id} className="space-y-2">
                            {/* User Message */}
                            <div className="bg-[#1a1a1a] rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-400 text-xs font-semibold">{msg.userName}</span>
                                  <span className="text-gray-600 text-[10px]">
                                    {new Date(msg.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                {getStatusBadge(msg.status)}
                              </div>
                              <p className="text-white text-sm break-words">{msg.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area for Selected User */}
                    <div className="p-3 md:p-4 border-t border-gray-800 bg-[#1a1a1a]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newMessage.trim() && !sending) {
                              sendSupportMessage();
                            }
                          }}
                          placeholder={`Message ${selectedUser.name}...`}
                          className="flex-1 bg-black rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={sending}
                          autoFocus
                        />
                        <button
                          onClick={sendSupportMessage}
                          disabled={sending || !newMessage.trim()}
                          className="bg-blue-600 rounded-lg px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-xs mt-2 text-center">
                        Message will appear as message from you to {selectedUser.name}
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* User View - Regular user sees only their own conversation */
              <>
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-2">Type your question below</p>
                    </div>
                  ) : (
                    messages.map((msg: SupportMessage) => (
                      <div key={msg.id} className="space-y-2">
                        {/* User Message */}
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-blue-400 text-xs font-semibold">You</span>
                            {getStatusBadge(msg.status)}
                            <span className="text-gray-600 text-[10px]">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white text-sm break-words">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* User Input */}
                <div className="p-3 md:p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMessage.trim() && !sending) {
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message here..."
                      className="flex-1 bg-[#1a1a1a] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-600 rounded-lg px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs mt-2 text-center">
                    Our support team typically replies within minutes
                  </p>
                </div>
              </>
            )}

            {/* Stats */}
            {isAdmin && (
              <div className="p-2 md:p-3 border-t border-gray-800 bg-[#1a1a1a]">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Conversations: {usersWithMessages.length}</span>
                  <span className="text-yellow-500">
                    Pending: {messages.filter((m: SupportMessage) => m.status === 'PENDING').length}
                  </span>
                  <span className="text-green-500">
                    Resolved: {messages.filter((m: SupportMessage) => m.status === 'RESOLVED').length}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}