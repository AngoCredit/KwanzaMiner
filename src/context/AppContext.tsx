import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api.ts';
import type {
  User,
  Wallet,
  Investment,
  Withdrawal,
  LedgerEntry,
  InvestmentPlan,
  KcRate,
  Stats,
  Notification,
} from '../types/index.ts';

// ─── Context shape ────────────────────────────────────────────────────────────
interface AppContextValue {
  // Routing
  currentRoute: string;
  setCurrentRoute: (route: string) => void;

  // Auth
  currentUser: User | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, birthDate: string, password?: string) => Promise<void>;
  loginWithGoogle: (data: { email: string; name: string; birthDate?: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  switchDemoAccount: () => void;

  // Data
  wallet: Wallet | null;
  investments: Investment[];
  withdrawals: Withdrawal[];
  transactions: LedgerEntry[];
  ledgerEntries: LedgerEntry[];
  plans: InvestmentPlan[];
  kcRate: KcRate;
  stats: Stats;
  notifications: Notification[];
  unreadCount: number;

  // Actions
  refreshAll: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  toastMessage: { message: string; type: string } | null;
  triggerConfetti: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const defaultKcRate: KcRate = {
  rateAoa: 157.5,
  totalMined: 488535,
  treasuryBackingAoa: 76860000,
  change24h: 3.45,
  source: 'KwanzaMiner Engine',
};

const defaultStats: Stats = {
  totalInvestedAoa: 0,
  totalWithdrawnAoa: 0,
  kwanzaCoinInCirculation: 488535,
  totalMiningHashrateGh: 0,
  activeInvestmentsCount: 0,
  processedWithdrawalsCount: 0,
  totalUsersCount: 0,
};

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRouteState] = useState<string>('/');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [kcRate, setKcRate] = useState<KcRate>(defaultKcRate);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: string } | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─ Routing ─────────────────────────────────────────────────
  const setCurrentRoute = useCallback((route: string) => {
    setCurrentRouteState(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─ Toast ───────────────────────────────────────────────────
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      setToastMessage({ message, type });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
    },
    []
  );

  // ─ Confetti ────────────────────────────────────────────────
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#1769D1', '#F59E0B', '#10B981', '#FFFFFF'],
    });
  }, []);

  // ─ Load public data (plans, stats, kcRate) ─────────────────
  const loadPublicData = useCallback(async () => {
    try {
      const [plansRes, statsRes] = await Promise.allSettled([
        api.getPlans(),
        api.getPublicStats(),
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value?.plans) {
        setPlans(plansRes.value.plans);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        if (statsRes.value.stats) setStats(statsRes.value.stats);
        if (statsRes.value.kcRate) setKcRate(statsRes.value.kcRate);
      }
    } catch {
      // Silent fail – defaults remain
    }
  }, []);

  // ─ Load user data ──────────────────────────────────────────
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [walletRes, invRes, wdRes, ledgerRes] = await Promise.allSettled([
        api.getWallet(userId),
        api.getInvestments(userId),
        api.getWithdrawals(userId),
        api.getLedger(userId),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.wallet) {
        setWallet(walletRes.value.wallet);
      }
      if (invRes.status === 'fulfilled' && invRes.value?.investments) {
        setInvestments(invRes.value.investments);
      }
      if (wdRes.status === 'fulfilled' && wdRes.value?.withdrawals) {
        setWithdrawals(wdRes.value.withdrawals);
      }
      if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.transactions) {
        setLedgerEntries(ledgerRes.value.transactions);
      }
    } catch {
      // Silent
    }
  }, []);

  // ─ Refresh all ─────────────────────────────────────────────
  const refreshAll = useCallback(async () => {
    await loadPublicData();
    if (currentUser?.id) {
      await loadUserData(currentUser.id);
    }
  }, [currentUser, loadPublicData, loadUserData]);

  // ─ SSE Setup ───────────────────────────────────────────────
  const setupSse = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    const es = new EventSource('/api/realtime');
    sseRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'KC_RATE_UPDATE' && data.kcRate) {
          setKcRate(data.kcRate);
        }

        if (data.type === 'NOTIFICATION' && data.notification) {
          setNotifications((prev) => [
            { ...data.notification, read: false },
            ...prev.slice(0, 49),
          ]);
        }

        if (data.type === 'TICK' || data.type === 'WALLET_UPDATE') {
          // Refresh user data on tick
          setCurrentUser((user) => {
            if (user?.id) {
              loadUserData(user.id);
            }
            return user;
          });
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      // Reconnect handled by browser
    };

    return () => {
      es.close();
    };
  }, [loadUserData]);

  // ─ Init ────────────────────────────────────────────────────
  useEffect(() => {
    loadPublicData();
    const cleanup = setupSse();
    return cleanup;
  }, []);

  // ─ Session persistence ─────────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem('kwz_user');
    if (saved) {
      try {
        const user: User = JSON.parse(saved);
        setCurrentUser(user);
        loadUserData(user.id);
      } catch {
        sessionStorage.removeItem('kwz_user');
      }
    }
  }, []);

  // ─── Auth actions ─────────────────────────────────────────
  const afterLogin = useCallback(
    (user: User, walletData: Wallet | null) => {
      setCurrentUser(user);
      if (walletData) setWallet(walletData);
      sessionStorage.setItem('kwz_user', JSON.stringify(user));
      setAuthModalOpen(false);
      loadUserData(user.id);

      if (user.role === 'admin' || user.role === 'superadmin') {
        setCurrentRoute('/admin');
      } else {
        setCurrentRoute('/dashboard');
      }
    },
    [loadUserData, setCurrentRoute]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.login(email, password);
        afterLogin(res.user, res.wallet);
        showToast(`Bem-vindo de volta, ${res.user.name.split(' ')[0]}!`, 'success');
      } finally {
        setIsLoading(false);
      }
    },
    [afterLogin, showToast]
  );

  const register = useCallback(
    async (name: string, email: string, phone: string, birthDate: string, password?: string) => {
      setIsLoading(true);
      try {
        const res = await api.register(name, email, phone, birthDate, password);
        afterLogin(res.user, res.wallet);
        showToast(`Conta criada com sucesso! Bem-vindo, ${res.user.name.split(' ')[0]}!`, 'success');
        triggerConfetti();
      } finally {
        setIsLoading(false);
      }
    },
    [afterLogin, showToast, triggerConfetti]
  );

  const loginWithGoogle = useCallback(
    async (data: { email: string; name: string; birthDate?: string; avatar?: string }) => {
      setIsLoading(true);
      try {
        const res = await api.loginWithGoogle(data);
        afterLogin(res.user, res.wallet);
        showToast(`Autenticado com Google! Bem-vindo, ${res.user.name.split(' ')[0]}!`, 'success');
      } finally {
        setIsLoading(false);
      }
    },
    [afterLogin, showToast]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setWallet(null);
    setInvestments([]);
    setWithdrawals([]);
    setLedgerEntries([]);
    setNotifications([]);
    sessionStorage.removeItem('kwz_user');
    setCurrentRoute('/');
    showToast('Sessão terminada com sucesso.', 'info');
  }, [setCurrentRoute, showToast]);

  const switchDemoAccount = useCallback(() => {
    // No-op in this implementation – kept for API compatibility
  }, []);

  // ─── Context value ────────────────────────────────────────
  const value: AppContextValue = {
    currentRoute,
    setCurrentRoute,
    currentUser,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    switchDemoAccount,
    wallet,
    investments,
    withdrawals,
    transactions: ledgerEntries,
    ledgerEntries,
    plans,
    kcRate,
    stats,
    notifications,
    unreadCount,
    refreshAll,
    showToast,
    toastMessage,
    triggerConfetti,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
