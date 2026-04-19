'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Users, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, token } = useStore();
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, pendingTransactions: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);
  
  const fetchData = async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setRecentTransactions(txRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmTransaction = async (id: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Failed to confirm transaction:', error);
    }
  };
  
  const rejectTransaction = async (id: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform and users</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <Users className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            <p className="text-gray-500 text-xs">Total Users</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <RefreshCw className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
            <p className="text-gray-500 text-xs">Transactions</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <Clock className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pendingTransactions}</p>
            <p className="text-gray-500 text-xs">Pending</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <DollarSign className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-white">$124K</p>
            <p className="text-gray-500 text-xs">Volume (24h)</p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/admin/users">
            <button className="w-full bg-blue-600 rounded-xl py-3 text-white font-medium text-sm">
              Manage Users
            </button>
          </Link>
          <Link href="/admin/audit-logs">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 text-white font-medium text-sm">
              Audit Logs
            </button>
          </Link>
        </div>
        
        {/* Pending Transactions */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">Pending Approvals</h2>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No pending transactions</p>
              </div>
            ) : (
              recentTransactions.map((tx: any) => (
                <div key={tx.id} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium">{tx.amount} {tx.currency}</p>
                      <p className="text-gray-500 text-xs">To: {tx.toAddress.slice(0, 10)}...</p>
                      <p className="text-gray-600 text-xs mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmTransaction(tx.id)}
                        className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => rejectTransaction(tx.id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-between">
          <Link href="/admin/dashboard">
            <button className="flex flex-col items-center gap-1">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-blue-500">Overview</span>
            </button>
          </Link>
          <Link href="/admin/users">
            <button className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-500">Users</span>
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-500">Exit</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}