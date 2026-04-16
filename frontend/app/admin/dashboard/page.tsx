'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Users, RefreshCw, Clock, DollarSign } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, pendingTransactions: 0 });
  const { token } = useStore();
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(data);
  };
  
  const statsCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-cyan-500' },
    { icon: RefreshCw, label: 'Total Transactions', value: stats.totalTransactions, color: 'from-purple-500 to-pink-500' },
    { icon: Clock, label: 'Pending', value: stats.pendingTransactions, color: 'from-yellow-500 to-orange-500' },
    { icon: DollarSign, label: 'Volume (24h)', value: '$124,532', color: 'from-green-500 to-emerald-500' },
  ];
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${card.color} rounded-xl p-6 text-white`}
          >
            <card.icon className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <p className="text-gray-400">Admin panel ready to manage users and transactions</p>
      </div>
    </div>
  );
}