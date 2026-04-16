'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, RefreshCw, FileText, LogOut } from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: RefreshCw, label: 'Transactions', href: '/admin/transactions' },
  { icon: FileText, label: 'Audit Logs', href: '/admin/audit-logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'ADMIN') return null;
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Zentry Admin
            </h2>
          </div>
          
          <nav className="mt-8">
            {adminNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-gray-400 hover:bg-gray-700 transition cursor-pointer">
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
        </div>
        
        <main className="ml-64 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}