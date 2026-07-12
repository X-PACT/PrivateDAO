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

grant select, insert, update, delete on table promo_redemptions to service_role;
grant select, insert, update, delete on table referral_events to service_role;
grant usage, select on sequence promo_redemptions_id_seq to service_role;
grant usage, select on sequence referral_events_id_seq to service_role;
