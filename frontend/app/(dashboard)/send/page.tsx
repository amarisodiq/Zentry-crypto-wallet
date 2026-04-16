'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SendPage() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const { sendTransaction, user } = useStore();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await sendTransaction({ toAddress: address, amount: parseFloat(amount), currency });
      router.push('/transactions');
    } catch (error: any) {
      // Error handled in store
    } finally {
      setLoading(false);
    }
  };
  
  const balance = user?.balance?.[currency] || 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Send Crypto</h1>
          <p className="text-gray-400 mb-8">Transfer funds to any wallet address</p>
          
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
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute right-3 top-3 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                >
                  <option>BTC</option>
                  <option>ETH</option>
                  <option>USDT</option>
                </select>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Available balance: {balance} {currency}
              </p>
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
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-400 text-sm">
              ⚠️ Note: Transactions require admin approval and will be pending until confirmed.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}