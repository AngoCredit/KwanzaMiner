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
import { supabase, signInWithGoogle } from '../lib/supabaseClient.ts';
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
  loginWithGoogle: (data?: { email: string; name: string; birthDate?: string; avatar?: string }) => Promise<void>;
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
  rateAoa: 100.0,
  totalMined: 0,
  treasuryBackingAoa: 0,
  change24h: 0.0,
  source: 'KwanzaMiner Engine',
};

const defaultStats: Stats = {
  totalInvestedAoa: 15450000,
  totalWithdrawnAoa: 4820000,
  kwanzaCoinInCirculation: 125400,
  totalMiningHashrateGh: 350.5,
  activeInvestmentsCount: 142,
  processedWithdrawalsCount: 98,
  totalUsersCount: 320,
  totalInvestorsCount: 285,
};

export const defaultPlans: InvestmentPlan[] = [
  {
    id: 'plan-micro',
    name: 'Starter Mineração AOA',
    description: 'Ideal para iniciar no ecossistema KwanzaCoin com investimento mínimo de 6.000 AOA.',
    minimumAmount: 6000,
    maximumAmount: 50000,
    durationDays: 30,
    returnRatePercent: 25,
    dailyRatePercent: 0.833,
    miningRatePerHour: 0.15,
    kwanzaCoinRatePercent: 5,
    active: true,
    tag: 'Entrada Facilitada',
    isPopular: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-bronze',
    name: 'Node Bronze Kwanza',
    description: 'Plano intermédio para alocação de hashrate contínuo com bónus de conversão em KC.',
    minimumAmount: 50000,
    maximumAmount: 250000,
    durationDays: 30,
    returnRatePercent: 35,
    dailyRatePercent: 1.166,
    miningRatePerHour: 0.45,
    kwanzaCoinRatePercent: 8,
    active: true,
    tag: 'Mais Rentável',
    isPopular: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-gold',
    name: 'Supernode Gold Quantum',
    description: 'Hashrate institucional dedicado para investidores de alto volume com suporte prioritário.',
    minimumAmount: 250000,
    maximumAmount: 1000000,
    durationDays: 45,
    returnRatePercent: 60,
    dailyRatePercent: 1.333,
    miningRatePerHour: 1.25,
    kwanzaCoinRatePercent: 12,
    active: true,
    tag: 'Alta Performance',
    isPopular: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-vip',
    name: 'Cluster VIP Mastermind',
    description: 'Infraestrutura corporativa de alta densidade e cluster dedicado com rendimento máximo e suporte VIP.',
    minimumAmount: 1000000,
    maximumAmount: 50000000,
    durationDays: 60,
    returnRatePercent: 100,
    dailyRatePercent: 1.666,
    miningRatePerHour: 3.50,
    kwanzaCoinRatePercent: 20,
    active: true,
    tag: 'VIP / Institucional',
    isPopular: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
  const [plans, setPlans] = useState<InvestmentPlan[]>(defaultPlans);
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

      if (plansRes.status === 'fulfilled' && plansRes.value?.plans && Array.isArray(plansRes.value.plans) && plansRes.value.plans.length > 0) {
        setPlans(plansRes.value.plans);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        if (statsRes.value.stats) setStats(statsRes.value.stats);
        if (statsRes.value.kcRate) setKcRate(statsRes.value.kcRate);
      }
    } catch {
      // Silent fail – defaultPlans remain active
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

    try {
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
        // Close EventSource on static host (e.g. Vercel) to avoid connection error loops
        es.close();
      };

      return () => {
        es.close();
      };
    } catch {
      return () => {};
    }
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
    async (data?: { email: string; name: string; birthDate?: string; avatar?: string }) => {
      // If data is provided, use it directly (manual Google form fallback)
      if (data) {
        setIsLoading(true);
        try {
          const res = await api.loginWithGoogle(data);
          afterLogin(res.user, res.wallet);
          showToast(`Autenticado com Google! Bem-vindo, ${res.user.name.split(' ')[0]}!`, 'success');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Real Google OAuth via Supabase — opens the Google account picker popup/redirect
      setIsLoading(true);
      try {
        await signInWithGoogle();
      } catch (err: any) {
        setIsLoading(false);
        const msg = err?.message || String(err);
        if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
          throw new Error('O provedor Google ainda não foi ativado no Supabase Dashboard (Authentication -> Providers -> Google). Por favor ative o Google Provider no Supabase ou registe-se por Email abaixo.');
        }
        throw new Error(msg || 'Erro ao iniciar autenticação com Google.');
      }
    },
    [afterLogin, showToast]
  );

  // Listen for Supabase OAuth session (Google redirect / popup callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const sbUser = session.user;
        const googleEmail = sbUser.email || '';
        const googleName = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || googleEmail.split('@')[0];
        const googleAvatar = sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || '';

        // Skip if already logged in with this email
        if (currentUser && currentUser.email === googleEmail) return;

        try {
          setIsLoading(true);
          const res = await api.loginWithGoogle({
            email: googleEmail,
            name: googleName,
            birthDate: '1995-01-01',
            avatar: googleAvatar,
          });
          afterLogin(res.user, res.wallet);
          showToast(`Bem-vindo, ${res.user.name.split(' ')[0]}! ✓ Sessão Google ativa`, 'success');
        } catch (err) {
          // Silent — user may have already logged in via email before
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [afterLogin, showToast]);

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
