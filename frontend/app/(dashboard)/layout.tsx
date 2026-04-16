'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Send, ArrowDownToLine, History, User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Send, label: 'Send', href: '/send' },
  { icon: ArrowDownToLine, label: 'Receive', href: '/receive' },
  { icon: History, label: 'Transactions', href: '/transactions' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="fixed left-0 top-0 h-full w-64 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Zentry
            </h2>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          
          <nav className="mt-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-6 py-3 mx-3 rounded-xl transition cursor-pointer ${
                  pathname === item.href ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-red-400 hover:bg-gray-700 w-full mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="absolute bottom-6 left-6 p-2 rounded-lg bg-gray-700 text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </motion.div>
        
        {/* Main Content */}
        <main className="ml-64 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}