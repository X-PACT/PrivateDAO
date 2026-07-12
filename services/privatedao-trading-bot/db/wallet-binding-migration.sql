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

grant select, insert, update, delete on table bot_wallets to service_role;
grant select, insert, update, delete on table archived_bot_wallets to service_role;
grant usage, select on sequence archived_bot_wallets_id_seq to service_role;
