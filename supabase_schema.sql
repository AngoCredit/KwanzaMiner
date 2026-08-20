-- ============================================================
-- KWANZACOIN — SUPABASE SCHEMA COMPLETO
-- Projecto: https://oitsccxzfyijhedxkcoi.supabase.co
-- Execute no SQL Editor do Supabase
-- ============================================================

-- USERS
create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  birth_date text,
  age integer,
  avatar text,
  auth_provider text default 'email',
  role text default 'user',
  membership_level text default 'normal',
  status text default 'active',
  kyc_status text default 'unverified',
  two_factor_enabled boolean default false,
  mining_boost_level integer default 1,
  mining_boost_multiplier numeric default 1.0,
  bank_name text, bank_account_number text, bank_iban text, bank_holder_name text,
  kyc_document_number text,
  created_at timestamptz default now(),
  last_login timestamptz
);

-- WALLETS
create table if not exists wallets (
  user_id text primary key references users(id) on delete cascade,
  total_balance numeric default 0,
  available_balance numeric default 0,
  invested_balance numeric default 0,
  accumulated_profit numeric default 0,
  kwanza_coin_balance numeric default 0,
  mining_boost_level integer default 1,
  mining_multiplier numeric default 1.0,
  locked_balance numeric default 0,
  updated_at timestamptz default now()
);

-- INVESTMENT PLANS
create table if not exists investment_plans (
  id text primary key,
  name text not null,
  description text,
  minimum_amount numeric not null,
  maximum_amount numeric not null,
  duration_days integer not null,
  return_rate_percent numeric not null,
  daily_rate_percent numeric not null,
  mining_rate_per_hour numeric default 0.1,
  kwanza_coin_rate_percent numeric default 5,
  active boolean default true,
  is_popular boolean default false,
  tag text, icon_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INVESTMENTS
create table if not exists investments (
  id text primary key,
  user_id text not null references users(id),
  user_name text,
  plan_id text not null references investment_plans(id),
  plan_name text,
  amount numeric not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  current_profit numeric default 0,
  total_expected_profit numeric default 0,
  accumulated_kc numeric default 0,
  mining_rate_per_hour numeric default 0.1,
  return_rate_percent numeric default 0,
  status text default 'active',
  last_calculated_at timestamptz default now(),
  claimed_profit numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DEPOSITS
create table if not exists deposits (
  id text primary key,
  user_id text not null references users(id),
  user_name text, user_email text,
  amount numeric not null,
  method text not null,
  reference text, phone_or_entity text, bank_account text, proof_document_url text,
  status text default 'pending',
  admin_note text,
  created_at timestamptz default now(),
  approved_at timestamptz,
  approved_by text
);

-- WITHDRAWALS
create table if not exists withdrawals (
  id text primary key,
  user_id text not null references users(id),
  user_name text, user_email text,
  user_membership text default 'normal',
  amount numeric not null,
  bank_name text, account_number text, iban text, holder_name text, note text,
  status text default 'pending',
  estimated_processing_time text, bank_proof_ref text, proof_url text,
  admin_note text, paid_by text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- KYC VERIFICATIONS
create table if not exists kyc_verifications (
  id text primary key,
  user_id text not null references users(id),
  user_name text, user_email text, full_name text, birth_date text, phone text,
  doc_type text default 'bi', doc_number text,
  doc_front_url text, doc_back_url text, selfie_url text, bank_iban text,
  status text default 'in_review',
  rejection_reason text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz, reviewed_by text
);

-- LEDGER TRANSACTIONS
create table if not exists ledger_transactions (
  id text primary key,
  user_id text not null references users(id),
  user_name text,
  type text not null,
  amount numeric not null,
  currency text default 'AOA',
  balance_before numeric default 0,
  balance_after numeric default 0,
  reference text, description text,
  status text default 'completed',
  metadata jsonb,
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
  id text primary key,
  user_id text not null references users(id),
  title text not null, message text,
  type text default 'system',
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- AUDIT LOGS
create table if not exists audit_logs (
  id text primary key,
  admin_id text not null,
  admin_email text, action text not null,
  target_user_id text, target_resource text, details text, ip_address text,
  created_at timestamptz default now()
);

-- KC RATE (singleton)
create table if not exists kc_rate (
  id integer primary key default 1,
  rate_aoa numeric default 150.0,
  effective_from timestamptz default now(),
  source text, circulating_supply numeric default 0,
  total_mined numeric default 0, treasury_backing_aoa numeric default 0, change_24h numeric default 0,
  constraint kc_rate_singleton check (id = 1)
);

-- MINING BOOST TIERS
create table if not exists mining_boost_tiers (
  level integer primary key,
  name text not null, tag text, hashrate text,
  multiplier numeric default 1.0,
  kc_cost numeric default 0,
  description text, features jsonb, power_efficiency text,
  is_popular boolean default false
);
