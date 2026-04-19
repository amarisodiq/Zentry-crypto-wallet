'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  RefreshCw, 
  FileText, 
  LogOut,
  Shield
} from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: RefreshCw, label: 'Transactions', href: '/admin/transactions' },
  { icon: FileText, label: 'Audit Logs', href: '/admin/audit-logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'ADMIN') return null;
  
  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{user.email}</span>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition"
              >
                <LogOut className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Navigation */}
      <div className="fixed top-14 left-0 right-0 bg-[#1a1a1a] border-b border-gray-800 z-40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                      isActive 
                        ? 'text-blue-500 border-b-2 border-blue-500' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
}