'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { Send, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Currency = 'BTC' | 'ETH' | 'USDT';

export default function SendPage() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('BTC');
  const [loading, setLoading] = useState(false);
  const { sendTransaction, user, fetchTransactions } = useStore();
  const router = useRouter();
  
  let balance: { BTC: number; ETH: number; USDT: number } = { BTC: 0, ETH: 0, USDT: 0 };
  try {
    const parsedBalance = user?.balance ? (typeof user.balance === 'string' ? JSON.parse(user.balance) : user.balance) : balance;
    balance = parsedBalance;
  } catch (e) {
    balance = { BTC: 0, ETH: 0, USDT: 0 };
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amountNum > balance[currency]) {
      toast.error(`Insufficient ${currency} balance`);
      return;
    }
    
    setLoading(true);
    
    try {
      await sendTransaction({ toAddress: address, amount: amountNum, currency });
      await fetchTransactions();
      toast.success('Transaction sent successfully!');
      router.push('/transactions');
    } catch (error: any) {
      // Error handled in store
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Send Crypto</h1>
          <p className="text-gray-500 text-sm mt-1">Transfer funds to any wallet address</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm block mb-2">Recipient Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition font-mono"
                required
              />
            </div>
            
            <div>
              <label className="text-gray-300 text-sm block mb-2">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Wallet className="w-3 h-3 text-gray-500" />
                <p className="text-gray-500 text-sm">
                  Available: {balance[currency]?.toFixed(4) || 0} {currency}
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Processing...' : 'Send Transaction'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}