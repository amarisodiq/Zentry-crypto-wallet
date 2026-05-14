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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showUserSelector, setShowUserSelector] = useState(false);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/message`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message sent!');
      setNewMessage('');
      await fetchMessages();
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (messageId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/messages/${messageId}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Reply sent!');
      setReplyingTo(null);
      setReplyText('');
      await fetchMessages();
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  // Admin sends a message TO a specific user
  const sendAdminMessageToUser = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedUserId) {
      toast.error('Please select a user to send message to');
      return;
    }

    setSending(true);
    try {
      const selectedUser = users.find(u => u.id === selectedUserId);
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/send-to-user`,
        { 
          message: newMessage,
          userId: selectedUserId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Message sent to ${selectedUser?.name}!`);
      setNewMessage('');
      setSelectedUserId('');
      setShowUserSelector(false);
      await fetchMessages();
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      toast.error('Failed to send message');
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
      toast.success('Message marked as resolved');
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

  const getSelectedUserName = () => {
    const selectedUser = users.find(u => u.id === selectedUserId);
    return selectedUser ? selectedUser.name : 'Select user to message';
  };

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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {loading ? (
                <div className="text-center text-gray-500 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-2">Type your question below</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {/* User Message */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-blue-400 text-xs font-semibold">
                            {msg.userName}
                          </span>
                          {isAdmin && (
                            <span className="text-gray-500 text-xs break-all">{msg.userEmail}</span>
                          )}
                        </div>
                        {getStatusBadge(msg.status)}
                      </div>
                      <p className="text-white text-sm break-words">{msg.message}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Admin Reply - This is where admin's response goes */}
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
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Admin Input Area - Send message TO selected user */}
            {isAdmin ? (
              <div className="p-3 md:p-4 border-t border-gray-800 bg-[#1a1a1a]">
                {/* User Selector - Choose who to send message to */}
                <div className="mb-3">
                  <button
                    onClick={() => setShowUserSelector(!showUserSelector)}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white text-sm flex items-center justify-between hover:bg-gray-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {getSelectedUserName()}
                    </span>
                    <span className="text-gray-400">{showUserSelector ? '▲' : '▼'}</span>
                  </button>
                  
                  {showUserSelector && (
                    <div className="mt-2 bg-gray-800 rounded-lg max-h-40 overflow-y-auto">
                      {users.filter(u => u.role !== 'ADMIN').map((userItem) => (
                        <button
                          key={userItem.id}
                          onClick={() => {
                            setSelectedUserId(userItem.id);
                            setShowUserSelector(false);
                          }}
                          className="w-full text-left px-4 py-2 text-white text-sm hover:bg-gray-700 transition first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="font-medium">{userItem.name}</div>
                          <div className="text-gray-400 text-xs">{userItem.email}</div>
                        </button>
                      ))}
                      {users.filter(u => u.role !== 'ADMIN').length === 0 && (
                        <div className="px-4 py-2 text-gray-400 text-sm">No users found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendAdminMessageToUser()}
                    placeholder="Type a message to send to this user..."
                    className="flex-1 bg-black rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={sending || !selectedUserId}
                  />
                  <button
                    onClick={sendAdminMessageToUser}
                    disabled={sending || !selectedUserId}
                    className="bg-blue-600 rounded-lg px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-2 text-center">
                  Select a user, then type your message to send to them
                </p>
              </div>
            ) : (
              /* User Input Area */
              <div className="p-3 md:p-4 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message here..."
                    className="flex-1 bg-[#1a1a1a] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending}
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

            {/* Admin Stats */}
            {isAdmin && (
              <div className="p-2 md:p-3 border-t border-gray-800 bg-[#1a1a1a]">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total: {messages.length}</span>
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