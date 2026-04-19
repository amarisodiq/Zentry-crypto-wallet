'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Search, 
  UserCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  details: string;
  createdAt: string;
  admin: { name: string; email: string };
}

export default function AdminAuditLogsPage() {
  const { user, token } = useStore();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchLogs();
  }, [user, router]);
  
  const fetchLogs = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };
  
  const getActionIcon = (action: string) => {
    switch(action) {
      case 'CONFIRM_TRANSACTION': 
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECT_TRANSACTION': 
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'TOGGLE_USER_STATUS': 
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: 
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };
  
  const getActionColor = (action: string) => {
    switch(action) {
      case 'CONFIRM_TRANSACTION': return 'text-green-500';
      case 'REJECT_TRANSACTION': return 'text-red-500';
      case 'TOGGLE_USER_STATUS': return 'text-blue-500';
      default: return 'text-yellow-500';
    }
  };
  
  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.admin.email.toLowerCase().includes(search.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Track all admin actions</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a1a1a] rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Action</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Admin</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Target ID</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Details</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white text-sm">{log.admin.name}</p>
                        <p className="text-gray-600 text-xs">{log.admin.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-gray-400 text-xs">{log.targetId.slice(0, 8)}...</code>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-gray-400 text-xs max-w-md break-all">
                        {log.details.length > 100 ? log.details.slice(0, 100) + '...' : log.details}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-white text-sm">{new Date(log.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-600 text-xs">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}