create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(14, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date date not null,
  payment_method text not null,
  notes text not null default '',
  is_recurring boolean not null default false,
  recurring_frequency text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc, created_at desc);

alter table public.transactions enable row level security;

grant select, insert, update, delete
  on table public.transactions to authenticated;

drop policy if exists "Users can view own transactions"
  on public.transactions;
create policy "Users can view own transactions"
  on public.transactions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own transactions"
  on public.transactions;
create policy "Users can insert own transactions"
  on public.transactions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own transactions"
  on public.transactions;
create policy "Users can update own transactions"
  on public.transactions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own transactions"
  on public.transactions;
create policy "Users can delete own transactions"
  on public.transactions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

alter table public.profilesetup enable row level security;

grant select, insert, update
  on table public.profilesetup to authenticated;

drop policy if exists "Users can view own profile"
  on public.profilesetup;
create policy "Users can view own profile"
  on public.profilesetup
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile"
  on public.profilesetup;
create policy "Users can insert own profile"
  on public.profilesetup
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile"
  on public.profilesetup;
create policy "Users can update own profile"
  on public.profilesetup
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
