'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, fetchPrices, prices, fetchTransactions } = useStore();
  const [balance, setBalance] = useState<any>(null);
  
  useEffect(() => {
    fetchPrices();
    fetchTransactions();
  }, []);
  
  useEffect(() => {
    if (user?.balance) {
      try {
        const parsedBalance = typeof user.balance === 'string' 
          ? JSON.parse(user.balance) 
          : user.balance;
        setBalance(parsedBalance);
      } catch (e) {
        setBalance({ BTC: 0, ETH: 0, USDT: 0 });
      }
    }
  }, [user?.balance]);
  
  const currencies = [
    { symbol: 'BTC', name: 'Bitcoin', balance: balance?.BTC || 0, usdPrice: prices?.bitcoin?.usd || 43250, change: '+5.2%' },
    { symbol: 'ETH', name: 'Ethereum', balance: balance?.ETH || 0, usdPrice: prices?.ethereum?.usd || 2250, change: '+3.1%' },
    { symbol: 'USDT', name: 'Tether', balance: balance?.USDT || 0, usdPrice: 1, change: '+0.01%' }
  ];
  
  const totalValue = currencies.reduce((sum, c) => sum + (c.balance * c.usdPrice), 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-400 mt-1">Track and manage your crypto portfolio</p>
        </div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-xl"
        >
          <p className="text-blue-100 text-sm">Total Portfolio Value</p>
          <p className="text-5xl font-bold text-white mt-2">${totalValue.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-green-300 text-sm">+12.5% (30 days)</span>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/send">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 text-white hover:bg-gray-750 transition"
            >
              <ArrowUpRight className="w-5 h-5 text-green-500" />
              Send Crypto
            </motion.button>
          </Link>
          <Link href="/receive">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 text-white hover:bg-gray-750 transition"
            >
              <ArrowDownLeft className="w-5 h-5 text-blue-500" />
              Receive Crypto
            </motion.button>
          </Link>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-white font-semibold mb-3 text-lg">Your Assets</h2>
          {currencies.map((crypto, idx) => (
            <motion.div
              key={crypto.symbol}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold text-lg">{crypto.symbol}</p>
                  <p className="text-gray-400 text-sm">{crypto.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-lg">{crypto.balance.toFixed(4)} {crypto.symbol}</p>
                  <p className="text-gray-400 text-sm">${(crypto.balance * crypto.usdPrice).toLocaleString()}</p>
                  <p className="text-green-500 text-xs">{crypto.change}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}