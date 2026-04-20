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
  Home,
  Activity,
  User
} from 'lucide-react';
import Link from 'next/link';

interface Balance {
  BTC: number;
  ETH: number;
  USDT: number;
  CAD?: number;
  SOL?: number;
}

export default function Dashboard() {
  const { user, fetchPrices, prices, transactions, fetchTransactions } = useStore();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  
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
  
  // Calculate total value - prioritize CAD if available
  let totalValue = 0;
  if (balance?.CAD) {
    totalValue = balance.CAD;
  } else {
    totalValue = (balance?.BTC || 0) * (prices?.bitcoin?.usd || 43250) +
                 (balance?.ETH || 0) * (prices?.ethereum?.usd || 2250) +
                 (balance?.USDT || 0) * 1 +
                 (balance?.SOL || 0) * (prices?.solana?.usd || 84.50);
  }
  
  const totalChange = 6.32;
  const totalChangePercent = 5.48;
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Zentry</h1>
            <p className="text-gray-500 text-xs mt-0.5">@{user?.email?.split('@')[0] || 'user'}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#222] transition"
            >
              {showBalance ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
            <Link href="/profile">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:opacity-80 transition">
                <span className="text-white font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Balance Card */}
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
            <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 text-sm font-medium">+${totalChange.toFixed(2)}</span>
              <span className="text-green-500 text-sm">(+{totalChangePercent}%)</span>
            </div>
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <Link href="/send">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition active:scale-95">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-white text-xs">Send</span>
            </button>
          </Link>
          
          <Link href="/swap">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition active:scale-95">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-white text-xs">Swap</span>
            </button>
          </Link>
          
          <Link href="/receive">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition active:scale-95">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white text-xs">Receive</span>
            </button>
          </Link>
          
          <Link href="/buy">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition active:scale-95">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-white text-xs">Buy</span>
            </button>
          </Link>
        </div>
        
        {/* Tokens Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold text-lg">Your Assets</h2>
            <button className="text-gray-500 text-xs flex items-center gap-1">
              View all <span className="text-lg">›</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Show CAD Balance if available */}
            {balance?.CAD && (
              <div className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#222] transition cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Canadian Dollar</p>
                      <p className="text-gray-500 text-xs">CAD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${balance.CAD.toLocaleString()} CAD</p>
                    <p className="text-gray-500 text-xs">≈ ${(balance.CAD * 0.73).toLocaleString()} USD</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bitcoin */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#222] transition cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <span className="text-white font-bold">₿</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Bitcoin</p>
                    <p className="text-gray-500 text-xs">BTC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{balance?.BTC?.toFixed(4) || '0.0000'} BTC</p>
                  <p className="text-gray-500 text-xs">${((balance?.BTC || 0) * (prices?.bitcoin?.usd || 43250)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pull to refresh hint */}
        <div className="text-center py-4">
          <p className="text-gray-600 text-xs">↓ Pull down to refresh</p>
        </div>
      </div>
      
      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/dashboard">
            <button className="flex flex-col items-center gap-1 transition active:scale-95">
              <Home className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-blue-500">Wallet</span>
            </button>
          </Link>
          <Link href="/transactions">
            <button className="flex flex-col items-center gap-1 transition active:scale-95">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-500">Activity</span>
            </button>
          </Link>
          <Link href="/profile">
            <button className="flex flex-col items-center gap-1 transition active:scale-95">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-500">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}