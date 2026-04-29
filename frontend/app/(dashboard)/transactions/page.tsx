'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const { transactions, fetchTransactions, user } = useStore();
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Function to get custom description for specific transactions
  const getTransactionDescription = (tx: any) => {
    // Electronic Deposit for Castillo's $150 USD transaction
    if (tx.amount === 150 && tx.currency === 'USD' && tx.type === 'RECEIVE') {
      return 'Electronic Deposit';
    }
    return null;
  };
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter.toUpperCase();
  });
  
  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">Transactions</h1>
          <button className="ml-auto">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'confirmed', 'pending', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl p-12 text-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1a1a1a] rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                      {tx.type === 'SEND' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {tx.type === 'SEND' ? 'Sent' : 'Received'} {tx.amount} {tx.currency}
                      </p>
                      {/* Show description if available */}
                      {getTransactionDescription(tx) && (
                        <p className="text-green-400 text-xs mt-1">
                          {getTransactionDescription(tx)}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-xs font-mono mt-1">
                        {tx.toAddress.slice(0, 8)}...{tx.toAddress.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(tx.status)}
                      <span className="text-xs text-gray-400 capitalize">{tx.status.toLowerCase()}</span>
                    </div>
                    <p className={`text-sm font-medium mt-1 ${tx.type === 'SEND' ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.type === 'SEND' ? '-' : '+'}{tx.amount} {tx.currency}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-between">
          <Link href="/dashboard">
            <button className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-500">Wallet</span>
            </button>
          </Link>
          <Link href="/transactions">
            <button className="flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-blue-500">Activity</span>
            </button>
          </Link>
          <Link href="/profile">
            <button className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-500">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}