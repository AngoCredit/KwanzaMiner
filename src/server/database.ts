import type {
  User,
  Wallet,
  InvestmentPlan,
  Investment,
  Deposit,
  Withdrawal,
  LedgerEntry,
  KcRate,
  Stats,
  KycRequest,
  MiningBoostTier,
  SystemSettings,
  ChatMessage,
  AuditLog
} from '../types/index.ts';

class InMemoryDatabase {
  users = new Map<string, User>();
  wallets = new Map<string, Wallet>();
  investments = new Map<string, Investment>();
  deposits = new Map<string, Deposit>();
  withdrawals = new Map<string, Withdrawal>();
  ledger: LedgerEntry[] = [];
  kycRequests = new Map<string, KycRequest>();
  chatMessages: ChatMessage[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];

  kcRate: KcRate = {
    rateAoa: 100.0,
    totalMined: 0,
    treasuryBackingAoa: 0,
    change24h: 0.0,
    source: 'KwanzaMiner Market Algorithm',
    effectiveFrom: new Date().toISOString()
  };

  systemSettings: SystemSettings = {
    maintenanceMode: false,
    depositEnabled: true,
    withdrawalEnabled: true,
    investmentEnabled: true,
    minDepositAoa: 6000,
    minWithdrawalAoa: 5000,
    announcementMessage: 'Plataforma KwanzaCoin operacional. Depósitos via Multicaixa 24/7.',
    announcementActive: true
  };

  miningBoostTiers: MiningBoostTier[] = [
    { level: 1, name: 'Básico', multiplier: 1.0, hashrate: '12.5 MH/s', kcCost: 0, description: 'Velocidade padrão de mineração.' },
    { level: 2, name: 'Pro Turbo', multiplier: 1.5, hashrate: '28.4 MH/s', kcCost: 50, description: '+50% rendimento de cêntimos e microcêntimos.' },
    { level: 3, name: 'Quantum Ultra', multiplier: 2.5, hashrate: '85.0 MH/s', kcCost: 150, description: 'Velocidade máxima e prioridade de bloco.' }
  ];

  investmentPlans: InvestmentPlan[] = [
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
      updatedAt: new Date().toISOString()
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
      updatedAt: new Date().toISOString()
    },
    {
      id: 'plan-gold',
      name: 'Supernode Gold Quantum',
      description: 'Hashrate institucional dedicado para investidores de alto volume com suporte prioritário.',
      minimumAmount: 250000,
      maximumAmount: 5000000,
      durationDays: 45,
      returnRatePercent: 60,
      dailyRatePercent: 1.333,
      miningRatePerHour: 1.25,
      kwanzaCoinRatePercent: 12,
      active: true,
      tag: 'Alta Performance',
      isPopular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Seed Sole Superadmin
    const superAdmin: User = {
      id: 'usr-admin-001',
      name: 'Kwanza Admin',
      email: 'bytekwanza@gmail.com',
      phone: '+244 923 000 000',
      birthDate: '1990-01-01',
      age: 36,
      authProvider: 'email',
      role: 'superadmin',
      membershipLevel: 'premium',
      status: 'active',
      kycStatus: 'approved',
      twoFactorEnabled: true,
      miningBoostLevel: 3,
      miningBoostMultiplier: 2.5,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const adminWallet: Wallet = {
      userId: superAdmin.id,
      totalBalance: 0,
      availableBalance: 0,
      investedBalance: 0,
      accumulatedProfit: 0,
      kwanzaCoinBalance: 0,
      lockedBalance: 0,
      miningBoostLevel: 1,
      miningMultiplier: 1.0,
      updatedAt: new Date().toISOString()
    };

    this.users.set(superAdmin.id, superAdmin);
    this.wallets.set(superAdmin.id, adminWallet);
  }

  getAggregatedStats(): Stats {
    let totalInvestedAoa = 0;
    Array.from(this.investments.values()).forEach(i => {
      totalInvestedAoa += i.amount;
    });

    let totalWithdrawnAoa = 0;
    Array.from(this.withdrawals.values()).forEach(w => {
      if (w.status === 'paid') totalWithdrawnAoa += w.amount;
    });

    return {
      totalInvestedAoa,
      totalWithdrawnAoa,
      kwanzaCoinInCirculation: this.kcRate.totalMined,
      totalMiningHashrateGh: 125.8,
      activeInvestmentsCount: Array.from(this.investments.values()).filter(i => i.status === 'active').length,
      processedWithdrawalsCount: Array.from(this.withdrawals.values()).filter(w => w.status === 'paid').length,
      totalUsersCount: this.users.size,
      totalInvestorsCount: this.users.size
    };
  }
}

export const db = new InMemoryDatabase();
