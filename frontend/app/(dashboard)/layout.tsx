'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SupportChat from '@/components/SupportChat';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (isHydrated) {
      if (!user) {
        router.push('/login');
      }
      setIsChecking(false);
    }
  }, [user, router, isHydrated]);
  
  if (!isHydrated || isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black"
    >
      {children}
      <SupportChat />
    </motion.div>
  );
}