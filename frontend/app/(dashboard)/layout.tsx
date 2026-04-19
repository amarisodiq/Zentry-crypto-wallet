'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black"
    >
      {children}
    </motion.div>
  );
}