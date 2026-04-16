'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } else {
      router.push('/login');
    }
  }, [user, router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );
}