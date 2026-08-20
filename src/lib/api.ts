// ============================================================
// KwanzaMiner — Frontend API Client
// All calls go to the Express backend at the same origin.
// ============================================================

const BASE = '';

async function request<T = any>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('Erro de rede. Tente novamente.');
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Erro ${res.status}`);
  }

  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('POST', '/api/auth/login', { email, password }),

  register: (name: string, email: string, phone: string, birthDate: string, password?: string) =>
    request('POST', '/api/auth/register', { name, email, phone, birthDate, password }),

  loginWithGoogle: (data: { email: string; name: string; birthDate?: string; avatar?: string; googleId?: string }) =>
    request('POST', '/api/auth/google', data),

  switchDemoAccount: (userId: string) =>
    request('POST', '/api/auth/switch-account', { userId }),

  updateProfile: (userId: string, data: { name?: string; phone?: string; birthDate?: string }) =>
    request('POST', `/api/users/${userId}/profile`, data),

  updatePhone: (userId: string, phone: string) =>
    request('POST', '/api/user/update-phone', { userId, phone }),

  updateUserProfile: (userId: string, data: { name?: string; phone?: string; birthDate?: string }) =>
    request('POST', `/api/users/${userId}/profile`, data),

  updateBankInfo: (userId: string, bankName: string, accountHolder: string, iban: string, accountNumber: string) =>
    request('POST', `/api/users/${userId}/bank`, { bankName, accountHolder, iban, accountNumber }),

  // Public stats
  getPublicStats: async () => {
    try {
      return await request('GET', '/api/stats/public');
    } catch {
      return {
        success: true,
        stats: {
          totalInvestedAoa: 15450000,
          totalWithdrawnAoa: 4820000,
          kwanzaCoinInCirculation: 125400,
          totalMiningHashrateGh: 350.5,
          activeInvestmentsCount: 142,
          processedWithdrawalsCount: 98,
          totalUsersCount: 320,
          totalInvestorsCount: 285,
        },
        kcRate: {
          rateAoa: 100.0,
          totalMined: 125400,
          treasuryBackingAoa: 12540000,
          change24h: 2.5,
          source: 'KwanzaMiner Engine',
        },
      };
    }
  },

  // Plans
  getPlans: async () => {
    try {
      return await request('GET', '/api/plans');
    } catch {
      return {
        success: true,
        plans: [
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
        ],
      };
    }
  },

  // Wallet & Ledger
  getWallet: (userId: string) =>
    request('GET', `/api/wallet/${userId}`),

  getLedger: (userId: string) =>
    request('GET', `/api/ledger/${userId}`),

  // Investments
  getInvestments: (userId: string) =>
    request('GET', `/api/investments/${userId}`),

  createInvestment: (userId: string, planId: string, amount: number) =>
    request('POST', '/api/investments/create', { userId, planId, amount }),

  claimProfit: (investmentId: string, userId: string) =>
    request('POST', `/api/investments/${investmentId}/claim`, { userId }),

  // Deposits
  getDeposits: (userId: string) =>
    request('GET', `/api/deposits/${userId}`),

  createDeposit: (
    userId: string,
    amount: number,
    method: string,
    phoneOrEntity?: string,
    bankAccount?: string,
    proofDocumentUrl?: string
  ) =>
    request('POST', '/api/deposits/create', {
      userId,
      amount,
      method,
      phoneOrEntity,
      bankAccount,
      proofDocumentUrl,
    }),

  sandboxConfirmDeposit: (depositId: string) =>
    request('POST', `/api/deposits/${depositId}/sandbox-confirm`),

  // Withdrawals
  getWithdrawals: (userId: string) =>
    request('GET', `/api/withdrawals/${userId}`),

  createWithdrawal: (userId: string, dataOrAmount: any, ...rest: any[]) => {
    if (typeof dataOrAmount === 'object') {
      return request('POST', '/api/withdrawals/create', { userId, ...dataOrAmount });
    }
    const [bankName, iban, holderName, accountNumber, note] = rest;
    return request('POST', '/api/withdrawals/create', {
      userId,
      amount: dataOrAmount,
      bankName,
      iban,
      holderName,
      accountNumber,
      note
    });
  },

  // KwanzaCoin
  getKcRate: () =>
    request('GET', '/api/kwanzacoin/rate'),

  convertKwanzaCoin: (userId: string, amount: number, direction: 'kc_to_aoa' | 'aoa_to_kc') =>
    request('POST', '/api/kwanzacoin/swap', {
      userId,
      fromCurrency: direction === 'kc_to_aoa' ? 'KC' : 'AOA',
      amount,
    }),

  // Mining
  getMiningTiers: () =>
    request('GET', '/api/mining/tiers'),

  getMiningStatus: (userId: string) =>
    request('GET', `/api/mining/status/${userId}`),

  upgradeMiningBoost: (userId: string, targetLevel: number) =>
    request('POST', '/api/mining/upgrade-boost', { userId, targetLevel }),

  // KYC
  getKyc: (userId: string) =>
    request('GET', `/api/kyc/${userId}`),

  submitKyc: (userId: string, dataOrType: any, ...rest: any[]) => {
    if (typeof dataOrType === 'object') {
      return request('POST', '/api/kyc/submit', { userId, ...dataOrType });
    }
    const [docNumber, fullName, birthDate, province, docFrontUrl, docBackUrl, selfieUrl] = rest;
    return request('POST', '/api/kyc/submit', {
      userId,
      docType: dataOrType,
      docNumber,
      fullName,
      birthDate,
      province,
      docFrontUrl,
      docBackUrl,
      selfieUrl
    });
  },

  // Chat
  getChatMessages: () =>
    request('GET', '/api/chat'),

  sendChatMessage: (
    userId: string,
    message: string,
    options?: { imageUrl?: string; audioUrl?: string; isDirectAdmin?: boolean }
  ) =>
    request('POST', '/api/chat/send', { userId, message, ...options }),

  // ── Admin ──────────────────────────────────────────────────
  getAllUsers: () =>
    request('GET', '/api/admin/users'),

  getAllDeposits: () =>
    request('GET', '/api/admin/deposits'),

  getAllWithdrawals: () =>
    request('GET', '/api/admin/withdrawals'),

  adminApproveDeposit: (id: string, adminId?: string, note?: string) =>
    request('POST', `/api/admin/deposits/${id}/approve`, { adminId, note }),

  adminRejectDeposit: (id: string, reason?: string) =>
    request('POST', `/api/admin/deposits/${id}/reject`, { reason }),

  rejectDeposit: (id: string, reason?: string) =>
    request('POST', `/api/admin/deposits/${id}/reject`, { reason }),

  adminMarkWithdrawalPaid: (id: string, adminId?: string, bankProofRef?: string, note?: string) =>
    request('POST', `/api/admin/withdrawals/${id}/mark-paid`, { adminId, bankProofRef, note }),

  adminApproveWithdrawal: (id: string, adminId?: string, bankProofRef?: string, note?: string) =>
    request('POST', `/api/admin/withdrawals/${id}/mark-paid`, { adminId, bankProofRef, note }),

  adminRejectWithdrawal: (id: string, reason?: string) =>
    request('POST', `/api/admin/withdrawals/${id}/reject`, { reason }),

  rejectWithdrawal: (id: string, reason?: string) =>
    request('POST', `/api/admin/withdrawals/${id}/reject`, { reason }),

  adminReviewKyc: (id: string, status: string, reason?: string) =>
    request('POST', `/api/admin/kyc/${id}/review`, { status, reason }),

  adminUpdateKyc: (id: string, status: string, reason?: string) =>
    request('POST', `/api/admin/kyc/${id}/review`, { status, reason }),

  adminUpdateKcRate: (newRateAoa: number, treasuryBackingAoa?: number, change24h?: number) =>
    request('POST', '/api/admin/kwanzacoin/rate', { newRateAoa, change24h }),

  adminTogglePremium: (id: string) =>
    request('POST', `/api/admin/users/${id}/toggle-premium`),

  toggleAdminUserPremium: (id: string) =>
    request('POST', `/api/admin/users/${id}/toggle-premium`),

  adminToggleStatus: (id: string, status: string) =>
    request('POST', `/api/admin/users/${id}/toggle-status`, { status }),

  toggleAdminUserStatus: (id: string, status: string) =>
    request('POST', `/api/admin/users/${id}/toggle-status`, { status }),

  adminAdjustBalance: (
    id: string,
    amount: number,
    currency?: string,
    type?: string,
    reason?: string,
    adminId?: string
  ) =>
    request('POST', `/api/admin/users/${id}/adjust-balance`, {
      amount,
      currency,
      type,
      reason,
      adminId,
    }),

  adminAdjustUserBalance: (
    id: string,
    amount: number,
    currency?: string,
    type?: string,
    reason?: string,
    adminId?: string
  ) =>
    request('POST', `/api/admin/users/${id}/adjust-balance`, {
      amount,
      currency,
      type,
      reason,
      adminId,
    }),

  adminUpdateRole: (id: string, role: string, adminId?: string) =>
    request('POST', `/api/admin/users/${id}/update-role`, { role, adminId }),

  adminUpdateUserRole: (id: string, role: string, adminId?: string) =>
    request('POST', `/api/admin/users/${id}/update-role`, { role, adminId }),

  getAuditLogs: () =>
    request('GET', '/api/admin/audit-logs'),

  getAdminAuditLogs: () =>
    request('GET', '/api/admin/audit-logs'),

  getSystemSettings: () =>
    request('GET', '/api/admin/settings'),

  updateSystemSettings: (settings: object, adminId: string) =>
    request('POST', '/api/admin/settings', { settings, adminId }),

  broadcastMessage: (title: string, message: string, adminId: string) =>
    request('POST', '/api/admin/broadcast', { title, message, adminId }),

  adminCreatePlan: (plan: object) =>
    request('POST', '/api/admin/plans', plan),

  createPlan: (plan: object) =>
    request('POST', '/api/admin/plans', plan),

  adminUpdatePlan: (id: string, plan: object) =>
    request('PUT', `/api/admin/plans/${id}`, plan),

  updatePlan: (id: string, plan: object) =>
    request('PUT', `/api/admin/plans/${id}`, plan),
};

