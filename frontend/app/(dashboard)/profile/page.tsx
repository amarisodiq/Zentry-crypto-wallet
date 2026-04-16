'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { User, Mail, Wallet, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  
  const handleUpdateProfile = async () => {
    // In a real app, this would call an API
    toast.success('Profile updated (demo)');
    setIsEditing(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            {isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-white text-xl font-semibold text-center"
                />
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-1 bg-blue-600 rounded-lg text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1 bg-gray-700 rounded-lg text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <button onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            )}
            <p className="text-gray-400 mt-1">{user?.role}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl">
              <Wallet className="w-5 h-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Wallet Address</p>
                <code className="text-white text-sm break-all">{user?.walletAddress}</code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}