alter table promo_redemptions add column if not exists wallet_public_key text;
create index if not exists idx_promo_redemptions_code on promo_redemptions(code);
create index if not exists idx_promo_redemptions_wallet on promo_redemptions(wallet_public_key);

create table if not exists community_groups (
  chat_id bigint primary key,
  title text,
  username text,
  created_by bigint,
  status text not null default 'active',
  notify_pdao boolean not null default true,
  welcome_enabled boolean not null default true,
  anti_spam_enabled boolean not null default true,
  raid_template text,
  last_notified_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists community_events (
  id bigserial primary key,
  chat_id bigint not null,
  telegram_id bigint,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_community_events_chat on community_events(chat_id, created_at desc);
create index if not exists idx_community_events_type on community_events(event_type, created_at desc);

create table if not exists community_mutes (
  chat_id bigint not null,
  telegram_id bigint not null,
  mute_until timestamptz not null,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (chat_id, telegram_id)
);

grant select, insert, update, delete on table community_groups to service_role;
grant select, insert, update, delete on table community_events to service_role;
grant select, insert, update, delete on table community_mutes to service_role;
grant usage, select on sequence community_events_id_seq to service_role;
