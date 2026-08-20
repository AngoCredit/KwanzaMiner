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

  // Public stats
  getPublicStats: () =>
    request('GET', '/api/stats/public'),

  // Plans
  getPlans: () =>
    request('GET', '/api/plans'),

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

  createWithdrawal: (
    userId: string,
    data: {
      amount: number;
      bankName: string;
      accountNumber: string;
      iban?: string;
      holderName: string;
      note?: string;
    }
  ) =>
    request('POST', '/api/withdrawals/create', { userId, ...data }),

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

  submitKyc: (userId: string, data: object) =>
    request('POST', '/api/kyc/submit', { userId, ...data }),

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

  adminApproveDeposit: (id: string, adminId: string, note?: string) =>
    request('POST', `/api/admin/deposits/${id}/approve`, { adminId, note }),

  adminRejectDeposit: (id: string, reason?: string) =>
    request('POST', `/api/admin/deposits/${id}/reject`, { reason }),

  adminMarkWithdrawalPaid: (id: string, adminId: string, bankProofRef?: string, note?: string) =>
    request('POST', `/api/admin/withdrawals/${id}/mark-paid`, { adminId, bankProofRef, note }),

  adminRejectWithdrawal: (id: string, reason?: string) =>
    request('POST', `/api/admin/withdrawals/${id}/reject`, { reason }),

  adminReviewKyc: (id: string, status: string, reason?: string) =>
    request('POST', `/api/admin/kyc/${id}/review`, { status, reason }),

  adminUpdateKcRate: (newRateAoa: number, treasuryBackingAoa?: number, change24h?: number) =>
    request('POST', '/api/admin/kwanzacoin/rate', { newRateAoa, change24h }),

  adminTogglePremium: (id: string) =>
    request('POST', `/api/admin/users/${id}/toggle-premium`),

  adminToggleStatus: (id: string, status: string) =>
    request('POST', `/api/admin/users/${id}/toggle-status`, { status }),

  adminAdjustBalance: (
    id: string,
    amount: number,
    currency: string,
    type: string,
    reason: string,
    adminId: string
  ) =>
    request('POST', `/api/admin/users/${id}/adjust-balance`, {
      amount,
      currency,
      type,
      reason,
      adminId,
    }),

  adminUpdateRole: (id: string, role: string, adminId: string) =>
    request('POST', `/api/admin/users/${id}/update-role`, { role, adminId }),

  getAuditLogs: () =>
    request('GET', '/api/admin/audit-logs'),

  getSystemSettings: () =>
    request('GET', '/api/admin/settings'),

  updateSystemSettings: (settings: object, adminId: string) =>
    request('POST', '/api/admin/settings', { settings, adminId }),

  broadcastMessage: (title: string, message: string, adminId: string) =>
    request('POST', '/api/admin/broadcast', { title, message, adminId }),

  adminCreatePlan: (plan: object) =>
    request('POST', '/api/admin/plans', plan),

  adminUpdatePlan: (id: string, plan: object) =>
    request('PUT', `/api/admin/plans/${id}`, plan),
};
