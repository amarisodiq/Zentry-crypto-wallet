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
  Clock,
  Send,
  Wallet,
  Circle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Balance {
  BTC: number;
  ETH: number;
  USDT: number;
  SOL?: number;
}

export default function Dashboard() {
  const { user, fetchPrices, prices, transactions, fetchTransactions } = useStore();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const router = useRouter();
  
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
  
  const totalValue = (balance?.BTC || 0) * (prices?.bitcoin?.usd || 43250) +
                     (balance?.ETH || 0) * (prices?.ethereum?.usd || 2250) +
                     (balance?.USDT || 0) * 1 +
                     (balance?.SOL || 1.44) * (prices?.solana?.usd || 84.50);
  
  const totalChange = 6.32;
  const totalChangePercent = 5.48;
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const recentTransactions = transactions.slice(0, 5);
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Zentry</h1>
            <p className="text-gray-500 text-xs mt-0.5">@{user?.email?.split('@')[0] || 'user'}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center"
            >
              {showBalance ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
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
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-white text-xs">Send</span>
            </button>
          </Link>
          
          <Link href="/swap">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-white text-xs">Swap</span>
            </button>
          </Link>
          
          <Link href="/receive">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white text-xs">Receive</span>
            </button>
          </Link>
          
          <Link href="/buy">
            <button className="w-full bg-[#1a1a1a] rounded-xl py-3 flex flex-col items-center gap-1.5 hover:bg-[#222] transition">
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
            <h2 className="text-white font-semibold text-lg">Tokens</h2>
            <button className="text-gray-500 text-xs flex items-center gap-1">
              View all <span className="text-lg">›</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Solana */}
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-bold">◎</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Solana</p>
                    <p className="text-gray-500 text-xs">SOL</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{balance?.SOL?.toFixed(4) || '1.4400'} SOL</p>
                  <p className="text-gray-500 text-xs">${((balance?.SOL || 1.44) * (prices?.solana?.usd || 84.50)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 text-xs">+5.5%</span>
                </div>
                <div className="flex gap-3">
                  <button className="text-blue-500 text-xs">Buy</button>
                  <button className="text-gray-500 text-xs">Sell</button>
                </div>
              </div>
            </div>
            
            {/* Ethereum */}
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">Ξ</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Ethereum</p>
                    <p className="text-gray-500 text-xs">ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{balance?.ETH?.toFixed(4) || '0.0000'} ETH</p>
                  <p className="text-gray-500 text-xs">${((balance?.ETH || 0) * (prices?.ethereum?.usd || 2250)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
            
            {/* Bitcoin */}
            <div className="bg-[#1a1a1a] rounded-xl p-4">
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
            
            {/* Tether */}
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold">₮</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Tether</p>
                    <p className="text-gray-500 text-xs">USDT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{balance?.USDT?.toFixed(4) || '0.0000'} USDT</p>
                  <p className="text-gray-500 text-xs">${(balance?.USDT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transaction History */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold text-lg">Transaction History</h2>
            <Link href="/transactions">
              <button className="text-gray-500 text-xs flex items-center gap-1">
                View all <span className="text-lg">›</span>
              </button>
            </Link>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
                <Send className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No transactions yet</p>
                <p className="text-gray-600 text-xs mt-1">Send or receive crypto to see history</p>
              </div>
            ) : (
              recentTransactions.map((tx, idx) => (
                <div key={tx.id} className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        {getStatusIcon(tx.status)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {tx.type === 'SEND' ? 'Sent' : 'Received'} {tx.amount} {tx.currency}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${tx.type === 'SEND' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'SEND' ? '-' : '+'}{tx.amount} {tx.currency}
                      </p>
                      <p className="text-gray-500 text-xs capitalize">{tx.status.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-3 px-6">
          <div className="max-w-md mx-auto flex justify-between">
            <Link href="/dashboard">
              <button className="flex flex-col items-center gap-1">
                <Wallet className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-blue-500">Wallet</span>
              </button>
            </Link>
            <Link href="/transactions">
              <button className="flex flex-col items-center gap-1">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-xs text-gray-500">Activity</span>
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
        
        {/* Padding for bottom nav */}
        <div className="h-20" />
      </div>
    </div>
  );
}