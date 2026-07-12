-- ─── Users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id bigserial primary key,
  telegram_id bigint unique not null,
  username text,
  sip_enabled boolean default false,
  sip_salt text,
  sip_hash text,
  security_mode text default 'standard',
  custom_strategy text,
  private_trading_enabled boolean default true,
  created_at timestamptz default now()
);

alter table users add column if not exists sip_enabled boolean default false;
alter table users add column if not exists sip_salt text;
alter table users add column if not exists sip_hash text;
alter table users add column if not exists security_mode text default 'standard';
alter table users add column if not exists custom_strategy text;
alter table users add column if not exists private_trading_enabled boolean default true;

-- ─── Bot Wallets (custodial) ──────────────────────────────────────────────────
create table if not exists bot_wallets (
  id bigserial primary key,
  telegram_id bigint unique not null references users(telegram_id),
  public_key text not null,
  encrypted_private_key text not null,
  wallet_uuid uuid default gen_random_uuid(),
  wallet_fingerprint text,
  status text default 'active',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table bot_wallets add column if not exists wallet_uuid uuid default gen_random_uuid();
alter table bot_wallets add column if not exists wallet_fingerprint text;
alter table bot_wallets add column if not exists status text default 'active';
alter table bot_wallets add column if not exists updated_at timestamptz default now();

create table if not exists archived_bot_wallets (
  id bigserial primary key,
  telegram_id bigint not null references users(telegram_id),
  public_key text not null,
  encrypted_private_key text not null,
  wallet_uuid uuid,
  wallet_fingerprint text,
  archived_at timestamptz default now(),
  archive_reason text
);
create index if not exists idx_archived_bot_wallets_telegram on archived_bot_wallets(telegram_id);

-- ─── Connected Wallets (non-custodial) ───────────────────────────────────────
create table if not exists connected_wallets (
  id bigserial primary key,
  telegram_id bigint unique not null references users(telegram_id),
  public_key text not null,
  connected_at timestamptz default now()
);

-- ─── Trading Sessions ─────────────────────────────────────────────────────────
create table if not exists trading_sessions (
  id bigserial primary key,
  telegram_id bigint unique not null references users(telegram_id),
  strategy text not null,
  config jsonb not null,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Trade Logs ───────────────────────────────────────────────────────────────
create table if not exists trade_logs (
  id bigserial primary key,
  telegram_id bigint not null references users(telegram_id),
  strategy text not null,
  type text not null,          -- 'buy' | 'sell'
  token_mint text not null,
  amount_sol numeric,
  tx_signature text,
  status text not null,        -- 'success' | 'failed'
  error text,
  created_at timestamptz default now()
);

-- Index للبحث السريع
create index if not exists idx_trade_logs_telegram on trade_logs(telegram_id);
create index if not exists idx_trade_logs_created on trade_logs(created_at desc);

-- ─── Trial Records (24h free trial, keyed by handle + wallet) ────────────────
create table if not exists trial_records (
  id bigserial primary key,
  telegram_id bigint not null,
  telegram_username text,
  wallet_address text,
  started_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists idx_trial_username on trial_records(telegram_username);
create index if not exists idx_trial_wallet on trial_records(wallet_address);

-- ─── Subscriptions (paid access after trial) ─────────────────────────────────
create table if not exists subscriptions (
  id bigserial primary key,
  telegram_id bigint unique not null references users(telegram_id),
  is_active boolean default false,
  tier text default 'standard',   -- 'standard' (10%) | 'encrypted' (15%, ZK proof per settlement)
  promo_code text,
  promo_expires_at timestamptz,
  referral_code text,
  access_reason text,
  activated_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz default now()
);

alter table subscriptions add column if not exists promo_code text;
alter table subscriptions add column if not exists promo_expires_at timestamptz;
alter table subscriptions add column if not exists referral_code text;
alter table subscriptions add column if not exists access_reason text;

create table if not exists promo_redemptions (
  id bigserial primary key,
  telegram_id bigint not null references users(telegram_id),
  code text not null,
  free_days integer not null default 0,
  fee_discount_percent numeric not null default 0,
  expires_at timestamptz not null,
  redeemed_at timestamptz default now(),
  unique (telegram_id, code)
);
create index if not exists idx_promo_redemptions_telegram on promo_redemptions(telegram_id);

create table if not exists referral_events (
  id bigserial primary key,
  inviter_telegram_id bigint not null references users(telegram_id),
  invited_telegram_id bigint not null references users(telegram_id),
  reward_days integer not null default 0,
  welcome_days integer not null default 0,
  created_at timestamptz default now(),
  unique (inviter_telegram_id, invited_telegram_id)
);
create index if not exists idx_referral_events_inviter on referral_events(inviter_telegram_id);

-- ─── PnL Records (for fee calculation — % of realized profit to creator) ────
create table if not exists pnl_records (
  id bigserial primary key,
  telegram_id bigint not null references users(telegram_id),
  token_mint text not null,
  pnl_sol numeric not null,
  fee_owed_sol numeric default 0,
  fee_percent_applied numeric default 10,
  tier text default 'standard',
  settled boolean default false,
  settlement_tx text,
  proof_id text,
  proof_hash text,
  created_at timestamptz default now()
);
create index if not exists idx_pnl_telegram on pnl_records(telegram_id);
create index if not exists idx_pnl_settled on pnl_records(settled);

-- RLS - كل مستخدم يشوف بياناته بس (optional)
alter table users enable row level security;
alter table bot_wallets enable row level security;
alter table trade_logs enable row level security;
alter table pnl_records enable row level security;
