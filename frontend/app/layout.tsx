'use client';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrate } = useStore();
  
  useEffect(() => {
    // Manually check localStorage on mount
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('zentry-storage');
    
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.user) {
          // Store will auto-hydrate from persist middleware
          hydrate?.();
        }
      } catch (e) {
        console.error('Failed to hydrate store:', e);
      }
    }
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}