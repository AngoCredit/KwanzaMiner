import { supabase } from './supabase.ts';
import { db } from './database.ts';
import type { User, Wallet, Investment, Deposit, Withdrawal, KycRequest, InvestmentPlan, KcRate, AuditLog } from '../types/index.ts';

class SupabaseSyncService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    try {
      console.log('[SupabaseSync] A inicializar sincronização com Supabase Cloud...');
      this.isInitialized = true;
    } catch (err) {
      console.error('[SupabaseSync] Falha na inicialização:', err);
    }
  }

  async syncUser(user: User) {
    try {
      await supabase.from('users').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birth_date: user.birthDate,
        role: user.role,
        membership_level: user.membershipLevel,
        status: user.status,
        kyc_status: user.kycStatus,
        updated_at: new Date().toISOString()
      });
    } catch {
      // Offline fallback – in-memory db active
    }
  }

  async syncWallet(wallet: Wallet) {
    try {
      await supabase.from('wallets').upsert({
        user_id: wallet.userId,
        total_balance: wallet.totalBalance,
        available_balance: wallet.availableBalance,
        invested_balance: wallet.investedBalance,
        accumulated_profit: wallet.accumulatedProfit,
        kwanzacoin_balance: wallet.kwanzaCoinBalance,
        updated_at: wallet.updatedAt
      });
    } catch {
      // Offline fallback
    }
  }

  async syncInvestment(inv: Investment) {
    try {
      await supabase.from('investments').upsert({
        id: inv.id,
        user_id: inv.userId,
        plan_id: inv.planId,
        amount: inv.amount,
        status: inv.status,
        updated_at: new Date().toISOString()
      });
    } catch {
      // Offline fallback
    }
  }

  async syncDeposit(dep: Deposit) {
    try {
      await supabase.from('deposits').upsert({
        id: dep.id,
        user_id: dep.userId,
        amount: dep.amount,
        method: dep.method,
        status: dep.status,
        created_at: dep.createdAt
      });
    } catch {
      // Offline fallback
    }
  }

  async syncWithdrawal(wd: Withdrawal) {
    try {
      await supabase.from('withdrawals').upsert({
        id: wd.id,
        user_id: wd.userId,
        amount: wd.amount,
        bank_name: wd.bankName,
        status: wd.status,
        created_at: wd.createdAt
      });
    } catch {
      // Offline fallback
    }
  }

  async syncKyc(kyc: KycRequest) {
    try {
      await supabase.from('kyc_requests').upsert({
        id: kyc.id,
        user_id: kyc.userId,
        status: kyc.status,
        submitted_at: kyc.submittedAt
      });
    } catch {
      // Offline fallback
    }
  }

  async syncPlan(plan: InvestmentPlan) {
    try {
      await supabase.from('investment_plans').upsert({
        id: plan.id,
        name: plan.name,
        minimum_amount: plan.minimumAmount,
        return_rate_percent: plan.returnRatePercent
      });
    } catch {
      // Offline fallback
    }
  }

  async syncKcRate(rate: KcRate) {
    try {
      await supabase.from('kc_rates').upsert({
        id: 'latest',
        rate_aoa: rate.rateAoa,
        total_mined: rate.totalMined,
        updated_at: new Date().toISOString()
      });
    } catch {
      // Offline fallback
    }
  }

  async syncAuditLog(log: AuditLog) {
    try {
      await supabase.from('audit_logs').insert({
        id: log.id,
        admin_id: log.adminId,
        action: log.action,
        details: log.details,
        created_at: log.createdAt
      });
    } catch {
      // Offline fallback
    }
  }
}

export const supabaseSync = new SupabaseSyncService();
