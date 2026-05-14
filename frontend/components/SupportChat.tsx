'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, CheckCircle, Clock, Reply, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface SupportMessage {
  id: string;
  message: string;
  reply: string | null;
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  createdAt: string;
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

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user, token } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'ADMIN';

  // Fetch messages when chat opens
  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [isOpen, user, isAdmin]);

  // Auto-scroll to bottom when messages change
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
      setUsers(data);
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
      // Sort messages: oldest first (ascending) - newest at bottom
      const sortedMessages = [...data].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // User sends a message to support
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/message`,
        { message: messageToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message sent!');
      await fetchMessages(); // Refresh to get new message
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageToSend); // Restore if failed
    } finally {
      setSending(false);
    }
  };

  // Admin replies to a specific user's message
  const sendReply = async (messageId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSending(true);
    const replyToSend = replyText;
    setReplyText('');
    setReplyingTo(null);
    
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/messages/${messageId}/reply`,
        { reply: replyToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Reply sent!');
      await fetchMessages(); // Refresh to get updated message
    } catch (error) {
      toast.error('Failed to send reply');
      setReplyText(replyToSend);
      setReplyingTo(messageId);
    } finally {
      setSending(false);
    }
  };

  // Admin sends a new message as Support to a user
  const sendSupportMessageToUser = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedUserId) {
      toast.error('Please select a user to message');
      return;
    }

    setSending(true);
    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately
    
    try {
      const selectedUser = users.find(u => u.id === selectedUserId);
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/send-to-user`,
        { 
          message: messageToSend,
          userId: selectedUserId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Support message sent to ${selectedUser?.name}!`);
      await fetchMessages(); // Refresh to get new message
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const resolveMessage = async (messageId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/messages/${messageId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message resolved');
      await fetchMessages();
    } catch (error) {
      toast.error('Failed to resolve message');
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

  // Filter messages for current user (for regular users)
  const userMessages = messages.filter(m => m.userId === user?.id);

  // For admin view - group messages by user
  const getUserConversations = () => {
    const userMap = new Map();
    messages.forEach(msg => {
      if (!userMap.has(msg.userId)) {
        userMap.set(msg.userId, {
          userId: msg.userId,
          userName: msg.userName,
          userEmail: msg.userEmail,
          messages: []
        });
      }
      userMap.get(msg.userId).messages.push(msg);
    });
    return Array.from(userMap.values());
  };

  const conversations = getUserConversations();

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
                       w-[calc(100%-16px)] md:w-[500px] h-[85vh] md:h-[650px] 
                       bg-black border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 md:p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold text-sm md:text-base">Support</h3>
                <p className="text-blue-100 text-xs">We reply immediately</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {loading ? (
                <div className="text-center text-gray-500 text-sm">Loading messages...</div>
              ) : isAdmin ? (
                /* ADMIN VIEW - Show all user conversations */
                conversations.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-2">Select a user below to start a conversation</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div key={conv.userId} className="bg-[#1a1a1a] rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-white font-semibold">{conv.userName}</p>
                          <p className="text-gray-500 text-xs">{conv.userEmail}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUserId(conv.userId);
                          }}
                          className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs hover:bg-blue-500/30 transition"
                        >
                          Send Message
                        </button>
                      </div>
                      
                      {/* Show last 3 messages in this conversation */}
                      {conv.messages.slice(-3).map((msg: SupportMessage) => (
                        <div key={msg.id} className="mb-2 last:mb-0">
                          <div className="bg-black/30 rounded-lg p-2">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-blue-400 text-xs font-semibold">{msg.userName}</span>
                              {getStatusBadge(msg.status)}
                            </div>
                            <p className="text-white text-sm">{msg.message}</p>
                            {msg.reply && (
                              <div className="mt-2 pl-2 border-l-2 border-blue-500">
                                <span className="text-green-400 text-xs font-semibold">Support:</span>
                                <p className="text-white text-sm mt-1">{msg.reply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Reply input for this conversation */}
                      {selectedUserId === conv.userId && (
                        <div className="mt-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && newMessage.trim()) {
                                  sendSupportMessageToUser();
                                }
                              }}
                              placeholder="Type support message..."
                              className="flex-1 bg-black rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              disabled={sending}
                            />
                            <button
                              onClick={sendSupportMessageToUser}
                              disabled={sending || !newMessage.trim()}
                              className="bg-blue-600 rounded-lg px-3 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                /* USER VIEW - Show only user's own messages */
                userMessages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-2">Type your question below</p>
                  </div>
                ) : (
                  userMessages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      {/* User Message */}
                      <div className="bg-[#1a1a1a] rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-blue-400 text-xs font-semibold">You</span>
                          {getStatusBadge(msg.status)}
                        </div>
                        <p className="text-white text-sm break-words">{msg.message}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Support Reply */}
                      {msg.reply && (
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3 ml-2 md:ml-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-green-400 text-xs font-semibold">Support</span>
                          </div>
                          <p className="text-white text-sm break-words">{msg.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Only show for regular users or admin without selected conversation */}
            {!isAdmin && (
              /* User Input */
              <div className="p-3 md:p-4 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row gap-2">
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
            )}

            {/* Stats for Admin */}
            {isAdmin && (
              <div className="p-2 md:p-3 border-t border-gray-800 bg-[#1a1a1a]">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Messages: {messages.length}</span>
                  <span className="text-yellow-500">
                    Pending: {messages.filter(m => m.status === 'PENDING').length}
                  </span>
                  <span className="text-green-500">
                    Resolved: {messages.filter(m => m.status === 'RESOLVED').length}
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