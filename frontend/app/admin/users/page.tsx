'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  UserCheck, 
  UserX, 
  Search, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  balance: any;
  walletAddress: string;
}

export default function AdminUsersPage() {
  const { user, token } = useStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [user, router]);
  
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };
  
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };
  
  const updateUserBalance = async (userId: string) => {
    try {
      const balanceObj = JSON.parse(editBalance);
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/balance`, { balance: balanceObj }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User balance updated');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Invalid balance format. Use JSON like {"BTC": 1, "ETH": 2, "USDT": 100}');
    }
  };
  
  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };
  
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">View, manage, and control all users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1a1a1a] rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
          />
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Active Users</p>
          <p className="text-2xl font-bold text-green-500">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-gray-500 text-xs">Admin Users</p>
          <p className="text-2xl font-bold text-blue-500">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
      </div>
      
      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUsers.map((u) => {
          let balanceObj = { BTC: 0, ETH: 0, USDT: 0 };
          try {
            balanceObj = typeof u.balance === 'string' ? JSON.parse(u.balance) : u.balance;
          } catch (e) {
            balanceObj = { BTC: 0, ETH: 0, USDT: 0 };
          }
          
          return (
            <div key={u.id} className="bg-[#1a1a1a] rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{u.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{u.name}</p>
                      {u.role === 'ADMIN' && (
                        <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{u.email}</p>
                    <p className="text-gray-600 text-xs mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {u.isActive ? 'Active' : 'Suspended'}
                </div>
              </div>
              
              {/* Balance Display */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <p className="text-gray-500 text-xs mb-2">Wallet Balance</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-gray-400 text-xs">BTC</p>
                    <p className="text-white font-medium">{balanceObj.BTC?.toFixed(4) || '0.0000'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">ETH</p>
                    <p className="text-white font-medium">{balanceObj.ETH?.toFixed(4) || '0.0000'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">USDT</p>
                    <p className="text-white font-medium">{balanceObj.USDT?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs mt-2 font-mono break-all">{u.walletAddress}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleUserStatus(u.id, u.isActive)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                    u.isActive 
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                      : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  }`}
                >
                  {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  {u.isActive ? 'Suspend' : 'Activate'}
                </button>
                
                <select
                  onChange={(e) => updateUserRole(u.id, e.target.value)}
                  defaultValue={u.role}
                  className="bg-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                
                <button
                  onClick={() => {
                    setSelectedUser(u);
                    setEditBalance(JSON.stringify(balanceObj, null, 2));
                  }}
                  className="p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition"
                  title="Edit Balance"
                >
                  <DollarSign className="w-4 h-4 text-blue-500" />
                </button>
                
                {u.role !== 'ADMIN' && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition"
                    title="Delete User"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Edit Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Edit Balance - {selectedUser.name}</h3>
            <textarea
              value={editBalance}
              onChange={(e) => setEditBalance(e.target.value)}
              className="w-full bg-black rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
              rows={6}
              placeholder='{"BTC": 1.5, "ETH": 10, "USDT": 5000}'
            />
            <div className="flex gap-3">
              <button
                onClick={() => updateUserBalance(selectedUser.id)}
                className="flex-1 bg-blue-600 py-2 rounded-lg text-white font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-gray-800 py-2 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3">Format: {"BTC"} : number, {"ETH"} : number, {"USDT"} : number</p>
          </div>
        </div>
      )}
    </div>
  );
}