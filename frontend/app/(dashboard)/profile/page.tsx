'use client';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Mail, Wallet, Copy, Check, LogOut } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{user?.role}</p>
        </div>
        
        {/* Info Cards */}
        <div className="space-y-3 mb-6">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Wallet Address</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-white text-sm font-mono break-all">
                    {user?.walletAddress}
                  </code>
                  <button onClick={copyAddress} className="p-1 hover:opacity-70 transition">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 border border-red-500/20 rounded-xl py-4 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-between">
          <Link href="/dashboard">
            <button className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-500">Wallet</span>
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
              <div className="w-5 h-5 rounded-full bg-blue-500" />
              <span className="text-xs text-blue-500">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}