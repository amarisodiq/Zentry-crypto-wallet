'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Send,
  RefreshCw,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SupportMessage {
  id: string;
  userName: string;
  userEmail: string;
  message: string;
  reply: string | null;
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  createdAt: string;
}

export default function AdminSupportPage() {
  const { user, token } = useStore();
  const router = useRouter();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchMessages();
  }, [user, router]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
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
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const resolveMessage = async (messageId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/messages/${messageId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message resolved');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to resolve message');
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'REPLIED': return <Send className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter !== 'all' && msg.status !== filter.toUpperCase()) return false;
    if (search) {
      return msg.userEmail.toLowerCase().includes(search.toLowerCase()) ||
             msg.message.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status === 'PENDING').length,
    replied: messages.filter(m => m.status === 'REPLIED').length,
    resolved: messages.filter(m => m.status === 'RESOLVED').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer support requests</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by email or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a1a1a] rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={fetchMessages}
            className="p-2 bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Total Messages</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Replied</p>
          <p className="text-2xl font-bold text-blue-500">{stats.replied}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Resolved</p>
          <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'replied', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-xl p-12 text-center">
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className="bg-[#1a1a1a] rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{msg.userName}</span>
                    <span className="text-gray-500 text-sm">{msg.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(msg.status)}
                    <span className={`text-xs capitalize ${
                      msg.status === 'PENDING' ? 'text-yellow-500' :
                      msg.status === 'REPLIED' ? 'text-blue-500' : 'text-green-500'
                    }`}>
                      {msg.status.toLowerCase()}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {msg.status !== 'RESOLVED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReplyingTo(msg.id)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-sm hover:bg-blue-500/30 transition"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => resolveMessage(msg.id)}
                      className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm hover:bg-green-500/30 transition"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-black/30 rounded-lg p-3 mb-3">
                <p className="text-white">{msg.message}</p>
              </div>

              {msg.reply && (
                <div className="bg-blue-500/10 rounded-lg p-3 border-l-4 border-l-blue-500">
                  <p className="text-blue-400 text-xs mb-1">Support Reply:</p>
                  <p className="text-white text-sm">{msg.reply}</p>
                </div>
              )}

              {replyingTo === msg.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-black rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && sendReply(msg.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => sendReply(msg.id)}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700 transition"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 bg-gray-700 rounded-lg text-white text-sm hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}