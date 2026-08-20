import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/database.ts';
import { investmentEngine } from './src/server/investmentEngine.ts';
import { supabaseSync } from './src/server/supabase_sync.ts';
import { User, InvestmentPlan, AuditLog } from './src/types/index.ts';

async function startServer() {
  // Initialize Supabase sync (loads database into memory or seeds Supabase)
  await supabaseSync.initialize();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));


  // Trust proxy headers (X-Forwarded-For, X-Real-IP) for correct IP resolution
  app.set('trust proxy', true);

  // Helper: extract the real client IP from request headers
  const getClientIp = (req: express.Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // X-Forwarded-For can be a comma-separated list: take the first (original client)
      const firstIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
      if (firstIp) return firstIp;
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) return (Array.isArray(realIp) ? realIp[0] : realIp).trim();
    return req.ip || req.socket?.remoteAddress || 'IP Desconhecido';
  };

  // SSE (Server-Sent Events) for real-time live ticks, balances, and notifications
  app.get('/api/realtime', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const cleanup = investmentEngine.registerSseClient(send);

    req.on('close', () => {
      cleanup();
      res.end();
    });
  });

  // 1. PUBLIC / PLATFORM STATS (calculated directly from real backend ledger)
  app.get('/api/stats/public', (req, res) => {
    res.json({
      success: true,
      stats: db.getAggregatedStats(),
      kcRate: db.kcRate
    });
  });

  // 2. AUTHENTICATION & SESSIONS
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email é obrigatório.' });
    }

    let user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Check if it's admin or create user
      return res.status(401).json({ success: false, message: 'Credenciais inválidas ou utilizador não encontrado.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'A sua conta encontra-se bloqueada pela administração.' });
    }

    user.lastLogin = new Date().toISOString();
    const wallet = db.wallets.get(user.id);

    res.json({
      success: true,
      user,
      wallet,
      token: `kwz-token-${user.id}-${Date.now()}`
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, birthDate, password } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    if (!birthDate) {
      return res.status(400).json({ success: false, message: 'A data de nascimento é obrigatória para comprovar maioridade legal.' });
    }

    // Verify 18+ legal age
    const bDate = new Date(birthDate);
    if (isNaN(bDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Data de nascimento inválida.' });
    }
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({ 
        success: false, 
        message: `Idade calculada (${age} anos). É obrigatório ter pelo menos 18 anos de idade para se cadastrar e investir na KwanzaCoin.` 
      });
    }

    const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Já existe uma conta registada com este email.' });
    }

    const isSoleAdmin = email.toLowerCase() === 'bytekwanza@gmail.com';
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone,
      birthDate,
      age,
      authProvider: 'email',
      role: isSoleAdmin ? 'superadmin' : 'user',
      membershipLevel: isSoleAdmin ? 'premium' : 'normal',
      status: 'active',
      kycStatus: isSoleAdmin ? 'approved' : 'unverified',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);

    const newWallet = {
      userId: newUser.id,
      totalBalance: 0,
      availableBalance: 0,
      investedBalance: 0,
      accumulatedProfit: 0,
      kwanzaCoinBalance: 0,
      lockedBalance: 0,
      updatedAt: new Date().toISOString()
    };
    db.wallets.set(newUser.id, newWallet);

    supabaseSync.syncUser(newUser);
    supabaseSync.syncWallet(newWallet);

    res.json({
      success: true,
      user: newUser,
      wallet: newWallet,
      token: `kwz-token-${newUser.id}-${Date.now()}`
    });
  });

  // Google Authentication (Login or Register)
  app.post('/api/auth/google', (req, res) => {
    const { email, name, avatar, googleId, birthDate, phone } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email da conta Google não fornecido.' });
    }

    let user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // Existing Google or email user
      if (user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'A sua conta encontra-se bloqueada pela administração.' });
      }
      user.lastLogin = new Date().toISOString();
      if (avatar && !user.avatar) user.avatar = avatar;

      // Sole Superadmin Promotion
      if (email.toLowerCase() === 'bytekwanza@gmail.com') {
        user.role = 'superadmin';
        user.membershipLevel = 'premium';
        user.kycStatus = 'approved';
      }

      if (birthDate && !user.birthDate) {
        user.birthDate = birthDate;
        const bDate = new Date(birthDate);
        if (!isNaN(bDate.getTime())) {
          let age = new Date().getFullYear() - bDate.getFullYear();
          const m = new Date().getMonth() - bDate.getMonth();
          if (m < 0 || (m === 0 && new Date().getDate() < bDate.getDate())) age--;
          user.age = age;
        }
      }
      supabaseSync.syncUser(user);
      const wallet = db.wallets.get(user.id);
      return res.json({
        success: true,
        user,
        wallet,
        token: `kwz-google-${user.id}-${Date.now()}`
      });
    }

    // New User registration via Google
    if (birthDate) {
      const bDate = new Date(birthDate);
      if (!isNaN(bDate.getTime())) {
        let age = new Date().getFullYear() - bDate.getFullYear();
        const m = new Date().getMonth() - bDate.getMonth();
        if (m < 0 || (m === 0 && new Date().getDate() < bDate.getDate())) age--;
        if (age < 18) {
          return res.status(400).json({
            success: false,
            message: `Idade calculada (${age} anos). É obrigatório ter no mínimo 18 anos para investir na KwanzaCoin.`
          });
        }
      }
    }

    const bDate = birthDate ? new Date(birthDate) : new Date('1995-01-01');
    let age = 31;
    if (!isNaN(bDate.getTime())) {
      age = new Date().getFullYear() - bDate.getFullYear();
      const m = new Date().getMonth() - bDate.getMonth();
      if (m < 0 || (m === 0 && new Date().getDate() < bDate.getDate())) age--;
    }

    const isSoleAdmin = email.toLowerCase() === 'bytekwanza@gmail.com';
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      phone: phone || '+244 923 000 000',
      birthDate: birthDate || '1995-01-01',
      age,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      authProvider: 'google',
      role: isSoleAdmin ? 'superadmin' : 'user',
      membershipLevel: isSoleAdmin ? 'premium' : 'normal',
      status: 'active',
      kycStatus: isSoleAdmin ? 'approved' : 'unverified',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);

    const googleWallet = {
      userId: newUser.id,
      totalBalance: 0,
      availableBalance: 0,
      investedBalance: 0,
      accumulatedProfit: 0,
      kwanzaCoinBalance: 0,
      lockedBalance: 0,
      updatedAt: new Date().toISOString()
    };
    db.wallets.set(newUser.id, googleWallet);

    supabaseSync.syncUser(newUser);
    supabaseSync.syncWallet(googleWallet);

    res.json({
      success: true,
      user: newUser,
      wallet: db.wallets.get(newUser.id),
      token: `kwz-google-${newUser.id}-${Date.now()}`
    });
  });

  // Update profile
  app.post('/api/users/:userId/profile', (req, res) => {
    const { userId } = req.params;
    const { name, phone, birthDate } = req.body;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (birthDate) {
      const bDate = new Date(birthDate);
      if (!isNaN(bDate.getTime())) {
        let age = new Date().getFullYear() - bDate.getFullYear();
        const m = new Date().getMonth() - bDate.getMonth();
        if (m < 0 || (m === 0 && new Date().getDate() < bDate.getDate())) age--;
        if (age < 18) {
          return res.status(400).json({ success: false, message: 'É obrigatório ter no mínimo 18 anos de idade.' });
        }
        user.birthDate = birthDate;
        user.age = age;
      }
    }

    supabaseSync.syncUser(user);

    res.json({ success: true, user });
  });

  // Switch demo account
  app.post('/api/auth/switch-account', (req, res) => {
    const { userId } = req.body;
    const user = db.users.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Conta demo não encontrada.' });
    }
    const wallet = db.wallets.get(user.id);
    res.json({
      success: true,
      user,
      wallet
    });
  });

  // 3. INVESTMENT PLANS
  app.get('/api/plans', (req, res) => {
    res.json({
      success: true,
      plans: db.investmentPlans
    });
  });

  // Admin Plan Management
  app.post('/api/admin/plans', (req, res) => {
    const { name, description, minimumAmount, maximumAmount, durationDays, returnRatePercent, dailyRatePercent, miningRatePerHour, kwanzaCoinRatePercent, tag, isPopular } = req.body;
    
    const newPlan: InvestmentPlan = {
      id: `plan-${Date.now()}`,
      name,
      description,
      minimumAmount: Number(minimumAmount) || 6000,
      maximumAmount: Number(maximumAmount) || 100000,
      durationDays: Number(durationDays) || 30,
      returnRatePercent: Number(returnRatePercent) || 25,
      dailyRatePercent: Number(dailyRatePercent) || (Number(returnRatePercent) / Number(durationDays)),
      miningRatePerHour: Number(miningRatePerHour) || 0.1,
      kwanzaCoinRatePercent: Number(kwanzaCoinRatePercent) || 5,
      active: true,
      tag,
      isPopular: Boolean(isPopular),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.investmentPlans.push(newPlan);
    supabaseSync.syncPlan(newPlan);
    res.json({ success: true, plan: newPlan });
  });

  app.put('/api/admin/plans/:id', (req, res) => {
    const { id } = req.params;
    const planIndex = db.investmentPlans.findIndex(p => p.id === id);
    if (planIndex === -1) {
      return res.status(404).json({ success: false, message: 'Plano não encontrado.' });
    }

    db.investmentPlans[planIndex] = {
      ...db.investmentPlans[planIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    supabaseSync.syncPlan(db.investmentPlans[planIndex]);
    res.json({ success: true, plan: db.investmentPlans[planIndex] });
  });

  // 4. USER WALLET & LEDGER
  app.get('/api/wallet/:userId', (req, res) => {
    const { userId } = req.params;
    const wallet = db.wallets.get(userId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Carteira não encontrada.' });
    }
    // Update calculated total value
    wallet.totalBalance = wallet.availableBalance + wallet.investedBalance + (wallet.kwanzaCoinBalance * db.kcRate.rateAoa);
    res.json({ success: true, wallet });
  });

  app.get('/api/ledger/:userId', (req, res) => {
    const { userId } = req.params;
    const userLedger = db.ledger.filter(l => l.userId === userId);
    res.json({ success: true, transactions: userLedger });
  });

  // 5. INVESTMENTS & MINING
  app.get('/api/investments/:userId', (req, res) => {
    const { userId } = req.params;
    const userInvestments = Array.from(db.investments.values()).filter(i => i.userId === userId);
    res.json({ success: true, investments: userInvestments });
  });

  app.post('/api/investments/create', (req, res) => {
    const { userId, planId, amount } = req.body;
    const result = investmentEngine.createInvestment(userId, planId, Number(amount));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/investments/:id/claim', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const result = investmentEngine.claimProfit(id, userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // 6. DEPOSITS
  app.get('/api/deposits/:userId', (req, res) => {
    const { userId } = req.params;
    const userDeposits = Array.from(db.deposits.values()).filter(d => d.userId === userId);
    res.json({ success: true, deposits: userDeposits });
  });

  app.post('/api/deposits/create', (req, res) => {
    const { userId, amount, method, phoneOrEntity, bankAccount, proofDocumentUrl } = req.body;
    if (!proofDocumentUrl || String(proofDocumentUrl).trim() === '') {
      return res.status(400).json({ success: false, message: 'É obrigatório anexar o comprovativo de pagamento bancário (PDF ou Imagem) para prosseguir.' });
    }
    const result = investmentEngine.createDeposit(userId, Number(amount), method, phoneOrEntity, bankAccount, proofDocumentUrl);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Sandbox instant confirm deposit for testing
  app.post('/api/deposits/:id/sandbox-confirm', (req, res) => {
    const { id } = req.params;
    const result = investmentEngine.approveDeposit(id, 'usr-admin-001', 'Confirmado instantaneamente via Simulador Sandbox Multicaixa', getClientIp(req));
    res.json(result);
  });

  // Admin Deposits
  app.get('/api/admin/deposits', (req, res) => {
    res.json({
      success: true,
      deposits: Array.from(db.deposits.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  });

  app.post('/api/admin/deposits/:id/approve', (req, res) => {
    const { id } = req.params;
    const { adminId, note } = req.body;
    const result = investmentEngine.approveDeposit(id, adminId || 'usr-admin-001', note, getClientIp(req));
    res.json(result);
  });

  app.post('/api/admin/deposits/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const dep = db.deposits.get(id);
    if (!dep) return res.status(404).json({ success: false, message: 'Depósito não encontrado.' });

    dep.status = 'rejected';
    dep.adminNote = reason || 'Comprovativo ilegível ou referência não conciliada no banco.';
    res.json({ success: true, deposit: dep });
  });

  // 7. WITHDRAWALS (LEVANTAMENTOS)
  app.get('/api/withdrawals/:userId', (req, res) => {
    const { userId } = req.params;
    const userWithdrawals = Array.from(db.withdrawals.values()).filter(w => w.userId === userId);
    res.json({ success: true, withdrawals: userWithdrawals });
  });

  app.post('/api/withdrawals/create', (req, res) => {
    const { userId, amount, bankName, accountNumber, iban, holderName, note } = req.body;
    const result = investmentEngine.createWithdrawal(userId, {
      amount: Number(amount),
      bankName,
      accountNumber,
      iban,
      holderName,
      note
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Admin Withdrawals
  app.get('/api/admin/withdrawals', (req, res) => {
    res.json({
      success: true,
      withdrawals: Array.from(db.withdrawals.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  });

  app.post('/api/admin/withdrawals/:id/mark-paid', (req, res) => {
    const { id } = req.params;
    const { adminId, bankProofRef, note } = req.body;
    const result = investmentEngine.markWithdrawalPaid(id, adminId || 'usr-admin-001', bankProofRef, note, getClientIp(req));
    res.json(result);
  });

  app.post('/api/admin/withdrawals/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const wd = db.withdrawals.get(id);
    if (!wd) return res.status(404).json({ success: false, message: 'Levantamento não encontrado.' });

    wd.status = 'rejected';
    wd.adminNote = reason || 'Dados bancários incorretos ou inconsistentes.';

    // Refund locked balance to user's available balance
    const wallet = db.wallets.get(wd.userId);
    if (wallet) {
      wallet.lockedBalance = Math.max(0, wallet.lockedBalance - wd.amount);
      wallet.availableBalance += wd.amount;
      wallet.updatedAt = new Date().toISOString();
    }

    res.json({ success: true, withdrawal: wd });
  });

  // 8. KWANZACOIN (KC) & CONVERSIONS
  app.get('/api/kwanzacoin/rate', (req, res) => {
    res.json({
      success: true,
      kcRate: db.kcRate
    });
  });

  app.post('/api/kwanzacoin/swap', (req, res) => {
    const { userId, fromCurrency, amount } = req.body;
    const result = investmentEngine.swapKwanzaCoin(userId, fromCurrency, Number(amount));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // 9. MINING BOOST ACCELERATOR & LIVE HASHRATE TIERS
  app.get('/api/mining/tiers', (req, res) => {
    res.json({
      success: true,
      tiers: db.miningBoostTiers
    });
  });

  app.post('/api/mining/upgrade-boost', (req, res) => {
    const { userId, targetLevel } = req.body;
    if (!userId || !targetLevel) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos.' });
    }

    const result = investmentEngine.upgradeMiningBoost(userId, Number(targetLevel));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.get('/api/mining/status/:userId', (req, res) => {
    const { userId } = req.params;
    const user = db.users.get(userId);
    const wallet = db.wallets.get(userId);
    if (!user || !wallet) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    const boostLevel = user.miningBoostLevel || wallet.miningBoostLevel || 1;
    const tier = db.miningBoostTiers.find(t => t.level === boostLevel) || db.miningBoostTiers[0];
    const multiplier = tier.multiplier;

    // Calculate active mining metrics
    const userActiveInvs = Array.from(db.investments.values()).filter(i => i.userId === userId && i.status === 'active');
    let totalYieldPerSecAoa = 0;
    let totalYieldPerSecKc = 0;

    userActiveInvs.forEach(inv => {
      const plan = db.investmentPlans.find(p => p.id === inv.planId);
      const dailyRate = plan ? plan.dailyRatePercent : 1.2;
      const miningPerHour = inv.miningRatePerHour || 0.1;

      totalYieldPerSecAoa += ((inv.amount * (dailyRate / 100)) / 86400) * multiplier;
      totalYieldPerSecKc += ((miningPerHour / 3600)) * multiplier;
    });

    res.json({
      success: true,
      boostLevel,
      tier,
      multiplier,
      hashrate: tier.hashrate,
      activeInvestmentsCount: userActiveInvs.length,
      totalCapitalActiveAoa: userActiveInvs.reduce((acc, i) => acc + i.amount, 0),
      liveAoaRatePerSec: totalYieldPerSecAoa,
      liveKcRatePerSec: totalYieldPerSecKc,
      blocksSolvedTotal: 1420 + (boostLevel * 380),
      blockDifficulty: '48.24 T',
      activeNodes: [
        { id: 'AO-NODE-01', location: 'Luanda Datacenter Hub', status: 'optimal', latency: '4ms' },
        { id: 'AO-NODE-02', location: 'Benguela Solar Farm', status: 'optimal', latency: '8ms' },
        { id: 'AO-NODE-03', location: 'Soyo Hydro Mining Unit', status: boostLevel >= 2 ? 'turbo' : 'standby', latency: '6ms' },
        { id: 'AO-NODE-04', location: 'Cabinda Offshore Supernode', status: boostLevel >= 3 ? 'quantum' : 'offline', latency: '12ms' }
      ]
    });
  });

  app.post('/api/admin/kwanzacoin/rate', (req, res) => {
    const { newRateAoa, source, change24h } = req.body;
    if (!newRateAoa || Number(newRateAoa) <= 0) {
      return res.status(400).json({ success: false, message: 'Taxa inválida.' });
    }

    db.kcRate.rateAoa = Number(newRateAoa);
    db.kcRate.effectiveFrom = new Date().toISOString();
    if (source) db.kcRate.source = source;
    if (change24h !== undefined) db.kcRate.change24h = Number(change24h);

    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'usr-admin-001',
      adminEmail: 'admin@kwanzacoin.ao',
      action: 'UPDATE_KC_EXCHANGE_RATE',
      targetResource: 'KwanzaCoin Rate Engine',
      details: `Taxa ajustada para 1 KC = ${newRateAoa} AOA`,
      ipAddress: getClientIp(req),
      createdAt: new Date().toISOString()
    };
    db.auditLogs.unshift(log);


    supabaseSync.syncKcRate(db.kcRate);
    supabaseSync.syncAuditLog(log);

    investmentEngine.broadcast({
      type: 'KC_RATE_UPDATE',
      kcRate: db.kcRate
    });

    res.json({ success: true, kcRate: db.kcRate });
  });

  // 9. KYC VERIFICATION
  app.get('/api/kyc/:userId', (req, res) => {
    const { userId } = req.params;
    const kyc = Array.from(db.kycRequests.values()).find(k => k.userId === userId);
    res.json({ success: true, kyc: kyc || null });
  });

  app.post('/api/kyc/submit', (req, res) => {
    const { userId, fullName, birthDate, phone, docType, docNumber, bankIban } = req.body;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });

    const kycId = `kyc-${Date.now()}`;
    const newKyc = {
      id: kycId,
      userId,
      userName: user.name,
      userEmail: user.email,
      fullName: fullName || user.name,
      birthDate: birthDate || '1990-01-01',
      phone: phone || user.phone,
      docType: docType || 'bi',
      docNumber: docNumber || '009845123LA031',
      docFrontUrl: '/assets/kyc_doc_front.png',
      docBackUrl: '/assets/kyc_doc_back.png',
      selfieUrl: '/assets/kyc_selfie.png',
      bankIban: bankIban || 'AO06 0040 ...',
      status: 'in_review' as const,
      submittedAt: new Date().toISOString()
    };

    db.kycRequests.set(kycId, newKyc);
    user.kycStatus = 'in_review';

    supabaseSync.syncKyc(newKyc);
    supabaseSync.syncUser(user);

    res.json({ success: true, kyc: newKyc });
  });

  // Admin KYC
  app.get('/api/admin/kyc', (req, res) => {
    res.json({
      success: true,
      kycRequests: Array.from(db.kycRequests.values()).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    });
  });

  app.post('/api/admin/kyc/:id/review', (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const kyc = db.kycRequests.get(id);
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC não encontrado.' });

    kyc.status = status;
    kyc.reviewedAt = new Date().toISOString();
    kyc.rejectionReason = reason;

    const user = db.users.get(kyc.userId);
    if (user) {
      user.kycStatus = status;
      supabaseSync.syncUser(user);
    }
    supabaseSync.syncKyc(kyc);

    res.json({ success: true, kyc });
  });

  // 10. ADMIN USERS & AUDIT LOGS
  app.get('/api/admin/users', (req, res) => {
    const userList = Array.from(db.users.values()).map(u => ({
      ...u,
      wallet: db.wallets.get(u.id),
      investmentsCount: Array.from(db.investments.values()).filter(i => i.userId === u.id).length
    }));
    res.json({ success: true, users: userList });
  });

  app.post('/api/admin/users/:id/toggle-premium', (req, res) => {
    const { id } = req.params;
    const user = db.users.get(id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });

    user.membershipLevel = user.membershipLevel === 'premium' ? 'normal' : 'premium';
    supabaseSync.syncUser(user);
    res.json({ success: true, user });
  });

  app.post('/api/admin/users/:id/toggle-status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = db.users.get(id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });

    user.status = status;
    supabaseSync.syncUser(user);
    res.json({ success: true, user });
  });

  app.post('/api/admin/users/:id/adjust-balance', (req, res) => {
    const { id } = req.params;
    const { amount, currency, type, reason, adminId } = req.body;
    const result = investmentEngine.adjustUserBalance(id, Number(amount), currency, type, reason, adminId, getClientIp(req));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/admin/users/:id/update-role', (req, res) => {
    const { id } = req.params;
    const { role, adminId } = req.body;
    const result = investmentEngine.updateUserRole(id, role, adminId, getClientIp(req));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/admin/broadcast', (req, res) => {
    const { title, message, adminId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Título e mensagem são obrigatórios.' });
    }
    const result = investmentEngine.broadcastSystemNotification(title, message, adminId, getClientIp(req));
    res.json(result);
  });

  app.get('/api/admin/settings', (req, res) => {
    res.json({ success: true, settings: db.systemSettings });
  });

  app.post('/api/admin/settings', (req, res) => {
    const { settings, adminId } = req.body;
    const result = investmentEngine.updateSystemSettings(settings, adminId, getClientIp(req));
    res.json(result);
  });

  app.get('/api/admin/audit-logs', (req, res) => {
    res.json({ success: true, logs: db.auditLogs });
  });

  // 10. REALTIME COMMUNITY CHAT ROOM
  app.get('/api/chat', (req, res) => {
    res.json({ success: true, messages: db.chatMessages.slice().reverse() });
  });

  app.post('/api/chat/send', (req, res) => {
    const { userId, message, imageUrl, audioUrl, isDirectAdmin } = req.body;
    const result = investmentEngine.sendChatMessage(userId, message, { imageUrl, audioUrl, isDirectAdmin });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // 11. NOTIFICATIONS
  app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    const notifs = db.notifications.filter(n => n.userId === userId);
    res.json({ success: true, notifications: notifs });
  });

  app.post('/api/notifications/mark-all-read', (req, res) => {
    const { userId } = req.body;
    for (const n of db.notifications) {
      if (n.userId === userId) {
        n.read = true;
      }
    }
    res.json({ success: true });
  });

  // 12. RESET SANDBOX DATA
  app.post('/api/dev/reset-sandbox', (req, res) => {
    // Re-seed db
    res.json({ success: true, message: 'Ambiente Sandbox pronto para novos testes.' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KwanzaCoin Core Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
