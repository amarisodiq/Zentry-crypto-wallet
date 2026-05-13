'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, CheckCircle, Clock, Reply } from 'lucide-react';
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

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { user, token } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      // Sort messages: oldest first (ascending order) - so newest at bottom
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
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/message`,
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

  // Admin sends a reply to a specific user message
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

  // Admin sends an independent message (new conversation)
  const sendAdminMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/send`,
        { 
          message: newMessage,
          userId: 'all'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message sent to users!');
      setNewMessage('');
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

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:scale-105 transition"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-32 right-4 z-50 w-[450px] h-[600px] bg-black border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold">Support</h3>
                <p className="text-blue-100 text-xs">We reply immediately</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Welcome Message */}
            <div className="bg-[#1a1a1a] p-4 border-b border-gray-800">
              <p className="text-gray-300 text-sm">
                Welcome to our store! 😊 Whether you have a specific question or need assistance, 
                we're here for you. 😉 What would you like to know?
              </p>
            </div>

            {/* Messages Area - Oldest at top, newest at bottom */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>No messages yet</p>
                  <p className="text-xs mt-2">Type your question below</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {/* User Message */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-xs font-semibold">
                            {isAdmin ? msg.userName : 'You'}
                          </span>
                          {isAdmin && (
                            <span className="text-gray-500 text-xs">{msg.userEmail}</span>
                          )}
                        </div>
                        {getStatusBadge(msg.status)}
                      </div>
                      <p className="text-white text-sm">{msg.message}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Admin Reply (if any) */}
                    {msg.reply && (
                      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3 ml-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-green-400 text-xs font-semibold">Support</span>
                        </div>
                        <p className="text-white text-sm">{msg.reply}</p>
                      </div>
                    )}

                    {/* Reply Input for Admin */}
                    {isAdmin && replyingTo === msg.id && (
                      <div className="flex gap-2 mt-2 ml-4">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && sendReply(msg.id)}
                          autoFocus
                        />
                        <button
                          onClick={() => sendReply(msg.id)}
                          className="px-3 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700 transition"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Admin Action Buttons */}
                    {isAdmin && msg.status !== 'RESOLVED' && !replyingTo && (
                      <div className="flex gap-2 mt-2 ml-4">
                        <button
                          onClick={() => setReplyingTo(msg.id)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs hover:bg-blue-500/30 transition flex items-center gap-1"
                        >
                          <Reply className="w-3 h-3" />
                          Reply
                        </button>
                        <button
                          onClick={() => resolveMessage(msg.id)}
                          className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs hover:bg-green-500/30 transition"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Admin Input Area - Can send messages freely */}
            {isAdmin ? (
              <div className="p-4 border-t border-gray-800 bg-[#1a1a1a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                    placeholder="Type a message to send to users..."
                    className="flex-1 bg-black rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={sendAdminMessage}
                    disabled={sending}
                    className="bg-blue-600 rounded-lg px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-2 text-center">
                  Messages will be sent to all users
                </p>
              </div>
            ) : (
              /* User Input Area */
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
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
              <div className="p-3 border-t border-gray-800 bg-[#1a1a1a]">
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