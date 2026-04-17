'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyPage() {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');
  
  const handleBuy = () => {
    toast.success(`Buying ${amount} ${selectedToken} - Demo feature`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-white cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Buy Crypto</h1>
        </div>
        
        {/* Buy Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <div className="mb-5">
            <label className="text-gray-400 text-sm mb-2 block">You pay</label>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-2xl text-white font-semibold outline-none w-40"
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">USD</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <label className="text-gray-400 text-sm mb-2 block">You get</label>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={amount ? (parseFloat(amount) / (selectedToken === 'USDT' ? 1 : selectedToken === 'BTC' ? 43250 : 2250)).toFixed(6) : '0'}
                  readOnly
                  className="bg-transparent text-2xl text-white font-semibold outline-none w-40"
                />
                <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                  <span className="text-white font-medium">{selectedToken}</span>
                  <button className="text-gray-400">▼</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <p className="text-yellow-500 text-xs">Demo mode - No real purchases</p>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleBuy}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl py-4 text-white font-semibold flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Buy {selectedToken}
          </motion.button>
        </div>
      </div>
    </div>
  );
}