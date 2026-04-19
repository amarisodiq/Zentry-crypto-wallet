import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  type: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  walletAddress: string;
  balance: any;
  isActive: boolean;
}

interface Store {
  user: User | null;
  token: string | null;
  transactions: Transaction[];
  prices: any;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  sendTransaction: (data: any) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchPrices: () => Promise<void>;
  setHydrated: (state: boolean) => void;
  hydrate: () => void;
}

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      transactions: [],
      prices: {},
      isHydrated: false,
      
      setHydrated: (state) => set({ isHydrated: state }),
      
      hydrate: () => {
        const stored = localStorage.getItem('zentry-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state?.user && parsed.state?.token) {
              set({ 
                user: parsed.state.user, 
                token: parsed.state.token,
                isHydrated: true 
              });
            }
          } catch (e) {
            console.error('Failed to hydrate:', e);
          }
        }
        set({ isHydrated: true });
      },
      
      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token });
          toast.success('Welcome back!');
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Login failed');
          throw error;
        }
      },
      
      register: async (email, password, name) => {
        try {
          const { data } = await api.post('/auth/register', { email, password, name });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token });
          toast.success('Account created successfully!');
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Registration failed');
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        toast.success('Logged out');
      },
      
      sendTransaction: async (txData) => {
        try {
          const { data } = await api.post('/transactions/send', txData);
          set((state) => ({ transactions: [data.transaction, ...state.transactions] }));
          // Update user balance in store
          if (data.newBalance && get().user) {
            set((state) => ({
              user: state.user ? { ...state.user, balance: JSON.stringify(data.newBalance) } : null
            }));
          }
          toast.success('Transaction sent successfully!');
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Transaction failed');
          throw error;
        }
      },
      
      fetchTransactions: async () => {
        try {
          const { data } = await api.get('/transactions');
          set({ transactions: data });
        } catch (error) {
          console.error('Failed to fetch transactions:', error);
        }
      },
      
      fetchPrices: async () => {
        try {
          const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd', {
            headers: {
              'Accept': 'application/json',
            },
            timeout: 10000
          });
          set({ prices: data });
        } catch (error) {
          console.error('Failed to fetch prices:', error);
          set({ prices: { bitcoin: { usd: 43250 }, ethereum: { usd: 2250 }, tether: { usd: 1 } } });
        }
      },
    }),
    {
      name: 'zentry-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);