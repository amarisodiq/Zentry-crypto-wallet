'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit2, 
  Save, 
  X,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  fromUserId: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  type: string;
  txHash: string;
  createdAt: string;
  fromUser?: { name: string; email: string };
}

export default function AdminTransactionsPage() {
  const { user, token } = useStore();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingTx, setEditingTx] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchTransactions();
  }, [user, router]);
  
  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };
  
  const confirmTransaction = async (id: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Transaction confirmed');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to confirm transaction');
    }
  };
  
  const rejectTransaction = async (id: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Transaction rejected');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to reject transaction');
    }
  };
  
  const editTransaction = async (id: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/${id}/edit`, {
        amount: parseFloat(editAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Transaction updated');
      setEditingTx(null);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };
  
  const deleteTransaction = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Transaction deleted');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.status !== filter.toUpperCase()) return false;
    if (search) {
      return tx.txHash.toLowerCase().includes(search.toLowerCase()) ||
             tx.toAddress.toLowerCase().includes(search.toLowerCase()) ||
             tx.fromAddress.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'CONFIRMED':
        return <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Confirmed</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-xs"><Clock className="w-3 h-3" /> Pending</span>;
      case 'FAILED':
        return <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs"><XCircle className="w-3 h-3" /> Failed</span>;
      default:
        return null;
    }
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
          <h1 className="text-2xl font-bold text-white">Transaction Management</h1>
          <p className="text-gray-500 text-sm mt-1">View, confirm, reject, or edit all transactions</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by hash or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a1a1a] rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Total Transactions</p>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{transactions.filter(t => t.status === 'PENDING').length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Confirmed</p>
          <p className="text-2xl font-bold text-green-500">{transactions.filter(t => t.status === 'CONFIRMED').length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Failed</p>
          <p className="text-2xl font-bold text-red-500">{transactions.filter(t => t.status === 'FAILED').length}</p>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Type</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">From/To</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Amount</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Status</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Date</th>
                <th className="text-left py-4 px-4 text-gray-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'SEND' ? (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-white text-sm">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white text-sm font-mono">
                        {tx.fromAddress.slice(0, 8)}... → {tx.toAddress.slice(0, 8)}...
                      </p>
                      <p className="text-gray-600 text-xs mt-1">Hash: {tx.txHash.slice(0, 16)}...</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {editingTx === tx.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="bg-gray-900 rounded-lg px-2 py-1 text-white text-sm w-24"
                          step="any"
                        />
                        <button onClick={() => editTransaction(tx.id)} className="p-1 text-green-500">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingTx(null)} className="p-1 text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-medium">{tx.amount} {tx.currency}</p>
                        <p className="text-gray-600 text-xs">
                          ≈ ${(tx.amount * (tx.currency === 'BTC' ? 43250 : tx.currency === 'ETH' ? 2250 : 1)).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-600 text-xs">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {tx.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => confirmTransaction(tx.id)}
                            className="p-1.5 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={() => rejectTransaction(tx.id)}
                            className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setEditingTx(tx.id);
                          setEditAmount(tx.amount.toString());
                        }}
                        className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}