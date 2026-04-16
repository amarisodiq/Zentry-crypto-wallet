'use client';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Dynamically import QRCode to avoid SSR issues
const QRCode = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

export default function ReceivePage() {
  const { user } = useStore();
  const [copied, setCopied] = useState(false);
  
  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Receive Crypto</h1>
          <p className="text-gray-400 mb-8">Share this address to receive funds</p>
          
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white rounded-2xl">
              {user?.walletAddress && (
                <QRCode
                  value={user.walletAddress}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-2">Your Wallet Address</p>
            <div className="flex items-center justify-between gap-4">
              <code className="text-white text-sm font-mono break-all">
                {user?.walletAddress}
              </code>
              <button
                onClick={copyAddress}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 text-sm">
              💡 Supported currencies: BTC, ETH, USDT (BEP-20/ERC-20)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}