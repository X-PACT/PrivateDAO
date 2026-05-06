create extension if not exists "pgcrypto";

create table if not exists public.operation_receipts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  operation_type text not null,
  proposal_id text not null,
  dao_address text,
  approval_state text not null,
  execution_reference text not null,
  private_settlement_rail text not null,
  stablecoin_symbol text not null,
  audit_mode text not null,
  recipient_visibility text not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.governance_receipts (
  id uuid primary key default gen_random_uuid(),
  proposal_id text not null,
  operation_type text not null,
  asset text not null,
  amount text not null,
  recipient text not null,
  rail text not null,
  tx_hash text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cloak_delivery_state (
  id uuid primary key default gen_random_uuid(),
  rail text not null,
  operation_type text not null,
  asset text not null,
  amount text not null,
  recipient text not null,
  memo text not null,
  audit_mode text not null,
  recipient_visibility text not null,
  response_status text not null,
  created_at timestamptz not null default now()
);

create index if not exists operation_receipts_created_at_idx
  on public.operation_receipts (created_at desc);

create index if not exists operation_receipts_proposal_id_idx
  on public.operation_receipts (proposal_id);

create index if not exists governance_receipts_created_at_idx
  on public.governance_receipts (created_at desc);

create index if not exists governance_receipts_proposal_id_idx
  on public.governance_receipts (proposal_id);

create index if not exists cloak_delivery_state_created_at_idx
  on public.cloak_delivery_state (created_at desc);

do $$
begin
  begin
    alter publication supabase_realtime add table public.operation_receipts;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.governance_receipts;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.cloak_delivery_state;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end $$;

alter table public.operation_receipts enable row level security;
alter table public.governance_receipts enable row level security;
alter table public.cloak_delivery_state enable row level security;

grant select, insert on public.operation_receipts to anon;
grant select, insert on public.governance_receipts to anon;
grant select, insert on public.cloak_delivery_state to anon;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'operation_receipts'
      and policyname = 'operation_receipts_select'
  ) then
    create policy operation_receipts_select
      on public.operation_receipts
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'governance_receipts'
      and policyname = 'governance_receipts_select'
  ) then
    create policy governance_receipts_select
      on public.governance_receipts
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'governance_receipts'
      and policyname = 'governance_receipts_insert'
  ) then
    create policy governance_receipts_insert
      on public.governance_receipts
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cloak_delivery_state'
      and policyname = 'cloak_delivery_state_select'
  ) then
    create policy cloak_delivery_state_select
      on public.cloak_delivery_state
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cloak_delivery_state'
      and policyname = 'cloak_delivery_state_insert'
  ) then
    create policy cloak_delivery_state_insert
      on public.cloak_delivery_state
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'operation_receipts'
      and policyname = 'operation_receipts_insert'
  ) then
    create policy operation_receipts_insert
      on public.operation_receipts
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
