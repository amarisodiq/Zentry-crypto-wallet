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
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronRight,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Balance {
  BTC: number;
  ETH: number;
  USDT: number;
  SOL?: number;
  XMR?: number;
}

interface CurrencyInfo {
  symbol: string;
  name: string;
  balance: number;
  usdPrice: number;
  icon: string;
  color: string;
}

export default function Dashboard() {
  const { user, fetchPrices, prices, fetchTransactions } = useStore();
  const [balance, setBalance] = useState<Balance | null>(null);
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
  
  const currencies: CurrencyInfo[] = [
    { symbol: 'BTC', name: 'Bitcoin', balance: balance?.BTC || 0, usdPrice: prices?.bitcoin?.usd || 43250, icon: '₿', color: 'from-orange-500 to-amber-600' },
    { symbol: 'ETH', name: 'Ethereum', balance: balance?.ETH || 0, usdPrice: prices?.ethereum?.usd || 2250, icon: 'Ξ', color: 'from-blue-500 to-indigo-600' },
    { symbol: 'USDT', name: 'Tether', balance: balance?.USDT || 0, usdPrice: 1, icon: '₮', color: 'from-green-500 to-emerald-600' },
    { symbol: 'SOL', name: 'Solana', balance: balance?.SOL || 1.44, usdPrice: prices?.solana?.usd || 85.50, icon: '◎', color: 'from-purple-500 to-pink-600' },
    { symbol: 'XMR', name: 'Monero', balance: balance?.XMR || 0, usdPrice: 165.20, icon: 'ɱ', color: 'from-gray-600 to-gray-700' }
  ];
  
  const totalValue = currencies.reduce((sum, c) => sum + (c.balance * c.usdPrice), 0);
  const totalChange = 6.32;
  const totalChangePercent = 5.48;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your crypto portfolio</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <div className="flex items-baseline gap-2 flex-wrap mt-1">
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    {showBalance ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                  </p>
                  <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 text-sm font-medium">+${totalChange.toFixed(2)}</span>
                    <span className="text-green-500 text-sm">(+{totalChangePercent}%)</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition"
              >
                {showBalance ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 text-xs">Wallet Address</p>
                <code className="text-gray-400 text-xs font-mono">
                  {user?.walletAddress?.slice(0, 8)}...{user?.walletAddress?.slice(-6)}
                </code>
                <button onClick={copyAddress} className="hover:opacity-70 transition">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-500" />}
                </button>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-gray-500 text-xs">24h Change</p>
                  <p className="text-sm font-semibold text-green-500">+{totalChangePercent}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">7d Change</p>
                  <p className="text-sm font-semibold text-green-500">+12.8%</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
          >
            <p className="text-gray-400 text-sm mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/send">
                <button className="w-full bg-red-500/10 hover:bg-red-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition border border-red-500/20">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-white text-sm">Send</span>
                </button>
              </Link>
              <Link href="/receive">
                <button className="w-full bg-green-500/10 hover:bg-green-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition border border-green-500/20">
                  <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  <span className="text-white text-sm">Receive</span>
                </button>
              </Link>
              <Link href="/swap">
                <button className="w-full bg-blue-500/10 hover:bg-blue-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition border border-blue-500/20">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  <span className="text-white text-sm">Swap</span>
                </button>
              </Link>
              <Link href="/buy">
                <button className="w-full bg-purple-500/10 hover:bg-purple-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition border border-purple-500/20">
                  <ShoppingBag className="w-4 h-4 text-purple-500" />
                  <span className="text-white text-sm">Buy</span>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Tokens Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold text-lg md:text-xl">Your Assets</h2>
            <button className="text-gray-500 text-sm flex items-center gap-1 hover:text-gray-400 transition">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((crypto, idx) => (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-700/30 hover:border-gray-600/50 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${crypto.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-xl">{crypto.icon}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{crypto.name}</p>
                      <p className="text-gray-500 text-xs">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +5.48%
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Balance</p>
                    <p className="text-white font-semibold">
                      {crypto.balance.toFixed(4)} {crypto.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">Value</p>
                    <p className="text-white font-semibold">
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
          <p className="text-gray-600 text-xs">↓ Pull down to refresh</p>
        </div>
      </div>
    </div>
  );
}