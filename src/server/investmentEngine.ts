import { db } from './database.ts';
import { supabaseSync } from './supabase_sync.ts';
import type { Investment, Deposit, Withdrawal, LedgerEntry, ChatMessage, AuditLog } from '../types/index.ts';

type SseSendFn = (data: any) => void;

class InvestmentEngine {
  private sseClients: Set<SseSendFn> = new Set();
  private tickerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startLiveTicker();
  }

  registerSseClient(send: SseSendFn) {
    this.sseClients.add(send);
    return () => {
      this.sseClients.delete(send);
    };
  }

  broadcast(data: any) {
    this.sseClients.forEach((send) => {
      try {
        send(data);
      } catch {
        // Client closed
      }
    });
  }

  // Live yield calculation loop (runs every second for micro-cents accumulation)
  private startLiveTicker() {
    this.tickerInterval = setInterval(() => {
      let updatedAny = false;

      Array.from(db.investments.values()).forEach((inv) => {
        if (inv.status !== 'active') return;

        const user = db.users.get(inv.userId);
        const wallet = db.wallets.get(inv.userId);
        if (!user || !wallet) return;

        const multiplier = user.miningBoostMultiplier || wallet.miningMultiplier || 1.0;
        const dailyYield = (inv.amount * (inv.dailyRatePercent / 100)) * multiplier;
        const perSecYieldAoa = dailyYield / 86400;
        const perSecKc = ((inv.miningRatePerHour * multiplier) / 3600);

        inv.currentProfit += perSecYieldAoa;
        inv.accumulatedKc += perSecKc;

        wallet.accumulatedProfit += perSecYieldAoa;
        wallet.kwanzaCoinBalance += perSecKc;
        wallet.totalBalance = wallet.availableBalance + wallet.investedBalance + (wallet.kwanzaCoinBalance * db.kcRate.rateAoa);
        wallet.updatedAt = new Date().toISOString();

        updatedAny = true;
      });

      if (updatedAny) {
        this.broadcast({ type: 'TICK', timestamp: Date.now() });
      }
    }, 1000);
  }

  // 1. Create Investment
  createInvestment(userId: string, planId: string, amount: number) {
    const user = db.users.get(userId);
    const wallet = db.wallets.get(userId);
    const plan = db.investmentPlans.find((p) => p.id === planId);

    if (!user || !wallet) return { success: false, message: 'Utilizador ou carteira não encontrados.' };
    if (!plan) return { success: false, message: 'Plano de investimento inválido.' };

    // Check system settings
    if (db.systemSettings.maintenanceMode) return { success: false, message: 'Plataforma em manutenção. Subscrições suspensas.' };
    if (!db.systemSettings.investmentEnabled) return { success: false, message: 'A subscrição de novos planos está temporàriamente suspensa.' };

    if (amount < plan.minimumAmount) return { success: false, message: `Montante mínimo: ${plan.minimumAmount} AOA` };
    if (amount > wallet.availableBalance) return { success: false, message: 'Saldo disponível insuficiente na carteira.' };

    // Deduct available, add to invested
    wallet.availableBalance -= amount;
    wallet.investedBalance += amount;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 86400 * 1000);

    const newInv: Investment = {
      id: `inv-${Date.now()}`,
      userId,
      planId: plan.id,
      planName: plan.name,
      amount,
      returnRatePercent: plan.returnRatePercent,
      dailyRatePercent: plan.dailyRatePercent,
      miningRatePerHour: plan.miningRatePerHour,
      currentProfit: 0,
      claimedProfit: 0,
      accumulatedKc: (amount * (plan.kwanzaCoinRatePercent / 100)) / db.kcRate.rateAoa,
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: startDate.toISOString()
    };

    db.investments.set(newInv.id, newInv);

    const ledger: LedgerEntry = {
      id: `led-${Date.now()}`,
      userId,
      type: 'INVESTMENT_ACTIVATION',
      amount,
      currency: 'AOA',
      description: `Ativação do plano ${plan.name}`,
      balanceBefore: wallet.availableBalance + amount,
      balanceAfter: wallet.availableBalance,
      referenceId: newInv.id,
      createdAt: new Date().toISOString()
    };

    db.ledger.unshift(ledger);
    supabaseSync.syncInvestment(newInv);
    supabaseSync.syncWallet(wallet);

    return { success: true, investment: newInv, wallet };
  }

  // 2. Claim Profit
  claimProfit(investmentId: string, userId: string) {
    const inv = db.investments.get(investmentId);
    const wallet = db.wallets.get(userId);
    if (!inv || !wallet || inv.userId !== userId) return { success: false, message: 'Investimento não encontrado.' };

    const claimable = inv.currentProfit - inv.claimedProfit;
    if (claimable < 0.01) return { success: false, message: 'Sem rendimentos suficientes para resgatar.' };

    inv.claimedProfit += claimable;
    wallet.availableBalance += claimable;
    wallet.updatedAt = new Date().toISOString();

    const ledger: LedgerEntry = {
      id: `led-${Date.now()}`,
      userId,
      type: 'PROFIT_CLAIM',
      amount: claimable,
      currency: 'AOA',
      description: `Resgate de rendimento do plano ${inv.planName}`,
      balanceBefore: wallet.availableBalance - claimable,
      balanceAfter: wallet.availableBalance,
      referenceId: inv.id,
      createdAt: new Date().toISOString()
    };

    db.ledger.unshift(ledger);
    supabaseSync.syncInvestment(inv);
    supabaseSync.syncWallet(wallet);

    return { success: true, amountClaimed: claimable, wallet };
  }

  // 3. Deposit
  createDeposit(userId: string, amount: number, method: string, phoneOrEntity?: string, bankAccount?: string, proofDocumentUrl?: string) {
    const user = db.users.get(userId);
    if (!user) return { success: false, message: 'Utilizador não encontrado.' };

    // Check system settings
    if (db.systemSettings.maintenanceMode) {
      return { success: false, message: 'Plataforma em manutenção. Depósitos suspensos temporariamente.' };
    }
    if (!db.systemSettings.depositEnabled) {
      return { success: false, message: 'Os depósitos estão temporàriamente suspensos pela administração.' };
    }
    if (amount < db.systemSettings.minDepositAoa) {
      return { success: false, message: `O depósito mínimo é de ${db.systemSettings.minDepositAoa} AOA.` };
    }

    const depId = `dep-${Date.now()}`;
    const newDep: Deposit = {
      id: depId,
      userId,
      userName: user.name,
      userEmail: user.email,
      amount,
      method: method || 'multicaixa_express',
      phoneOrEntity: phoneOrEntity || '00392',
      bankAccount: bankAccount || '497110000',
      proofDocumentUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.deposits.set(depId, newDep);
    supabaseSync.syncDeposit(newDep);

    return { success: true, deposit: newDep };
  }

  approveDeposit(depositId: string, adminId: string, note?: string, ipAddress?: string) {
    const dep = db.deposits.get(depositId);
    if (!dep) return { success: false, message: 'Depósito não encontrado.' };
    if (dep.status === 'approved') return { success: false, message: 'Depósito já aprovado.' };

    dep.status = 'approved';
    dep.approvedAt = new Date().toISOString();
    dep.adminNote = note || 'Aprovado e creditado na carteira.';

    const wallet = db.wallets.get(dep.userId);
    if (wallet) {
      wallet.availableBalance += dep.amount;
      wallet.totalBalance = wallet.availableBalance + wallet.investedBalance + (wallet.kwanzaCoinBalance * db.kcRate.rateAoa);
      wallet.updatedAt = new Date().toISOString();
      supabaseSync.syncWallet(wallet);
    }

    const ledger: LedgerEntry = {
      id: `led-${Date.now()}`,
      userId: dep.userId,
      type: 'DEPOSIT_CREDIT',
      amount: dep.amount,
      currency: 'AOA',
      description: `Crédito de depósito por Multicaixa/Express (${dep.id})`,
      balanceBefore: (wallet?.availableBalance || 0) - dep.amount,
      balanceAfter: wallet?.availableBalance || dep.amount,
      referenceId: dep.id,
      createdAt: new Date().toISOString()
    };

    db.ledger.unshift(ledger);

    // Push in-app notification to depositor
    const notif: any = {
      id: `notif-dep-${Date.now()}`,
      userId: dep.userId,
      title: '✅ Depósito Aprovado',
      message: `O seu depósito de ${dep.amount.toLocaleString('pt-AO')} AOA foi validado e creditado na sua carteira.`,
      type: 'deposit_approved',
      read: false,
      createdAt: new Date().toISOString()
    };
    (db.notifications as any[]).push(notif);
    this.broadcast({ type: 'NOTIFICATION', notification: notif });

    supabaseSync.syncDeposit(dep);

    return { success: true, deposit: dep, wallet };
  }

  // 4. Withdrawal
  createWithdrawal(userId: string, data: { amount: number; bankName: string; accountNumber: string; iban?: string; holderName: string; note?: string }) {
    const wallet = db.wallets.get(userId);
    if (!wallet) return { success: false, message: 'Carteira não encontrada.' };

    // Check system settings
    if (db.systemSettings.maintenanceMode) return { success: false, message: 'Plataforma em manutenção. Levantamentos suspensos.' };
    if (!db.systemSettings.withdrawalEnabled) return { success: false, message: 'Os levantamentos estão temporàriamente suspensos.' };
    if (data.amount < db.systemSettings.minWithdrawalAoa) return { success: false, message: `O levantamento mínimo é de ${db.systemSettings.minWithdrawalAoa} AOA.` };

    if (data.amount > wallet.availableBalance) return { success: false, message: 'Saldo disponível insuficiente para levantamento.' };

    wallet.availableBalance -= data.amount;
    wallet.lockedBalance += data.amount;
    wallet.updatedAt = new Date().toISOString();

    const wdId = `wd-${Date.now()}`;
    const newWd: Withdrawal = {
      id: wdId,
      userId,
      amount: data.amount,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      iban: data.iban,
      holderName: data.holderName,
      note: data.note,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.withdrawals.set(wdId, newWd);
    supabaseSync.syncWithdrawal(newWd);
    supabaseSync.syncWallet(wallet);

    return { success: true, withdrawal: newWd, wallet };
  }

  markWithdrawalPaid(withdrawalId: string, adminId: string, bankProofRef?: string, note?: string, ipAddress?: string) {
    const wd = db.withdrawals.get(withdrawalId);
    if (!wd) return { success: false, message: 'Levantamento não encontrado.' };

    wd.status = 'paid';
    wd.paidAt = new Date().toISOString();
    wd.bankProofRef = bankProofRef || `TRF-${Date.now()}`;
    wd.adminNote = note || 'Pago com sucesso via transferência bancária.';

    const wallet = db.wallets.get(wd.userId);
    if (wallet) {
      wallet.lockedBalance = Math.max(0, wallet.lockedBalance - wd.amount);
      wallet.updatedAt = new Date().toISOString();
      supabaseSync.syncWallet(wallet);
    }

    supabaseSync.syncWithdrawal(wd);

    return { success: true, withdrawal: wd };
  }

  // 5. Swap KC
  swapKwanzaCoin(userId: string, fromCurrency: 'KC' | 'AOA', amount: number) {
    const wallet = db.wallets.get(userId);
    if (!wallet) return { success: false, message: 'Carteira não encontrada.' };

    let amountReceived = 0;
    if (fromCurrency === 'KC') {
      if (amount > wallet.kwanzaCoinBalance) return { success: false, message: 'Saldo insuficiente de KwanzaCoin.' };
      amountReceived = amount * db.kcRate.rateAoa;
      wallet.kwanzaCoinBalance -= amount;
      wallet.availableBalance += amountReceived;
    } else {
      if (amount > wallet.availableBalance) return { success: false, message: 'Saldo insuficiente em Kwanza.' };
      amountReceived = amount / db.kcRate.rateAoa;
      wallet.availableBalance -= amount;
      wallet.kwanzaCoinBalance += amountReceived;
    }

    wallet.updatedAt = new Date().toISOString();
    supabaseSync.syncWallet(wallet);

    return { success: true, amountReceived, wallet };
  }

  // 6. Mining Upgrade
  upgradeMiningBoost(userId: string, targetLevel: number) {
    const user = db.users.get(userId);
    const wallet = db.wallets.get(userId);
    if (!user || !wallet) return { success: false, message: 'Utilizador não encontrado.' };

    const tier = db.miningBoostTiers.find((t) => t.level === targetLevel);
    if (!tier) return { success: false, message: 'Nível de acelerador inválido.' };

    if (tier.kcCost > 0) {
      if (wallet.kwanzaCoinBalance < tier.kcCost) {
        return { success: false, message: `Saldo insuficiente de KC (${tier.kcCost} KC necessários).` };
      }
      wallet.kwanzaCoinBalance -= tier.kcCost;
    }

    user.miningBoostLevel = tier.level;
    user.miningBoostMultiplier = tier.multiplier;
    wallet.miningBoostLevel = tier.level;
    wallet.miningMultiplier = tier.multiplier;

    supabaseSync.syncUser(user);
    supabaseSync.syncWallet(wallet);

    return { success: true, boostLevel: tier.level, multiplier: tier.multiplier, wallet };
  }

  // 7. Balance Adjustment (Admin)
  adjustUserBalance(userId: string, amount: number, currency: string, type: string, reason: string, adminId: string, ipAddress?: string) {
    const wallet = db.wallets.get(userId);
    if (!wallet) return { success: false, message: 'Carteira não encontrada.' };

    if (currency === 'KC') {
      wallet.kwanzaCoinBalance = type === 'add' ? wallet.kwanzaCoinBalance + amount : Math.max(0, wallet.kwanzaCoinBalance - amount);
    } else {
      wallet.availableBalance = type === 'add' ? wallet.availableBalance + amount : Math.max(0, wallet.availableBalance - amount);
    }

    wallet.updatedAt = new Date().toISOString();
    supabaseSync.syncWallet(wallet);

    return { success: true, wallet };
  }

  // 8. User Role Update
  updateUserRole(userId: string, role: string, adminId: string, ipAddress?: string) {
    const user = db.users.get(userId);
    if (!user) return { success: false, message: 'Utilizador não encontrado.' };

    user.role = role as any;
    supabaseSync.syncUser(user);

    return { success: true, user };
  }

  // 9. System Settings Update
  updateSystemSettings(settings: any, adminId: string, ipAddress?: string) {
    db.systemSettings = { ...db.systemSettings, ...settings };
    return { success: true, settings: db.systemSettings };
  }

  // 10. Broadcast System Notification
  broadcastSystemNotification(title: string, message: string, adminId: string, ipAddress?: string) {
    const notif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      createdAt: new Date().toISOString()
    };

    this.broadcast({ type: 'NOTIFICATION', notification: notif });
    return { success: true, notification: notif };
  }

  // 11. Chat Message
  sendChatMessage(userId: string, message: string, options?: { imageUrl?: string; audioUrl?: string; isDirectAdmin?: boolean }) {
    const user = db.users.get(userId);
    if (!user) return { success: false, message: 'Utilizador não encontrado.' };

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      message,
      imageUrl: options?.imageUrl,
      audioUrl: options?.audioUrl,
      isDirectAdmin: options?.isDirectAdmin,
      createdAt: new Date().toISOString()
    };

    db.chatMessages.push(msg);
    return { success: true, message: msg };
  }
}

export const investmentEngine = new InvestmentEngine();
