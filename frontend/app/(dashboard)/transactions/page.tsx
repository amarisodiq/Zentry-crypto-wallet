'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusColors = {
  PENDING: 'text-yellow-500 bg-yellow-500/10',
  CONFIRMED: 'text-green-500 bg-green-500/10',
  FAILED: 'text-red-500 bg-red-500/10'
};

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  FAILED: XCircle
};

export default function TransactionsPage() {
  const { transactions, fetchTransactions } = useStore();
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter.toUpperCase();
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400 mt-1">View all your transactions</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['all', 'pending', 'confirmed', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl">
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx, idx) => {
              const StatusIcon = statusIcons[tx.status];
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'SEND' ? 'bg-red-500/10' : 'bg-green-500/10'
                      }`}>
                        {tx.type === 'SEND' ? (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {tx.type === 'SEND' ? 'Sent' : 'Received'} {tx.amount} {tx.currency}
                        </p>
                        <p className="text-gray-400 text-sm">
                          To: {tx.toAddress.slice(0, 10)}...{tx.toAddress.slice(-8)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg flex items-center gap-2 ${statusColors[tx.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="text-xs font-medium">{tx.status}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}