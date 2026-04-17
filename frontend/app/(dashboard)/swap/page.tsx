'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SwapPage() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-white cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Swap</h1>
          <button className="ml-auto">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Swap Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          {/* From */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">You pay</span>
              <span className="text-gray-500 text-xs">Balance: 1.245 ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-2xl text-white font-semibold outline-none w-40"
              />
              <div className="flex items-center gap-2">
                <button className="bg-gray-700 px-3 py-1.5 rounded-lg text-white text-sm">
                  MAX
                </button>
                <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                  <span className="text-white font-medium">{fromToken}</span>
                  <button className="text-gray-400">▼</button>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              ≈ ${fromAmount ? (parseFloat(fromAmount) * 2250).toFixed(2) : '0.00'}
            </p>
          </div>
          
          {/* Swap Icon */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-800/30 hover:bg-gray-600 transition"
            >
              <ArrowUpDown className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* To */}
          <div className="bg-gray-900/50 rounded-xl p-4 mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">You receive</span>
            </div>
            <div className="flex justify-between items-center">
              <input
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-2xl text-white font-semibold outline-none w-40"
                readOnly
              />
              <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                <span className="text-white font-medium">{toToken}</span>
                <button className="text-gray-400">▼</button>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              ≈ ${toAmount ? (parseFloat(toAmount) * 1).toFixed(2) : '0.00'}
            </p>
          </div>
          
          {/* Swap Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl py-4 mt-5 text-white font-semibold"
          >
            Preview Swap
          </motion.button>
        </div>
        
        {/* Rate Info */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            1 ETH ≈ 2,250 USDT
          </p>
        </div>
      </div>
    </div>
  );
}