'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Send, 
  ArrowDownToLine, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  TrendingUp,
  Wallet,
  Settings
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 px-4 py-3">
        <div className="flex justify-between items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Zentry
          </h2>
          <div className="w-10"></div>
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-50 md:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? { x: -280 } : { x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed left-0 top-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 z-50 flex flex-col ${!isMobile ? 'md:relative md:translate-x-0' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Zentry
              </h2>
              <p className="text-gray-500 text-sm mt-1">@{user.email?.split('@')[0]}</p>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* User Info Card */}
        <div className="mx-4 mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.role}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => isMobile && setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800 mt-auto">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white w-full mb-2 transition"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${!isMobile ? 'md:ml-72' : ''}`}>
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}