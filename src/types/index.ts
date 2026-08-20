// ============================================================
// KwanzaMiner — Shared TypeScript Types
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  age?: number;
  avatar?: string;
  authProvider: 'email' | 'google';
  role: 'user' | 'admin' | 'superadmin';
  membershipLevel: 'normal' | 'premium';
  status: 'active' | 'blocked' | 'suspended';
  kycStatus: 'unverified' | 'pending' | 'in_review' | 'approved' | 'rejected';
  twoFactorEnabled?: boolean;
  miningBoostLevel?: number;
  miningBoostMultiplier?: number;
  createdAt: string;
  lastLogin?: string;
}

export interface Wallet {
  userId: string;
  totalBalance: number;
  availableBalance: number;
  investedBalance: number;
  accumulatedProfit: number;
  kwanzaCoinBalance: number;
  lockedBalance: number;
  miningBoostLevel?: number;
  miningMultiplier?: number;
  updatedAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  minimumAmount: number;
  maximumAmount: number;
  durationDays: number;
  returnRatePercent: number;
  dailyRatePercent: number;
  miningRatePerHour: number;
  kwanzaCoinRatePercent: number;
  active: boolean;
  tag?: string;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  returnRatePercent: number;
  dailyRatePercent: number;
  miningRatePerHour: number;
  currentProfit: number;
  claimedProfit: number;
  accumulatedKc: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: string;
  phoneOrEntity?: string;
  bankAccount?: string;
  proofDocumentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  iban?: string;
  holderName: string;
  note?: string;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  adminNote?: string;
  bankProofRef?: string;
  paidAt?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: 'AOA' | 'KC';
  description: string;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  createdAt: string;
}

export interface KcRate {
  rateAoa: number;
  totalMined: number;
  treasuryBackingAoa: number;
  change24h: number;
  source?: string;
  effectiveFrom?: string;
}

export interface Stats {
  totalInvestedAoa: number;
  totalWithdrawnAoa: number;
  kwanzaCoinInCirculation: number;
  totalMiningHashrateGh: number;
  activeInvestmentsCount: number;
  processedWithdrawalsCount: number;
  totalUsersCount?: number;
  totalInvestorsCount?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  userId?: string;
  createdAt: string;
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fullName: string;
  birthDate: string;
  phone: string;
  docType: string;
  docNumber: string;
  docFrontUrl?: string;
  docBackUrl?: string;
  selfieUrl?: string;
  bankIban?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface MiningBoostTier {
  level: number;
  name: string;
  multiplier: number;
  hashrate: string;
  kcCost: number;
  description?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  investmentEnabled: boolean;
  minDepositAoa: number;
  minWithdrawalAoa: number;
  announcementMessage?: string;
  announcementActive?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  isDirectAdmin?: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}
