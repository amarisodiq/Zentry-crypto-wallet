'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, fetchPrices, prices, fetchTransactions } = useStore();
  const [balance, setBalance] = useState<any>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  
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
  
  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Calculate total value and 24h change
  const currencies = [
    { symbol: 'BTC', name: 'Bitcoin', balance: balance?.BTC || 0, usdPrice: prices?.bitcoin?.usd || 43250, icon: '₿', change: '+5.48%', changeAmount: 6.32 },
    { symbol: 'ETH', name: 'Ethereum', balance: balance?.ETH || 0, usdPrice: prices?.ethereum?.usd || 2250, icon: 'Ξ', change: '+3.21%', changeAmount: 4.12 },
    { symbol: 'USDT', name: 'Tether', balance: balance?.USDT || 0, usdPrice: 1, icon: '₮', change: '+0.01%', changeAmount: 0.01 },
    { symbol: 'SOL', name: 'Solana', balance: balance?.SOL || 1.44, usdPrice: prices?.solana?.usd || 85.50, icon: '◎', change: '+12.34%', changeAmount: 15.67 },
    { symbol: 'XMR', name: 'Monero', balance: balance?.XMR || 0, usdPrice: 165.20, icon: 'ɱ', change: '-2.15%', changeAmount: -3.62 }
  ];
  
  const totalValue = currencies.reduce((sum, c) => sum + (c.balance * c.usdPrice), 0);
  const totalChange = 6.32;
  const totalChangePercent = 5.48;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Zentry</h1>
            <p className="text-gray-500 text-xs mt-0.5">@{user?.name?.toLowerCase() || 'user'}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="w-9 h-9 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center border border-gray-700"
            >
              {showBalance ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-gray-500 text-sm mb-1">Total Balance</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-5xl font-bold text-white tracking-tight">
              {showBalance ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
            </p>
            <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 text-sm font-medium">+${totalChange.toFixed(2)}</span>
              <span className="text-green-500 text-sm">(+{totalChangePercent}%)</span>
            </div>
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <Link href="/send">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl py-3 flex flex-col items-center gap-1.5 border border-gray-700/50 hover:bg-gray-700/50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-white text-xs font-medium">Send</span>
            </motion.button>
          </Link>
          
          <Link href="/swap">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl py-3 flex flex-col items-center gap-1.5 border border-gray-700/50 hover:bg-gray-700/50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-white text-xs font-medium">Swap</span>
            </motion.button>
          </Link>
          
          <Link href="/receive">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl py-3 flex flex-col items-center gap-1.5 border border-gray-700/50 hover:bg-gray-700/50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white text-xs font-medium">Receive</span>
            </motion.button>
          </Link>
          
          <Link href="/buy">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl py-3 flex flex-col items-center gap-1.5 border border-gray-700/50 hover:bg-gray-700/50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-white text-xs font-medium">Buy</span>
            </motion.button>
          </Link>
        </div>
        
        {/* Tokens Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold text-lg">Tokens</h2>
            <button className="text-gray-500 text-sm flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {currencies.map((crypto, idx) => (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${crypto.symbol === 'BTC' ? 'from-orange-500 to-amber-600' : crypto.symbol === 'ETH' ? 'from-blue-500 to-indigo-600' : crypto.symbol === 'SOL' ? 'from-purple-500 to-pink-600' : 'from-gray-600 to-gray-700'} flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{crypto.icon}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{crypto.name}</p>
                      <p className="text-gray-500 text-xs">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {crypto.balance.toFixed(4)} {crypto.symbol}
                    </p>
                    <p className="text-gray-500 text-xs">
                      ${(crypto.balance * crypto.usdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Pull to refresh hint */}
        <div className="text-center py-4">
          <p className="text-gray-600 text-xs">Pull down to refresh</p>
        </div>
      </div>
    </div>
  );
}